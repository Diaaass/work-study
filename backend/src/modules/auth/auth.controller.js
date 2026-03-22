const authService = require('./auth.service');

const register = async (req, res, next) => {
  try {
    console.log('register called', req.body);
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.log('register error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.userId);
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = { register, login, getMe };