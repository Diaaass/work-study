const applicationService = require('./application.service');

const apply = async (req, res) => {
  try {
    const application = await applicationService.apply(req.body, req.userId);
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await applicationService.getMyApplications(req.userId);
    res.json(applications);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getInternshipApplications = async (req, res) => {
  try {
    const applications = await applicationService.getInternshipApplications(
      req.params.internshipId,
      req.userId
    );
    res.json(applications);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const application = await applicationService.updateStatus(
      req.params.id,
      req.body,
      req.userId
    );
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { apply, getMyApplications, getInternshipApplications, updateStatus };
