const router = require('express').Router();
const { getAll, getIds, toggle } = require('./bookmark.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.get('/',           authMiddleware, roleMiddleware('student'), getAll);
router.get('/ids',        authMiddleware, roleMiddleware('student'), getIds);
router.post('/:internshipId', authMiddleware, roleMiddleware('student'), toggle);

module.exports = router;
