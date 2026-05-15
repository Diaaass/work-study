const router = require('express').Router();
const authenticate = require('../../middleware/auth.middleware');
const ctrl = require('./ai.controller');

router.use(authenticate);

router.get('/recommendations',  ctrl.getRecommendations);
router.post('/cover-letter',    ctrl.getCoverLetter);

module.exports = router;
