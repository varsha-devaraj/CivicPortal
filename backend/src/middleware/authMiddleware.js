const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/apiResponse');

const authenticateToken = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return error(res, 'Please login to continue.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_civic_complaint_jwt_key_2026');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return error(res, 'User session invalid or user no longer exists. Please login again.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Your session has expired. Please login again.', 401);
    }
    return error(res, 'Invalid or corrupted authentication token.', 401);
  }
};

module.exports = authenticateToken;