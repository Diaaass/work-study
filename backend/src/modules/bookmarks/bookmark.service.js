const prisma = require('../../config/db');

const getAll = async (userId) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: parseInt(userId) },
    include: {
      internship: {
        include: { postedBy: { select: { id: true, name: true, email: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return bookmarks.map(b => b.internship);
};

const getIds = async (userId) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: parseInt(userId) },
    select: { internshipId: true }
  });
  return bookmarks.map(b => b.internshipId);
};

const toggle = async (userId, internshipId) => {
  const existing = await prisma.bookmark.findUnique({
    where: { userId_internshipId: { userId: parseInt(userId), internshipId: parseInt(internshipId) } }
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false };
  }

  await prisma.bookmark.create({
    data: { userId: parseInt(userId), internshipId: parseInt(internshipId) }
  });
  return { bookmarked: true };
};

module.exports = { getAll, getIds, toggle };
