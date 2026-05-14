const notificationService = require('./notification.service');

const getMyNotifications = async (req, res) => {
  try {
    const data = await notificationService.getMyNotifications(req.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markRead = async (req, res) => {
  try {
    await notificationService.markRead(req.params.id, req.userId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    await notificationService.markAllRead(req.userId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyNotifications, markRead, markAllRead };
