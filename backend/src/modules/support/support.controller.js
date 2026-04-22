const supportService = require('./support.service');

const create = async (req, res) => {
  try {
    const ticket = await supportService.create(req.body, req.userId);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const tickets = await supportService.getAll(req.query);
    res.json(tickets);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getMy = async (req, res) => {
  try {
    const tickets = await supportService.getMy(req.userId);
    res.json(tickets);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const reply = async (req, res) => {
  try {
    const ticket = await supportService.reply(req.params.id, req.body);
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { create, getAll, getMy, reply };
