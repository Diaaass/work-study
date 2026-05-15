const prisma = require('../../config/db');
const { sendSupportNotification, sendAdminReply } = require('../../services/email.service');
const { sendMessage } = require('../../services/telegram.service');
const { create: notify } = require('../notifications/notification.service');

const create = async ({ subject, message }, userId) => {
  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
  if (!user) throw new Error('Пользователь не найден');

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: parseInt(userId),
      subject: subject.trim(),
      message: message.trim(),
    },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  // Email-уведомление администратору (fire-and-forget)
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    sendSupportNotification(adminEmail, ticket)
      .catch(err => console.error('[Support] Ошибка email-уведомления:', err.message));
  }

  // Уведомление всем администраторам в системе
  const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true, telegramId: true } });
  await Promise.all(admins.map(a => notify(a.id, {
    type: 'new_ticket',
    title: 'Новый тикет поддержки',
    body: `От ${ticket.user.name}: ${ticket.subject}`,
    link: '/admin/support',
  })));

  // Telegram-уведомление администратору (если у него привязан аккаунт)
  const admin = admins.find(a => a.telegramId);
  if (admin?.telegramId) {
    const roleLabel = { student: 'Студент', hr: 'HR', admin: 'Админ' }[ticket.user.role] || ticket.user.role;
    await sendMessage(
      admin.telegramId,
      `📩 <b>Новый тикет #${ticket.id}</b>\n\nОт: ${ticket.user.name} (${roleLabel})\nТема: <b>${ticket.subject}</b>\n\n${ticket.message.slice(0, 300)}${ticket.message.length > 300 ? '...' : ''}`
    );
  }

  return ticket;
};

const getAll = async ({ status } = {}) => {
  const where = status ? { status } : {};
  return prisma.supportTicket.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getMy = async (userId) => {
  return prisma.supportTicket.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
  });
};

const reply = async (id, { adminReply, status }) => {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: parseInt(id) },
    include: { user: { select: { name: true, email: true, telegramId: true } } },
  });
  if (!ticket) throw new Error('Тикет не найден');

  const updated = await prisma.supportTicket.update({
    where: { id: parseInt(id) },
    data: {
      adminReply: adminReply?.trim() || ticket.adminReply,
      status: status || ticket.status,
    },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  // Email-ответ пользователю
  if (adminReply?.trim()) {
    await sendAdminReply(ticket.user.email, ticket.user.name, ticket.subject, adminReply.trim())
      .catch(err => console.error('[Support] Ошибка email-ответа:', err.message));
  }

  // Уведомление пользователю в системе
  if (adminReply?.trim()) {
    await notify(ticket.userId, {
      type: 'support_reply',
      title: 'Ответ на ваш тикет',
      body: `Администратор ответил на тему «${ticket.subject}»`,
      link: '/support',
    });
  }

  // Telegram-уведомление пользователю
  if (adminReply?.trim() && ticket.user.telegramId) {
    await sendMessage(
      ticket.user.telegramId,
      `💬 <b>Ответ на ваш тикет</b>\n\nТема: ${ticket.subject}\n\n${adminReply.trim()}`
    );
  }

  return updated;
};

module.exports = { create, getAll, getMy, reply };
