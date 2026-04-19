const router = require('express').Router();
const { create, getAll, getById, getMy, getRecommended, getStats, update, moderate } = require('./internship.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const optionalAuth  = require('../../middleware/optionalAuth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.get('/', getAll);
router.get('/my', authMiddleware, roleMiddleware('hr', 'admin'), getMy);
router.get('/recommended', getRecommended);
router.get('/:id/stats', authMiddleware, roleMiddleware('hr', 'admin'), getStats);
router.get('/:id', optionalAuth, getById);
router.post('/', authMiddleware, roleMiddleware('hr', 'admin'), create);
router.patch('/:id', authMiddleware, roleMiddleware('hr', 'admin'), update);
router.patch('/:id/moderate', authMiddleware, roleMiddleware('admin'), moderate);

module.exports = router;
