const TelegramBot = require('node-telegram-bot-api');
const prisma = require('../config/db');

const token = process.env.TELEGRAM_BOT_TOKEN;
const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'WorkStudyBot';

// In-memory store: code -> { userId, expiresAt }
const linkCodes = new Map();

let bot = null;

if (token) {
  bot = new TelegramBot(token, {
    polling: {
      autoStart: false,
      interval: 2000,           // опрос каждые 2 секунды
      params: { timeout: 0 },   // short polling: запрос завершается мгновенно
    },                          // → нет висячих соединений → нет 409
  });

  bot.on('polling_error', (err) => {
    console.error('[Telegram] Polling error:', err.message);
  });

  // ── Команда /start ───────────────────────────────────────────────────────
  bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const chatId = String(msg.chat.id);
    const code = match[1]?.trim().toUpperCase();

    if (!code) {
      return bot.sendMessage(
        chatId,
        '👋 <b>Привет! Я бот Work&Study.</b>\n\nЧтобы получать уведомления о статусе заявок, перейди на сайт в раздел <b>Профиль</b> и нажми «Подключить Telegram».',
        { parse_mode: 'HTML' }
      );
    }

    const entry = linkCodes.get(code);
    if (!entry) {
      return bot.sendMessage(chatId, '❌ Код не найден или уже использован. Сгенерируй новый в профиле.');
    }
    if (Date.now() > entry.expiresAt) {
      linkCodes.delete(code);
      return bot.sendMessage(chatId, '⏰ Код истёк (действует 5 минут). Сгенерируй новый в профиле.');
    }

    try {
      await prisma.user.update({
        where: { id: entry.userId },
        data: { telegramId: chatId },
      });
      linkCodes.delete(code);
      bot.sendMessage(
        chatId,
        '✅ <b>Telegram успешно подключён к Work&Study!</b>\n\nТеперь ты будешь получать уведомления:\n• Статус заявок на стажировки\n• Ответы от поддержки',
        { parse_mode: 'HTML' }
      );
    } catch (err) {
      console.error('[Telegram] Ошибка привязки:', err);
      bot.sendMessage(chatId, '❌ Произошла ошибка. Попробуй снова.');
    }
  });

  // ── Команда /help ────────────────────────────────────────────────────────
  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      '📋 <b>Work&Study Bot</b>\n\n/start — подключить аккаунт\n/help — справка',
      { parse_mode: 'HTML' }
    );
  });

  bot.startPolling()
    .then(() => console.log('[Telegram] Бот запущен'))
    .catch(err => console.error('[Telegram] Ошибка запуска:', err.message));

  // ── Graceful shutdown ────────────────────────────────────────────────────
  // nodemon шлёт SIGUSR2, обычный Ctrl+C — SIGINT, Docker/PM2 — SIGTERM
  const stopBot = () => {
    if (bot) {
      bot.stopPolling()
        .then(() => console.log('[Telegram] Polling остановлен'))
        .catch(() => {});
    }
  };

  process.once('SIGINT',  stopBot);
  process.once('SIGTERM', stopBot);
  process.once('SIGUSR2', () => { stopBot(); process.kill(process.pid, 'SIGUSR2'); }); // nodemon

} else {
  console.warn('[Telegram] TELEGRAM_BOT_TOKEN не задан — бот отключён');
}

// ── Публичный API ─────────────────────────────────────────────────────────────

const generateLinkCode = (userId) => {
  for (const [code, entry] of linkCodes.entries()) {
    if (entry.userId === userId || Date.now() > entry.expiresAt) {
      linkCodes.delete(code);
    }
  }
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  linkCodes.set(code, { userId, expiresAt: Date.now() + 5 * 60 * 1000 });
  return code;
};

const sendMessage = async (telegramId, text) => {
  if (!bot || !telegramId) return;
  try {
    await bot.sendMessage(telegramId, text, { parse_mode: 'HTML' });
  } catch (err) {
    console.error(`[Telegram] Ошибка отправки (chatId=${telegramId}):`, err.message);
  }
};

module.exports = { generateLinkCode, sendMessage, botUsername };
