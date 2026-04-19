const prisma = require('../../config/db');
const { generateLinkCode } = require('../../services/telegram.service');

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
      phone: true,
      bio: true,
      company: true,
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

// Общий select для возврата полного профиля
const PROFILE_SELECT = {
  id: true, name: true, email: true, role: true,
  isBlocked: true, isVerified: true,
  avatarUrl: true, resumeUrl: true, telegramId: true,
  phone: true, bio: true, company: true, skills: true,
  university: true, major: true, gpa: true, graduationYear: true,
  cvExperience: true, cvLanguages: true,
  createdAt: true, updatedAt: true,
};

const updateProfile = async (id, data) => {
  const updateData = {
    university:     data.university     ?? undefined,
    major:          data.major          ?? undefined,
    gpa:            data.gpa != null ? parseFloat(data.gpa) : undefined,
    skills:         data.skills !== undefined ? data.skills : undefined,
    phone:          data.phone          || null,
    bio:            data.bio            || null,
    company:        data.company        || null,
    graduationYear: data.graduationYear ? parseInt(data.graduationYear) : null,
    // CV Builder JSON fields
    cvExperience: data.cvExperience !== undefined ? data.cvExperience : undefined,
    cvLanguages:  data.cvLanguages  !== undefined ? data.cvLanguages  : undefined,
  };

  if (data.name && data.name.trim()) {
    updateData.name = data.name.trim();
  }

  return prisma.user.update({
    where: { id: parseInt(id) },
    data: updateData,
    select: PROFILE_SELECT,
  });
};

/**
 * Генерирует код для привязки Telegram и возвращает { code, botUsername }.
 */
const getTelegramLinkCode = (userId) => {
  const { botUsername } = require('../../services/telegram.service');
  const code = generateLinkCode(parseInt(userId));
  return { code, botUsername };
};

/**
 * Отвязывает Telegram от аккаунта.
 */
const disconnectTelegram = async (userId) => {
  return prisma.user.update({
    where: { id: parseInt(userId) },
    data: { telegramId: null },
    select: { id: true, telegramId: true },
  });
};

module.exports = { getAll, toggleBlock, updateProfile, getTelegramLinkCode, disconnectTelegram };
