const prisma = require('../../config/db');

// ─── Внутренний хелпер — вызывается из других сервисов ───────────────────────
const create = async (userId, { type, title, body, link = null }) => {
  try {
    return await prisma.notification.create({
      data: { userId: parseInt(userId), type, title, body, link },
    });
  } catch (err) {
    // Никогда не ломаем основной флоу из-за уведомления
    console.error('[Notification] Ошибка создания:', err.message);
  }
};

// ─── GET /notifications ───────────────────────────────────────────────────────
const getMyNotifications = async (userId) => {
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId: parseInt(userId), isRead: false },
    }),
  ]);
  return { items, unreadCount };
};

// ─── PATCH /notifications/:id/read ───────────────────────────────────────────
const markRead = async (id, userId) => {
  return prisma.notification.updateMany({
    where: { id: parseInt(id), userId: parseInt(userId) },
    data: { isRead: true },
  });
};

// ─── PATCH /notifications/read-all ───────────────────────────────────────────
const markAllRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId: parseInt(userId), isRead: false },
    data: { isRead: true },
  });
};

module.exports = { create, getMyNotifications, markRead, markAllRead };
