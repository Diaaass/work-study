const router = require('express').Router();
const { create, getAll, getById, update, moderate } = require('./internship.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', authMiddleware, roleMiddleware('hr', 'admin'), create);
router.patch('/:id', authMiddleware, roleMiddleware('hr', 'admin'), update);
router.patch('/:id/moderate', authMiddleware, roleMiddleware('admin'), moderate);

module.exports = router;
