const userService = require('./user.service');

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

module.exports = { getAll, toggleBlock, updateProfile };