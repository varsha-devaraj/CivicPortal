const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Staff = require('../models/Staff');
const { success, error } = require('../utils/apiResponse');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'supersecret_civic_complaint_jwt_key_2026',
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return error(res, 'An account with this email already exists.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      password: hashedPassword,
      role: 'citizen'
    });

    const token = generateToken(user);

    return success(res, 'Registration successful! Welcome to CivicReport.', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    }, 201);
  } catch (err) {
    console.error('Registration error:', err);
    return error(res, 'Failed to complete registration. Please try again.', 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return error(res, 'Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return error(res, 'Invalid email or password.', 401);
    }

    // Check if user is staff to include department
    let department = null;
    let staffId = null;
    if (user.role === 'staff') {
      const staffProfile = await Staff.findOne({ user_id: user._id });
      if (staffProfile) {
        department = staffProfile.department;
        staffId = staffProfile._id;
      }
    }

    const token = generateToken(user);

    return success(res, 'Login successful!', {
      token,
      user: {
        id: user._id,
        staffId: staffId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        department
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Failed to log in. Please try again.', 500);
  }
};

exports.getMe = async (req, res) => {
  try {
    let staffData = null;
    if (req.user.role === 'staff') {
      staffData = await Staff.findOne({ user_id: req.user._id });
    }

    return success(res, 'User profile retrieved', {
      user: req.user,
      staff: staffData
    });
  } catch (err) {
    return error(res, 'Failed to fetch user profile.', 500);
  }
};