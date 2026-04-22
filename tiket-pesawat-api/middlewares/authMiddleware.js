const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (err) {
      const authError  = new Error('Not authorized, token failed');
      authError.status = 401;
      next(authError);
    }
  } else {
    const authError  = new Error('Not authorized, no token');
    authError.status = 401;
    next(authError);
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    const authError  = new Error('Not authorized as admin');
    authError.status = 403;
    next(authError);
  }
};

module.exports = { protect, admin };