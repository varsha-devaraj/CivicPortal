const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const generateComplaintId = require('../utils/generateComplaintId');
const { success, error } = require('../utils/apiResponse');

exports.createComplaint = async (req, res) => {
  try {
    const { category, title, description, location, landmark } = req.body;

    if (!category || !title || !description || !location) {
      return error(res, 'Please fill in all required fields.', 400);
    }

    const complaint_id = await generateComplaintId();
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const complaint = await Complaint.create({
      complaint_id,
      user_id: req.user._id,
      category,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      landmark: landmark ? landmark.trim() : '',
      image: imagePath,
      status: 'Submitted'
    });

    // Create initial tracking entry
    await ComplaintUpdate.create({
      complaint_id: complaint._id,
      updated_by_user_id: req.user._id,
      status: 'Submitted',
      remarks: 'Complaint registered by citizen and queued for department verification.'
    });

    return success(res, 'Complaint registered successfully!', {
      complaint_id: complaint.complaint_id,
      id: complaint._id,
      status: complaint.status
    }, 201);
  } catch (err) {
    console.error('Create complaint error:', err);
    return error(res, 'Failed to register complaint. Please check the submitted information.', 500);
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = { user_id: req.user._id };

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
        { location: new RegExp(search.trim(), 'i') }
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate('assigned_staff_id', 'name phone department')
      .sort({ created_at: -1 });

    return success(res, 'Complaints retrieved successfully', complaints);
  } catch (err) {
    console.error('Get my complaints error:', err);
    return error(res, 'Failed to fetch complaints.', 500);
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const id = req.params.id;
    let complaint;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      complaint = await Complaint.findById(id)
        .populate('user_id', 'name email phone address')
        .populate('assigned_staff_id', 'name email phone department');
    } else {
      complaint = await Complaint.findOne({ complaint_id: id.toUpperCase().trim() })
        .populate('user_id', 'name email phone address')
        .populate('assigned_staff_id', 'name email phone department');
    }

    if (!complaint) {
      return error(res, 'Complaint not found.', 404);
    }

    // Role check: citizen can only view their own complaint unless admin or staff
    if (req.user.role === 'citizen' && String(complaint.user_id._id) !== String(req.user._id)) {
      return error(res, 'You do not have access to view this complaint.', 403);
    }

    const history = await ComplaintUpdate.find({ complaint_id: complaint._id })
      .populate('staff_id', 'name department')
      .populate('updated_by_user_id', 'name role')
      .sort({ created_at: 1 });

    return success(res, 'Complaint details retrieved', {
      complaint,
      history
    });
  } catch (err) {
    console.error('Get complaint error:', err);
    return error(res, 'Failed to retrieve complaint details.', 500);
  }
};

exports.trackComplaint = async (req, res) => {
  try {
    const complaintIdParam = (req.params.complaintId || '').trim().toUpperCase();

    if (!complaintIdParam) {
      return error(res, 'Please provide a valid Complaint ID.', 400);
    }

    const complaint = await Complaint.findOne({ complaint_id: complaintIdParam })
      .populate('assigned_staff_id', 'name phone department')
      .populate('user_id', 'name');

    if (!complaint) {
      return error(res, 'Complaint not found with ID ' + complaintIdParam, 404);
    }

    const history = await ComplaintUpdate.find({ complaint_id: complaint._id })
      .populate('staff_id', 'name department')
      .populate('updated_by_user_id', 'name role')
      .sort({ created_at: 1 });

    return success(res, 'Complaint tracking data retrieved', {
      complaint,
      history
    });
  } catch (err) {
    console.error('Track complaint error:', err);
    return error(res, 'Failed to track complaint.', 500);
  }
};

exports.getComplaintHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await ComplaintUpdate.find({ complaint_id: id })
      .populate('staff_id', 'name department')
      .sort({ created_at: 1 });

    return success(res, 'History retrieved', history);
  } catch (err) {
    return error(res, 'Failed to fetch history.', 500);
  }
};