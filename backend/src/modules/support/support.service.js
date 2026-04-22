const prisma = require('../../config/db');
const { sendSupportNotification, sendAdminReply } = require('../../services/email.service');
const { sendMessage } = require('../../services/telegram.service');

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

  // Email-уведомление администратору
  const adminEmail = process.env.GMAIL_USER;
  if (adminEmail) {
    await sendSupportNotification(adminEmail, ticket).catch(err =>
      console.error('[Support] Ошибка email-уведомления:', err.message)
    );
  }

  // Telegram-уведомление администратору (если у него привязан аккаунт)
  const admin = await prisma.user.findFirst({
    where: { role: 'admin', telegramId: { not: null } },
    select: { telegramId: true },
  });
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
