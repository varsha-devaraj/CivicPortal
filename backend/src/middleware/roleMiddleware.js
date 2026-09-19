const { error } = require('../utils/apiResponse');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Please login to continue.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      if (allowedRoles.includes('admin') && allowedRoles.length === 1) {
        return error(res, 'Only administrators can access this page.', 403);
      }
      if (allowedRoles.includes('staff')) {
        return error(res, 'Only authorized staff members or administrators can access this page.', 403);
      }
      return error(res, 'You do not have permission to perform this action.', 403);
    }

    next();
  };
};

module.exports = authorizeRoles;