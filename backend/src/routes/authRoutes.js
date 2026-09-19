const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const { registerValidationRules, loginValidationRules, validate } = require('../middleware/validatorMiddleware');

router.post('/register', registerValidationRules, validate, authController.register);
router.post('/login', loginValidationRules, validate, authController.login);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;