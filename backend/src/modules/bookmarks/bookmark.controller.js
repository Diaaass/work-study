const service = require('./bookmark.service');

const getAll = async (req, res) => {
  try {
    const internships = await service.getAll(req.userId);
    res.json(internships);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getIds = async (req, res) => {
  try {
    const ids = await service.getIds(req.userId);
    res.json(ids);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const toggle = async (req, res) => {
  try {
    const result = await service.toggle(req.userId, req.params.internshipId);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { getAll, getIds, toggle };
