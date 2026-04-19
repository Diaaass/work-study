const prisma = require('../../config/db');

// Фронт шлёт 'onsite', бэк хранит 'office'
const mapWorkType = (type) => {
  if (!type) return 'office';
  if (type === 'onsite') return 'office';
  return type; // remote, hybrid, office — как есть
};

const create = async (data, userId) => {
  return prisma.internship.create({
    data: {
      title: data.title,
      company: data.company || '',
      companyLogo: data.companyLogo || null,
      description: data.description,
      requirements: data.requirements || [],
      skills: data.skills || [],
      city: data.city || data.location || '',
      workType: mapWorkType(data.workType || data.type),
      salary: parseFloat(data.salary) || 0,
      duration: data.duration || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      postedById: parseInt(userId),
    },
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
  if (workType) where.workType = workType === 'onsite' ? 'office' : workType;
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

const getById = async (id, viewerId, viewerRole) => {
  const internship = await prisma.internship.findUnique({
    where: { id: parseInt(id) },
    include: {
      postedBy: {
        select: { id: true, name: true, email: true }
      }
    }
  });
  if (!internship) throw new Error('Стажировка не найдена');

  // Считаем просмотр только от студентов и незарегистрированных
  // HR (особенно владелец) и admin не накручивают счётчик
  const isOwner = viewerId && internship.postedById === parseInt(viewerId);
  const isStaff = viewerRole === 'hr' || viewerRole === 'admin';
  if (!isOwner && !isStaff) {
    await prisma.internship.update({
      where: { id: parseInt(id) },
      data: { viewsCount: { increment: 1 } }
    });
  }

  return internship;
};

const getMyInternships = async (userId) => {
  return prisma.internship.findMany({
    where: { postedById: parseInt(userId) },
    include: {
      _count: { select: { applications: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getStats = async (id, userId, userRole) => {
  const internship = await prisma.internship.findUnique({
    where: { id: parseInt(id) }
  });
  if (!internship) throw new Error('Стажировка не найдена');
  if (userRole !== 'admin' && internship.postedById !== parseInt(userId)) {
    throw new Error('Нет доступа');
  }

  const applications = await prisma.application.findMany({
    where: { internshipId: parseInt(id) },
    select: { status: true, createdAt: true }
  });

  // Группировка по статусам
  const byStatus = { pending: 0, accepted: 0, rejected: 0 };
  applications.forEach(a => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });

  // Группировка по дням (последние 30 дней)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const byDay = {};
  applications
    .filter(a => new Date(a.createdAt) >= thirtyDaysAgo)
    .forEach(a => {
      const day = a.createdAt.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });

  const applicationsByDay = Object.entries(byDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    viewsCount: internship.viewsCount,
    totalApplications: applications.length,
    byStatus,
    applicationsByDay
  };
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
const moderate = async (id, status, rejectionReason) => {
  const internship = await prisma.internship.findUnique({ where: { id: parseInt(id) } });
  if (!internship) throw new Error('Стажировка не найдена');
  return prisma.internship.update({
    where: { id: parseInt(id) },
    data: {
      status,
      rejectionReason: status === 'rejected' ? (rejectionReason || null) : null
    }
  });
};

module.exports = { create, getAll, getById, getMyInternships, getStats, update, updateStatus, moderate, remove };
