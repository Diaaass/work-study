const jwt = require('jsonwebtoken');
const User = require('../users/user.model');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const register = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует');
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Неверный email или пароль');
  }

  if (user.isBlocked) {
    throw new Error('Аккаунт заблокирован');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Неверный email или пароль');
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

const getMe = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('Пользователь не найден');
  }
  return user;
};

module.exports = { register, login, getMe };