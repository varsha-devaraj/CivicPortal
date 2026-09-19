const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// All admin routes require admin role
router.use(authenticateToken, authorizeRoles('admin'));

router.get('/complaints', adminController.getAllComplaints);
router.get('/stats', adminController.getDashboardStats);
router.get('/staff', adminController.getAllStaff);
router.get('/users', adminController.getAllUsers);
router.put('/complaints/:id/assign', adminController.assignComplaint);
router.put('/complaints/:id/status', adminController.updateComplaintStatus);
router.delete('/complaints/:id', adminController.deleteComplaint);

module.exports = router;