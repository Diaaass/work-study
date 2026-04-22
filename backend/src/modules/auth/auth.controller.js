const authService = require('./auth.service');

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const result = await authService.verifyEmail(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resendVerificationCode = async (req, res) => {
  try {
    const result = await authService.resendVerificationCode(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    // Если email не подтверждён — передаём email клиенту
    if (error.code === 'EMAIL_NOT_VERIFIED') {
      return res.status(403).json({ message: error.message, code: 'EMAIL_NOT_VERIFIED', email: error.email });
    }
    res.status(400).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.userId);
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const result = await authService.forgotPassword(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  getMe,
  forgotPassword,
  resetPassword,
};
