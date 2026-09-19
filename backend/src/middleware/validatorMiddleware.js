const { validationResult, body } = require('express-validator');
const { error } = require('../utils/apiResponse');

// Middleware to check validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => err.msg);
    return error(res, extractedErrors[0], 400, errors.array());
  }
  next();
};

const registerValidationRules = [
  body('name').trim().notEmpty().withMessage('Full Name is required'),
  body('email').trim().isEmail().withMessage('Please enter a valid email address'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Please enter a valid phone number (at least 10 digits)'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
];

const loginValidationRules = [
  body('email').trim().isEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

const complaintValidationRules = [
  body('category').trim().isIn([
    'Street Light',
    'Water Pipe Leakage',
    'Rain Water Drainage',
    'Roadside Cleaning'
  ]).withMessage('Please select a valid complaint category.'),
  body('title').trim().notEmpty().withMessage('Complaint title is required'),
  body('description').trim().notEmpty().withMessage('Complaint description is required'),
  body('location').trim().notEmpty().withMessage('Location is required')
];

module.exports = {
  validate,
  registerValidationRules,
  loginValidationRules,
  complaintValidationRules
};