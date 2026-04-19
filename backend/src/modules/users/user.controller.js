const userService = require('./user.service');

const getTelegramLinkCode = async (req, res) => {
  try {
    const result = userService.getTelegramLinkCode(req.userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const disconnectTelegram = async (req, res) => {
  try {
    await userService.disconnectTelegram(req.userId);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const users = await userService.getAll(req.query);
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const toggleBlock = async (req, res) => {
  try {
    const user = await userService.toggleBlock(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await userService.updateProfile(req.userId, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getAll, toggleBlock, updateProfile, getTelegramLinkCode, disconnectTelegram };