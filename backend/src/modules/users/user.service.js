const User = require('./user.model');

const getAll = async ({ search, role }) => {
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  return User.find(filter).select('-password');
};

const toggleBlock = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error('Пользователь не найден');
  user.isBlocked = !user.isBlocked;
  await user.save();
  return user;
};

const updateProfile = async (id, data) => {
  return User.findByIdAndUpdate(
    id,
    { profile: data },
    { returnDocument: 'after' }
  ).select('-password');
};

module.exports = { getAll, toggleBlock, updateProfile };