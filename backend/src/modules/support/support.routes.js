const router = require('express').Router();
const { create, getAll, getMy, reply } = require('./support.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.post('/',     authMiddleware, create);
router.get('/my',    authMiddleware, getMy);
router.get('/',      authMiddleware, roleMiddleware('admin'), getAll);
router.patch('/:id', authMiddleware, roleMiddleware('admin'), reply);

module.exports = router;
