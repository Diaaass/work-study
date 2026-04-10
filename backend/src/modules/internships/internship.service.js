const prisma = require('../../config/db');

const create = async (data, userId) => {
  return prisma.internship.create({
    data: {
      title: data.title,
      company: data.company,
      description: data.description,
      requirements: data.requirements || [],
      skills: data.skills || [],
      city: data.city,
      workType: data.workType,
      salary: data.salary || 0,
      postedById: parseInt(userId)
    }
  });
};

const getAll = async ({ search, city, workType, status, skills }) => {
  const where = {};

  if (status) {
    where.status = status;
  } else {
    where.status = 'published';
  }

  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (workType) where.workType = workType;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (skills) {
    const skillList = skills.split(',').map(s => s.trim());
    where.skills = { hasSome: skillList };
  }

  return prisma.internship.findMany({
    where,
    include: {
      postedBy: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getById = async (id) => {
  const internship = await prisma.internship.findUnique({
    where: { id: parseInt(id) },
    include: {
      postedBy: {
        select: { id: true, name: true, email: true }
      }
    }
  });
  if (!internship) throw new Error('Стажировка не найдена');
  return internship;
};

const getMyInternships = async (userId) => {
  return prisma.internship.findMany({
    where: { postedById: parseInt(userId) },
    orderBy: { createdAt: 'desc' }
  });
};

const update = async (id, data, userId) => {
  const internship = await prisma.internship.findUnique({ where: { id: parseInt(id) } });
  if (!internship) throw new Error('Стажировка не найдена');
  if (internship.postedById !== parseInt(userId)) throw new Error('Нет доступа');

  return prisma.internship.update({
    where: { id: parseInt(id) },
    data: {
      title: data.title,
      company: data.company,
      description: data.description,
      requirements: data.requirements,
      skills: data.skills,
      city: data.city,
      workType: data.workType,
      salary: data.salary,
      status: data.status
    }
  });
};

const updateStatus = async (id, status, userId, userRole) => {
  const internship = await prisma.internship.findUnique({ where: { id: parseInt(id) } });
  if (!internship) throw new Error('Стажировка не найдена');

  if (userRole !== 'admin' && internship.postedById !== parseInt(userId)) {
    throw new Error('Нет доступа');
  }

  return prisma.internship.update({
    where: { id: parseInt(id) },
    data: { status }
  });
};

const remove = async (id, userId, userRole) => {
  const internship = await prisma.internship.findUnique({ where: { id: parseInt(id) } });
  if (!internship) throw new Error('Стажировка не найдена');

  if (userRole !== 'admin' && internship.postedById !== parseInt(userId)) {
    throw new Error('Нет доступа');
  }

  return prisma.internship.delete({ where: { id: parseInt(id) } });
};

// алиас для контроллера модерации
const moderate = async (id, status) => {
  const internship = await prisma.internship.findUnique({ where: { id: parseInt(id) } });
  if (!internship) throw new Error('Стажировка не найдена');
  return prisma.internship.update({
    where: { id: parseInt(id) },
    data: { status }
  });
};

module.exports = { create, getAll, getById, getMyInternships, update, updateStatus, moderate, remove };
