const prisma = require('../../config/db');
const { uploadAvatar, uploadResume, uploadLogo } = require('../../services/cloudinary.service');

// POST /upload/avatar — для всех авторизованных
const avatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Файл не передан' });

    const url = await uploadAvatar(req.file.buffer, req.userId);

    await prisma.user.update({
      where: { id: req.userId },
      data:  { avatarUrl: url },
    });

    res.json({ url });
  } catch (err) {
    console.error('[Upload avatar]', err);
    res.status(500).json({ message: 'Ошибка загрузки аватара' });
  }
};

// POST /upload/resume — только студент
const resume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Файл не передан' });

    const url = await uploadResume(req.file.buffer, req.userId);

    await prisma.user.update({
      where: { id: req.userId },
      data:  { resumeUrl: url },
    });

    res.json({ url });
  } catch (err) {
    console.error('[Upload resume]', err);
    res.status(500).json({ message: 'Ошибка загрузки резюме' });
  }
};

// POST /upload/logo — только HR
const logo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Файл не передан' });

    const url = await uploadLogo(req.file.buffer, `hr_${req.userId}_${Date.now()}`);

    res.json({ url });
  } catch (err) {
    console.error('[Upload logo]', err);
    res.status(500).json({ message: 'Ошибка загрузки логотипа' });
  }
};

module.exports = { avatar, resume, logo };
