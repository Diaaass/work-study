const router = require('express').Router();
const { getAll, toggleBlock, updateProfile } = require('./user.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.get('/', authMiddleware, roleMiddleware('admin'), getAll);
router.patch('/:id/block', authMiddleware, roleMiddleware('admin'), toggleBlock);
router.patch('/profile', authMiddleware, roleMiddleware('student'), updateProfile);

module.exports = router;