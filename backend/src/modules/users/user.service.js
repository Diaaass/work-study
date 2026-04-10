const prisma = require('../../config/db');

const getAll = async ({ search, role }) => {
  const where = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBlocked: true,
      university: true,
      major: true,
      gpa: true,
      skills: true,
      telegramId: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

const toggleBlock = async (id) => {
  const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
  if (!user) throw new Error('Пользователь не найден');

  return prisma.user.update({
    where: { id: parseInt(id) },
    data: { isBlocked: !user.isBlocked },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBlocked: true
    }
  });
};

const updateProfile = async (id, data) => {
  return prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      university: data.university,
      major: data.major,
      gpa: data.gpa,
      skills: data.skills || [],
      telegramId: data.telegramId
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBlocked: true,
      university: true,
      major: true,
      gpa: true,
      skills: true,
      telegramId: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

module.exports = { getAll, toggleBlock, updateProfile };
