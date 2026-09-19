const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Staff routes require staff or admin role
router.use(authenticateToken, authorizeRoles('staff', 'admin'));

router.get('/complaints', staffController.getAssignedComplaints);
router.put('/complaints/:id/status', staffController.updateComplaintStatus);

module.exports = router;