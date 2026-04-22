const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = `Work&Study <${process.env.GMAIL_USER}>`;

const sendMail = async (to, subject, html) => {
  await transporter.sendMail({ from: FROM, to, subject, html });
};

const sendVerificationCode = async (email, name, code) => {
  await sendMail(
    email,
    'Подтвердите ваш email — Work&Study',
    `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
      <h2 style="color:#2563eb;margin:0 0 8px">Work&Study</h2>
      <p style="color:#374151;margin:0 0 24px">Привет, <strong>${name}</strong>! Подтвердите ваш email.</p>
      <div style="background:#f3f4f6;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
        <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827">${code}</span>
      </div>
      <p style="color:#6b7280;font-size:14px;margin:0">Код действителен <strong>15 минут</strong>. Если вы не регистрировались — проигнорируйте письмо.</p>
    </div>
    `,
  );
};

const sendPasswordResetCode = async (email, name, code) => {
  await sendMail(
    email,
    'Сброс пароля — Work&Study',
    `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
      <h2 style="color:#2563eb;margin:0 0 8px">Work&Study</h2>
      <p style="color:#374151;margin:0 0 24px">Привет, <strong>${name}</strong>! Код для сброса пароля:</p>
      <div style="background:#f3f4f6;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
        <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827">${code}</span>
      </div>
      <p style="color:#6b7280;font-size:14px;margin:0">Код действителен <strong>15 минут</strong>. Если вы не запрашивали сброс — проигнорируйте письмо.</p>
    </div>
    `,
  );
};

const sendSupportNotification = async (adminEmail, ticket) => {
  const roleLabel = { student: 'Студент', hr: 'HR', admin: 'Админ' }[ticket.user.role] || ticket.user.role;
  await sendMail(
    adminEmail,
    `[Work&Study] Новый тикет #${ticket.id}: ${ticket.subject}`,
    `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
      <h2 style="color:#2563eb;margin:0 0 16px">Новое обращение в поддержку</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px">
        <tr><td style="padding:6px 0;color:#6b7280;width:120px">Тикет</td><td style="color:#111827">#${ticket.id}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Пользователь</td><td style="color:#111827">${ticket.user.name} (${roleLabel})</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="color:#111827">${ticket.user.email}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Тема</td><td style="color:#111827"><strong>${ticket.subject}</strong></td></tr>
      </table>
      <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:20px">
        <p style="margin:0;color:#374151;font-size:14px;white-space:pre-wrap">${ticket.message}</p>
      </div>
      <p style="color:#6b7280;font-size:13px;margin:0">Ответьте через панель администратора Work&Study.</p>
    </div>
    `,
  );
};

const sendAdminReply = async (userEmail, userName, subject, replyText) => {
  await sendMail(
    userEmail,
    `Re: ${subject} — Work&Study Support`,
    `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
      <h2 style="color:#2563eb;margin:0 0 8px">Work&Study</h2>
      <p style="color:#374151;margin:0 0 20px">Привет, <strong>${userName}</strong>! Мы ответили на ваше обращение.</p>
      <p style="color:#6b7280;font-size:13px;margin:0 0 8px">Тема: <strong>${subject}</strong></p>
      <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:20px">
        <p style="margin:0;color:#374151;font-size:14px;white-space:pre-wrap">${replyText}</p>
      </div>
      <p style="color:#6b7280;font-size:13px;margin:0">Если у вас остались вопросы, вы можете открыть новое обращение в разделе "Поддержка".</p>
    </div>
    `,
  );
};

module.exports = { sendVerificationCode, sendPasswordResetCode, sendSupportNotification, sendAdminReply };
