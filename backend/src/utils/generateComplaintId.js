const Complaint = require('../models/Complaint');

/**
 * Generates a formatted unique complaint ID like CMP-2026-0001
 * Uses descending sort on complaint_id to find the maximum existing sequence
 */
async function generateComplaintId() {
  const currentYear = new Date().getFullYear();
  const prefix = `CMP-${currentYear}-`;

  // Sort descending by complaint_id to reliably find the highest number
  const latestComplaint = await Complaint.findOne({
    complaint_id: new RegExp(`^${prefix}`)
  }).sort({ complaint_id: -1 });

  let sequence = 1;
  if (latestComplaint && latestComplaint.complaint_id) {
    const parts = latestComplaint.complaint_id.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
  }

  // Format sequence padded with 4 digits: CMP-2026-0004
  const paddedSeq = String(sequence).padStart(4, '0');
  return `${prefix}${paddedSeq}`;
}

module.exports = generateComplaintId;