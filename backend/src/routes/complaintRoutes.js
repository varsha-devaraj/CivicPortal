const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { complaintValidationRules, validate } = require('../middleware/validatorMiddleware');

// Public tracking route
router.get('/track/:complaintId', complaintController.trackComplaint);

// Protected routes
router.post('/', authenticateToken, upload.single('image'), complaintValidationRules, validate, complaintController.createComplaint);
router.get('/', authenticateToken, complaintController.getMyComplaints);
router.get('/:id', authenticateToken, complaintController.getComplaintById);
router.get('/:id/history', authenticateToken, complaintController.getComplaintHistory);

module.exports = router;