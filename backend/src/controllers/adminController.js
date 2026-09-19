const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const User = require('../models/User');
const Staff = require('../models/Staff');
const { success, error } = require('../utils/apiResponse');

exports.getAllComplaints = async (req, res) => {
  try {
    const { category, status, search, limit = 100, page = 1 } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search && search.trim()) {
      filter.$or = [
        { complaint_id: new RegExp(search.trim(), 'i') },
        { title: new RegExp(search.trim(), 'i') },
        { location: new RegExp(search.trim(), 'i') },
        { landmark: new RegExp(search.trim(), 'i') }
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate('user_id', 'name email phone address')
      .populate('assigned_staff_id', 'name email phone department')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    return success(res, 'All complaints retrieved successfully', {
      complaints,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Admin get complaints error:', err);
    return error(res, 'Failed to fetch complaints.', 500);
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'citizen' });
    const totalStaff = await Staff.countDocuments();
    const totalComplaints = await Complaint.countDocuments();

    const pending = await Complaint.countDocuments({ status: { $in: ['Submitted', 'Pending'] } });
    const assigned = await Complaint.countDocuments({ status: 'Assigned' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const closed = await Complaint.countDocuments({ status: 'Closed' });
    const rejected = await Complaint.countDocuments({ status: 'Rejected' });

    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Status breakdown
    const statusStats = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Monthly breakdown (last 6 months)
    const monthlyStats = await Complaint.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    return success(res, 'Dashboard statistics retrieved', {
      summary: {
        totalUsers,
        totalStaff,
        totalComplaints,
        pending,
        assigned,
        inProgress,
        resolved,
        closed,
        rejected
      },
      byCategory: categoryStats,
      byStatus: statusStats,
      byMonth: monthlyStats
    });
  } catch (err) {
    console.error('Stats error:', err);
    return error(res, 'Failed to fetch dashboard statistics.', 500);
  }
};

exports.getAllStaff = async (req, res) => {
  try {
    const staffList = await Staff.find().sort({ name: 1 });
    return success(res, 'Staff members retrieved', staffList);
  } catch (err) {
    return error(res, 'Failed to fetch staff members.', 500);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ created_at: -1 });
    return success(res, 'Users retrieved successfully', users);
  } catch (err) {
    return error(res, 'Failed to fetch users.', 500);
  }
};

exports.assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_id, remarks } = req.body;

    if (!staff_id) {
      return error(res, 'Please select a staff member to assign.', 400);
    }

    const staff = await Staff.findById(staff_id);
    if (!staff) {
      return error(res, 'Selected staff member not found.', 404);
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return error(res, 'Complaint not found.', 404);
    }

    complaint.assigned_staff_id = staff._id;
    if (complaint.status === 'Submitted' || complaint.status === 'Pending') {
      complaint.status = 'Assigned';
    }
    await complaint.save();

    // Log update
    await ComplaintUpdate.create({
      complaint_id: complaint._id,
      staff_id: staff._id,
      updated_by_user_id: req.user._id,
      status: complaint.status,
      remarks: remarks || `Assigned to ${staff.name} (${staff.department}) for field resolution.`
    });

    return success(res, `Complaint successfully assigned to ${staff.name}`, complaint);
  } catch (err) {
    console.error('Assign error:', err);
    return error(res, 'Failed to assign complaint.', 500);
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!status) {
      return error(res, 'Please provide status to update.', 400);
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return error(res, 'Complaint not found.', 404);
    }

    complaint.status = status;
    await complaint.save();

    await ComplaintUpdate.create({
      complaint_id: complaint._id,
      staff_id: complaint.assigned_staff_id,
      updated_by_user_id: req.user._id,
      status: status,
      remarks: remarks || `Status updated to ${status} by administrator.`
    });

    return success(res, `Complaint status updated to ${status}`, complaint);
  } catch (err) {
    console.error('Update status error:', err);
    return error(res, 'Failed to update complaint status.', 500);
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return error(res, 'Complaint not found.', 404);
    }

    // Delete associated update history
    await ComplaintUpdate.deleteMany({ complaint_id: complaint._id });
    await Complaint.findByIdAndDelete(id);

    return success(res, 'Complaint and its tracking history deleted successfully.');
  } catch (err) {
    console.error('Delete error:', err);
    return error(res, 'Failed to delete complaint.', 500);
  }
};