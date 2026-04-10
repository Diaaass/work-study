const prisma = require('../../config/db');

const apply = async ({ internshipId, coverLetter }, userId) => {
  const internship = await prisma.internship.findUnique({
    where: { id: parseInt(internshipId) }
  });
  if (!internship) throw new Error('Стажировка не найдена');
  if (internship.status !== 'published') throw new Error('Стажировка недоступна');

  const existing = await prisma.application.findUnique({
    where: {
      studentId_internshipId: {
        studentId: parseInt(userId),
        internshipId: parseInt(internshipId)
      }
    }
  });
  if (existing) throw new Error('Вы уже подали заявку на эту стажировку');

  const activeCount = await prisma.application.count({
    where: { studentId: parseInt(userId), status: 'pending' }
  });
  if (activeCount >= 5) throw new Error('Максимум 5 активных заявок');

  return prisma.application.create({
    data: {
      studentId: parseInt(userId),
      internshipId: parseInt(internshipId),
      coverLetter
    }
  });
};

const getMyApplications = async (userId) => {
  return prisma.application.findMany({
    where: { studentId: parseInt(userId) },
    include: {
      internship: {
        select: { id: true, title: true, company: true, city: true, status: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getInternshipApplications = async (internshipId, userId) => {
  const internship = await prisma.internship.findUnique({
    where: { id: parseInt(internshipId) }
  });
  if (!internship) throw new Error('Стажировка не найдена');
  if (internship.postedById !== parseInt(userId)) throw new Error('Нет доступа');

  return prisma.application.findMany({
    where: { internshipId: parseInt(internshipId) },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          university: true,
          major: true,
          gpa: true,
          skills: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const updateStatus = async (id, { status, feedback }, userId) => {
  const application = await prisma.application.findUnique({
    where: { id: parseInt(id) },
    include: { internship: true }
  });
  if (!application) throw new Error('Заявка не найдена');
  if (application.internship.postedById !== parseInt(userId)) throw new Error('Нет доступа');

  return prisma.application.update({
    where: { id: parseInt(id) },
    data: { status, feedback }
  });
};

module.exports = { apply, getMyApplications, getInternshipApplications, updateStatus };
