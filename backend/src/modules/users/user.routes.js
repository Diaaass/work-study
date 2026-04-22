const router = require('express').Router();
const { getAll, toggleBlock, updateProfile, getTelegramLinkCode, disconnectTelegram } = require('./user.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.get('/', authMiddleware, roleMiddleware('admin'), getAll);
router.patch('/:id/block', authMiddleware, roleMiddleware('admin'), toggleBlock);
router.patch('/profile', authMiddleware, roleMiddleware('student', 'hr'), updateProfile);

// Telegram bot linking
router.post('/telegram/generate-code', authMiddleware, getTelegramLinkCode);
router.delete('/telegram/disconnect', authMiddleware, disconnectTelegram);

module.exports = router;