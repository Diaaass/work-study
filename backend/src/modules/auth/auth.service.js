const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const emailService = require('../../services/email.service');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const expiresIn15Min = () => new Date(Date.now() + 15 * 60 * 1000);

// ─── Register ────────────────────────────────────────────────────────────────
const register = async ({ name, email, password, role, university, major, company }) => {
  console.log('[Register] Запрос получен для:', email, '| роль:', role);
  const existing = await prisma.user.findUnique({ where: { email } });

  // Если уже есть верифицированный — ошибка
  if (existing && existing.isVerified) {
    throw new Error('Пользователь с таким email уже существует');
  }

  // Если есть НЕ верифицированный — удаляем и даём зарегистрироваться заново
  if (existing && !existing.isVerified) {
    await prisma.verificationCode.deleteMany({ where: { email } });
    await prisma.user.delete({ where: { email } });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      university: university || null,
      major:      major     || null,
      company:    company   || null,
      isVerified: false,
    },
  });

  // ── Авто-верификация (когда Gmail не настроен или AUTO_VERIFY=true) ────────
  const autoVerify =
    process.env.AUTO_VERIFY === 'true' ||
    !process.env.GMAIL_USER ||
    !process.env.GMAIL_APP_PASSWORD;

  if (autoVerify) {
    await prisma.user.update({ where: { email }, data: { isVerified: true } });
    console.log(`✅ [Auto-verify] ${email} верифицирован автоматически (SMTP не настроен)`);
    return { email, autoVerified: true };
  }

  const code = generateCode();
  await prisma.verificationCode.deleteMany({ where: { email } });
  await prisma.verificationCode.create({
    data: { email, code, expiresAt: expiresIn15Min() },
  });

  // В dev-режиме всегда печатаем код — письмо может не дойти на чужой адрес
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n📧 [Dev] Код верификации для ${email}: ${code}\n`);
  }

  try {
    await emailService.sendVerificationCode(email, user.name, code);
  } catch (emailError) {
    console.error('[Email] Ошибка отправки:', emailError.message);
  }

  return { email };
};

// ─── Verify Email ────────────────────────────────────────────────────────────
const verifyEmail = async ({ email, code }) => {
  const record = await prisma.verificationCode.findFirst({
    where: { email, code },
  });

  if (!record) throw new Error('Неверный код подтверждения');
  if (record.expiresAt < new Date()) throw new Error('Код истёк. Запросите новый.');

  const user = await prisma.user.update({
    where: { email },
    data: { isVerified: true },
  });

  await prisma.verificationCode.deleteMany({ where: { email } });

  const token = generateToken(user.id);
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true, name: true, email: true, role: true,
      isBlocked: true, isVerified: true,
      avatarUrl: true, resumeUrl: true, telegramId: true,
      phone: true, bio: true, company: true, skills: true,
      university: true, major: true, gpa: true,
      graduationYear: true, cvExperience: true, cvLanguages: true,
      createdAt: true, updatedAt: true,
    },
  });
  return { token, user: fullUser };
};

// ─── Resend Verification Code ────────────────────────────────────────────────
const resendVerificationCode = async ({ email }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Пользователь не найден');
  if (user.isVerified) throw new Error('Email уже подтверждён');

  const code = generateCode();
  await prisma.verificationCode.deleteMany({ where: { email } });
  await prisma.verificationCode.create({
    data: { email, code, expiresAt: expiresIn15Min() },
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n📧 [Dev] Повторный код для ${email}: ${code}\n`);
  }
  try {
    await emailService.sendVerificationCode(email, user.name, code);
  } catch (emailError) {
    console.error('[Email] Ошибка отправки:', emailError.message);
  }
  return { message: 'Код отправлен повторно' };
};

// ─── Login ───────────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Неверный email или пароль');
  if (user.isBlocked) throw new Error('Аккаунт заблокирован');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error('Неверный email или пароль');

  if (!user.isVerified) {
    throw Object.assign(new Error('Пожалуйста, подтвердите email перед входом'), {
      code: 'EMAIL_NOT_VERIFIED',
      email,
    });
  }

  const token = generateToken(user.id);
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true, name: true, email: true, role: true,
      isBlocked: true, isVerified: true,
      avatarUrl: true, resumeUrl: true, telegramId: true,
      phone: true, bio: true, company: true, skills: true,
      university: true, major: true, gpa: true,
      graduationYear: true, cvExperience: true, cvLanguages: true,
      createdAt: true, updatedAt: true,
    },
  });
  return { token, user: fullUser };
};

// ─── Get Me ──────────────────────────────────────────────────────────────────
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true, name: true, email: true, role: true,
      isBlocked: true, isVerified: true,
      avatarUrl: true, resumeUrl: true, telegramId: true,
      phone: true, bio: true, company: true, skills: true,
      university: true, major: true, gpa: true,
      graduationYear: true, cvExperience: true, cvLanguages: true,
      createdAt: true, updatedAt: true,
    },
  });
  if (!user) throw new Error('Пользователь не найден');
  return user;
};

// ─── Forgot Password ─────────────────────────────────────────────────────────
const forgotPassword = async ({ email }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Не раскрываем существование email
  if (!user) return { message: 'Если email зарегистрирован, вы получите код' };

  const code = generateCode();
  await prisma.passwordReset.deleteMany({ where: { email } });
  await prisma.passwordReset.create({
    data: { email, code, expiresAt: expiresIn15Min() },
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n🔑 [Dev] Код сброса пароля для ${email}: ${code}\n`);
  }
  try {
    await emailService.sendPasswordResetCode(email, user.name, code);
  } catch (emailError) {
    console.error('[Email] Ошибка отправки:', emailError.message);
  }
  return { message: 'Если email зарегистрирован, вы получите код' };
};

// ─── Reset Password ──────────────────────────────────────────────────────────
const resetPassword = async ({ email, code, newPassword }) => {
  const record = await prisma.passwordReset.findFirst({ where: { email, code } });
  if (!record) throw new Error('Неверный код');
  if (record.expiresAt < new Date()) throw new Error('Код истёк. Запросите новый.');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email }, data: { password: hashedPassword } });
  await prisma.passwordReset.deleteMany({ where: { email } });

  return { message: 'Пароль успешно изменён' };
};

module.exports = {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  getMe,
  forgotPassword,
  resetPassword,
};
