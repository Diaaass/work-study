const router = require('express').Router();
const {
  apply,
  getMyApplications,
  getInternshipApplications,
  updateStatus
} = require('./application.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.post('/', authMiddleware, roleMiddleware('student'), apply);
router.get('/my', authMiddleware, roleMiddleware('student'), getMyApplications);
router.get('/internship/:internshipId', authMiddleware, roleMiddleware('hr', 'admin'), getInternshipApplications);
router.patch('/:id', authMiddleware, roleMiddleware('hr', 'admin'), updateStatus);

module.exports = router;