const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');
const internshipRoutes = require('./modules/internships/internship.routes');
const applicationRoutes = require('./modules/applications/application.routes');
const userRoutes = require('./modules/users/user.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Work&Study API работает' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/internships', internshipRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/users', userRoutes);

module.exports = app;
