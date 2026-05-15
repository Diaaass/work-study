const router   = require('express').Router();
const multer   = require('multer');
const { avatar, resume, logo } = require('./upload.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Разрешены только изображения'));
  },
});

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Разрешены только PDF файлы'));
  },
});

router.post('/avatar', authMiddleware, imageUpload.single('file'), avatar);
router.post('/resume', authMiddleware, roleMiddleware('student'), pdfUpload.single('file'), resume);
router.post('/logo',   authMiddleware, roleMiddleware('hr', 'admin'), imageUpload.single('file'), logo);

module.exports = router;
