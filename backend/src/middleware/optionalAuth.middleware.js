const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Не блокирует запрос — просто добавляет userId/userRole если токен есть
module.exports = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (user) {
        req.userId   = user.id;
        req.userRole = user.role;
      }
    } catch (_) {
      // невалидный токен — просто игнорируем
    }
  }
  next();
};
