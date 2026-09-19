const mongoose = require('mongoose');

const ComplaintUpdateSchema = new mongoose.Schema({
  complaint_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  },
  updated_by_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: [
      'Submitted',
      'Pending',
      'Assigned',
      'In Progress',
      'Resolved',
      'Closed',
      'Rejected'
    ]
  },
  remarks: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('ComplaintUpdate', ComplaintUpdateSchema);