const Application = require('./application.model');
const Internship = require('../internships/internship.model');

const apply = async ({ internshipId, coverLetter }, userId) => {
  const internship = await Internship.findById(internshipId);
  if (!internship) throw new Error('Стажировка не найдена');
  if (internship.status !== 'published') throw new Error('Стажировка недоступна');

  const existing = await Application.findOne({ student: userId, internship: internshipId });
  if (existing) throw new Error('Вы уже подали заявку на эту стажировку');

  const activeCount = await Application.countDocuments({ student: userId, status: 'pending' });
  if (activeCount >= 5) throw new Error('Максимум 5 активных заявок');

  return Application.create({
    student: userId,
    internship: internshipId,
    coverLetter
  });
};

const getMyApplications = async (userId) => {
  return Application.find({ student: userId })
    .populate('internship', 'title company city status');
};

const getInternshipApplications = async (internshipId, userId) => {
  const internship = await Internship.findById(internshipId);
  if (!internship) throw new Error('Стажировка не найдена');
  if (internship.postedBy.toString() !== userId) throw new Error('Нет доступа');

  return Application.find({ internship: internshipId })
    .populate('student', 'name email profile');
};

const updateStatus = async (id, { status, feedback }, userId) => {
  const application = await Application.findById(id)
    .populate('internship');
  if (!application) throw new Error('Заявка не найдена');
  if (application.internship.postedBy.toString() !== userId) throw new Error('Нет доступа');

  return Application.findByIdAndUpdate(
    id,
    { status, feedback },
    { returnDocument: 'after' }
  );
};

module.exports = { apply, getMyApplications, getInternshipApplications, updateStatus };
