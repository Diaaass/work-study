const express = require('express');
const cors = require('cors');

// Init Telegram bot (polling starts on require)
require('./services/telegram.service');

const authRoutes = require('./modules/auth/auth.routes');
const internshipRoutes = require('./modules/internships/internship.routes');
const applicationRoutes = require('./modules/applications/application.routes');
const userRoutes = require('./modules/users/user.routes');
const uploadRoutes  = require('./modules/upload/upload.routes');
const supportRoutes = require('./modules/support/support.routes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Work&Study API работает' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/internships', internshipRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/upload',  uploadRoutes);
app.use('/api/v1/support', supportRoutes);

module.exports = app;
