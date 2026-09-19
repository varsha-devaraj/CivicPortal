const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  complaint_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Street Light',
      'Water Pipe Leakage',
      'Rain Water Drainage',
      'Roadside Cleaning'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  landmark: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: [
      'Submitted',
      'Pending',
      'Assigned',
      'In Progress',
      'Resolved',
      'Closed',
      'Rejected'
    ],
    default: 'Submitted'
  },
  assigned_staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);