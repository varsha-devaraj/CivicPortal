const { useState, useEffect } = React;

function StaffDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [staffInfo, setStaffInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  // Update modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('In Progress');
  const [updateRemarks, setUpdateRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!checkAuth(['staff', 'admin'])) return;
    loadAssignedComplaints();
  }, [statusFilter]);

  const loadAssignedComplaints = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter !== 'all') q.append('status', statusFilter);

      const res = await fetch(`${API_BASE}/api/staff/complaints?${q.toString()}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setComplaints(data.data.complaints || []);
        setStaffInfo(data.data.staff || null);
      } else {
        setAlertMsg({ type: 'danger', text: data.message || 'Failed to load assigned complaints.' });
      }
    } catch (err) {
      setAlertMsg({ type: 'danger', text: 'Error connecting to server.' });
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (c, quickResolve = false) => {
    setSelectedComplaint(c);
    setUpdateStatus(quickResolve ? 'Resolved' : (c.status === 'Assigned' ? 'In Progress' : c.status));
    setUpdateRemarks(quickResolve ? 'Field issue resolved and verified on-site.' : '');
    const m = new bootstrap.Modal(document.getElementById('staffUpdateModal'));
    m.show();
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateRemarks.trim()) {
      alert('Please enter work remarks describing the status change.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/staff/complaints/${selectedComplaint._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          status: updateStatus,
          remarks: updateRemarks.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertMsg({ type: 'success', text: `Status updated to "${updateStatus}" successfully.` });
        bootstrap.Modal.getInstance(document.getElementById('staffUpdateModal')).hide();
        loadAssignedComplaints();
      } else {
        setAlertMsg({ type: 'danger', text: data.message || 'Update failed.' });
      }
    } catch (err) {
      setAlertMsg({ type: 'danger', text: 'Network communication error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = complaints.filter(c => c.status === 'Assigned' || c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div className="container py-4">
      {/* Staff Banner */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill mb-2 fw-semibold">
              <i className="bi bi-shield-shaded me-1"></i> Authorized Field Technician
            </span>
            <h2 className="fw-bold mb-1">{staffInfo?.name || 'Staff Member'}</h2>
            <p className="text-muted mb-0">
              Department: <strong className="text-dark">{staffInfo?.department || 'Civic Services'}</strong> &bull; {staffInfo?.email}
            </p>
          </div>
          <div className="d-flex gap-3">
            <div className="text-center p-3 bg-light rounded-3 border" style={{minWidth: 110}}>
              <div className="fs-3 fw-bold text-warning">{activeCount}</div>
              <div className="small text-muted fw-semibold">Active Tasks</div>
            </div>
            <div className="text-center p-3 bg-light rounded-3 border" style={{minWidth: 110}}>
              <div className="fs-3 fw-bold text-success">{resolvedCount}</div>
              <div className="small text-muted fw-semibold">Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Filter bar */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="fw-bold mb-0">Assigned Complaints List ({complaints.length})</h5>
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            style={{width: 180}}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <button onClick={loadAssignedComplaints} className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      {/* Complaints List Cards */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="text-muted mt-2">Loading assigned complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i className="bi bi-clipboard-check fs-1 text-success mb-2"></i>
          <h4 className="fw-bold">No tasks currently assigned!</h4>
          <p className="text-muted small">You have no pending complaints under this filter.</p>
        </div>
      ) : (
        <div className="row g-3">
          {complaints.map(c => (
            <div key={c._id} className="col-12">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                  <div>
                    <span className="badge bg-primary-subtle text-primary font-monospace me-2">{c.complaint_id}</span>
                    <span className="badge bg-light text-dark border me-2">{c.category}</span>
                    <span className={`badge badge-status ${getStatusBadgeClass(c.status)}`}>{c.status}</span>
                  </div>
                  <div className="text-muted small">
                    <i className="bi bi-calendar-event me-1"></i> {formatDate(c.created_at)}
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-8">
                    <h5 className="fw-bold mb-2">{c.title}</h5>
                    <p className="text-muted small bg-light p-3 rounded-3 mb-3">{c.description}</p>
                    
                    <div className="d-flex gap-4 flex-wrap small">
                      <div>
                        <strong><i className="bi bi-geo-alt text-danger me-1"></i>Location:</strong> {c.location}
                      </div>
                      {c.landmark && (
                        <div>
                          <strong><i className="bi bi-pin-map text-primary me-1"></i>Landmark:</strong> {c.landmark}
                        </div>
                      )}
                      <div>
                        <strong><i className="bi bi-person text-secondary me-1"></i>Citizen:</strong> {c.user_id?.name} ({c.user_id?.phone})
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 text-md-end d-flex flex-column justify-content-between">
                    <div>
                      {c.image ? (
                        <img
                          src={`${API_BASE}${c.image}`}
                          alt="Evidence"
                          className="rounded border img-fluid mb-2"
                          style={{maxHeight: 120, objectFit: 'cover'}}
                          onError={(e) => { e.target.src = 'https://placehold.co/200x120?text=No+Photo'; }}
                        />
                      ) : (
                        <div className="text-muted small p-2 bg-light rounded text-center mb-2">No photo</div>
                      )}
                    </div>

                    <div className="d-flex gap-2 justify-content-md-end flex-wrap">
                      <button onClick={() => openUpdateModal(c, false)} className="btn btn-outline-primary btn-sm">
                        <i className="bi bi-pencil-square me-1"></i> Update Status
                      </button>
                      {c.status !== 'Resolved' && c.status !== 'Closed' && (
                        <button onClick={() => openUpdateModal(c, true)} className="btn btn-success btn-sm">
                          <i className="bi bi-check-circle me-1"></i> Mark Resolved
                        </button>
                      )}
                      <a href={`track-complaint.html?id=${c.complaint_id}`} target="_blank" className="btn btn-outline-secondary btn-sm" title="View Public Tracking Page">
                        <i className="bi bi-box-arrow-up-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Update Modal */}
      {selectedComplaint && (
        <div className="modal fade" id="staffUpdateModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title fw-bold">Update Complaint Status</h5>
                    <span className="font-monospace text-primary small">{selectedComplaint.complaint_id}</span>
                  </div>
                  <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">New Status</label>
                    <select
                      className="form-select"
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      required
                    >
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress (Work Initiated)</option>
                      <option value="Resolved">Resolved (Completed on Site)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Work Remarks / Action Taken <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Explain action taken, materials used, or inspection results..."
                      value={updateRemarks}
                      onChange={(e) => setUpdateRemarks(e.target.value)}
                      required
                    ></textarea>
                    <div className="form-text">These remarks will appear on the citizen's resolution timeline.</div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-civic fw-bold">
                    {submitting ? 'Saving...' : 'Submit Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<StaffDashboard />);