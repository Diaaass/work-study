const jwt = require('jsonwebtoken');
const User = require('../modules/users/user.model');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Нет токена авторизации' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Пользователь не найден' });
    req.userId = user._id.toString();
    req.userRole = user.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Токен недействителен' });
  }
};
