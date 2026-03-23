const Internship = require('./internship.model');

const create = async (data, userId) => {
  const internship = await Internship.create({
    ...data,
    postedBy: userId
  });
  return internship;
};

const getAll = async ({ city, workType, skills, status = 'published' }) => {
  const filter = { status };

  if (city) filter.city = city;
  if (workType) filter.workType = workType;
  if (skills) filter.skills = { $in: skills.split(',') };

  return Internship.find(filter).populate('postedBy', 'name email');
};

const getById = async (id) => {
  const internship = await Internship.findById(id).populate('postedBy', 'name email');
  if (!internship) throw new Error('Стажировка не найдена');
  return internship;
};

const update = async (id, data, userId) => {
  const internship = await Internship.findById(id);
  if (!internship) throw new Error('Стажировка не найдена');
  if (internship.postedBy.toString() !== userId) {
    throw new Error('Нет доступа');
  }
  return Internship.findByIdAndUpdate(id, data, { returnDocument: 'after' });
};

const moderate = async (id, status) => {
  return Internship.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
};

module.exports = { create, getAll, getById, update, moderate };