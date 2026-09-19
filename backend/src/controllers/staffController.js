const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const Staff = require('../models/Staff');
const { success, error } = require('../utils/apiResponse');

exports.getAssignedComplaints = async (req, res) => {
  try {
    // Find staff profile linked to this user account
    let staff = await Staff.findOne({ user_id: req.user._id });
    if (!staff) {
      // Fallback matching by email
      staff = await Staff.findOne({ email: req.user.email });
    }

    if (!staff) {
      return error(res, 'Staff record not found for this account.', 404);
    }

    const { status, category } = req.query;
    const filter = { assigned_staff_id: staff._id };

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }

    const complaints = await Complaint.find(filter)
      .populate('user_id', 'name email phone address')
      .sort({ created_at: -1 });

    return success(res, 'Assigned complaints retrieved successfully', {
      staff,
      complaints
    });
  } catch (err) {
    console.error('Staff get complaints error:', err);
    return error(res, 'Failed to retrieve assigned complaints.', 500);
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!status || !remarks) {
      return error(res, 'Please provide both status and work remarks.', 400);
    }

    let staff = await Staff.findOne({ user_id: req.user._id });
    if (!staff) {
      staff = await Staff.findOne({ email: req.user.email });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return error(res, 'Complaint not found.', 404);
    }

    // Verify assignment
    if (staff && String(complaint.assigned_staff_id) !== String(staff._id) && req.user.role !== 'admin') {
      return error(res, 'You are not assigned to handle this complaint.', 403);
    }

    complaint.status = status;
    await complaint.save();

    await ComplaintUpdate.create({
      complaint_id: complaint._id,
      staff_id: staff ? staff._id : complaint.assigned_staff_id,
      updated_by_user_id: req.user._id,
      status: status,
      remarks: remarks.trim()
    });

    return success(res, `Complaint status updated to ${status} successfully.`, complaint);
  } catch (err) {
    console.error('Staff update error:', err);
    return error(res, 'Failed to update complaint status.', 500);
  }
};