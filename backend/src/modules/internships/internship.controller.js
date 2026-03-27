const internshipService = require('./internship.service');

const create = async (req, res) => {
  try {
    const internship = await internshipService.create(req.body, req.userId);
    res.status(201).json(internship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const internships = await internshipService.getAll(req.query);
    res.json(internships);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const internship = await internshipService.getById(req.params.id);
    res.json(internship);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const internship = await internshipService.update(req.params.id, req.body, req.userId);
    res.json(internship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const moderate = async (req, res) => {
  try {
    const internship = await internshipService.moderate(req.params.id, req.body.status);
    res.json(internship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { create, getAll, getById, update, moderate };
