const router = require('express').Router();
const authenticate = require('../../middleware/auth.middleware');
const ctrl = require('./notification.controller');

router.use(authenticate);

router.get('/',                    ctrl.getMyNotifications);
router.patch('/read-all',          ctrl.markAllRead);
router.patch('/:id/read',          ctrl.markRead);

module.exports = router;
