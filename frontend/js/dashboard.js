const { useState, useEffect } = React;

function CitizenDashboard() {
  const [user, setUserState] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    if (!checkAuth(['citizen', 'admin', 'staff'])) return;
    const currentUser = getUser();
    setUserState(currentUser);
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/complaints`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setComplaints(data.data || []);
      } else {
        setErrorMsg(data.message || 'Failed to fetch complaints.');
      }
    } catch (err) {
      setErrorMsg('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // Compute stat counts
  const total = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Submitted' || c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const closedCount = complaints.filter(c => c.status === 'Closed').length;

  const viewDetails = (c) => {
    setSelectedComplaint(c);
    const modalElem = document.getElementById('detailsModal');
    if (modalElem) {
      const modal = new bootstrap.Modal(modalElem);
      modal.show();
    }
  };

  return (
    <div className="container py-4">
      {/* Welcome Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1">Citizen Grievance Dashboard</h2>
          <p className="text-muted mb-0">Welcome back, <span className="fw-bold text-dark">{user?.name}</span>! Track your civic reports in real-time.</p>
        </div>
        <div className="d-flex gap-2">
          <a href="complaint.html" className="btn btn-civic shadow-sm">
            <i className="bi bi-plus-circle me-1"></i> Register New Complaint
          </a>
          <button onClick={logout} className="btn btn-outline-danger" title="Logout">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {errorMsg}
          <button type="button" className="btn-close" onClick={() => setErrorMsg('')}></button>
        </div>
      )}

      {/* 5 Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-2-4" style={{width: '20%'}}>
          <div className="stat-card">
            <div className="stat-icon bg-primary-subtle text-primary">
              <i className="bi bi-folder-fill"></i>
            </div>
            <div>
              <div className="stat-val">{total}</div>
              <div className="stat-label">Total Complaints</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2-4" style={{width: '20%'}}>
          <div className="stat-card">
            <div className="stat-icon bg-warning-subtle text-warning">
              <i className="bi bi-clock-history"></i>
            </div>
            <div>
              <div className="stat-val">{pendingCount}</div>
              <div className="stat-label">Pending Review</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2-4" style={{width: '20%'}}>
          <div className="stat-card">
            <div className="stat-icon bg-info-subtle text-info">
              <i className="bi bi-gear-wide-connected"></i>
            </div>
            <div>
              <div className="stat-val">{inProgressCount}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2-4" style={{width: '20%'}}>
          <div className="stat-card">
            <div className="stat-icon bg-success-subtle text-success">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div>
              <div className="stat-val">{resolvedCount}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2-4" style={{width: '20%'}}>
          <div className="stat-card">
            <div className="stat-icon bg-secondary-subtle text-secondary">
              <i className="bi bi-archive-fill"></i>
            </div>
            <div>
              <div className="stat-val">{closedCount}</div>
              <div className="stat-label">Closed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">Recent Complaints</h5>
          <a href="my-complaints.html" className="btn btn-sm btn-outline-primary">
            View All Complaints <i className="bi bi-arrow-right ms-1"></i>
          </a>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="text-muted mt-2">Loading your complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <h5 className="fw-bold mt-2">No complaints registered yet</h5>
              <p className="text-muted small">Spot an issue in your locality? Register a complaint and our municipal team will attend to it.</p>
              <a href="complaint.html" className="btn btn-civic btn-sm">Register Complaint</a>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Complaint ID</th>
                    <th>Category</th>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.slice(0, 8).map(c => (
                    <tr key={c._id}>
                      <td className="fw-bold text-primary font-monospace">{c.complaint_id}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {c.category === 'Street Light' && '💡 '}
                          {c.category === 'Water Pipe Leakage' && '💧 '}
                          {c.category === 'Rain Water Drainage' && '🌧️ '}
                          {c.category === 'Roadside Cleaning' && '🧹 '}
                          {c.category}
                        </span>
                      </td>
                      <td className="fw-semibold text-truncate" style={{maxWidth: 240}} title={c.title}>
                        {c.title}
                      </td>
                      <td className="text-muted small">{formatDate(c.created_at)}</td>
                      <td>
                        <span className={`badge badge-status ${getStatusBadgeClass(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button onClick={() => viewDetails(c)} className="btn btn-outline-primary">
                            <i className="bi bi-eye me-1"></i> View Details
                          </button>
                          <a href={`track-complaint.html?id=${c.complaint_id}`} className="btn btn-outline-secondary">
                            <i className="bi bi-geo-alt"></i> Track
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedComplaint && (
        <div className="modal fade" id="detailsModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">Complaint Details</h5>
                  <span className="badge bg-primary-subtle text-primary font-monospace">{selectedComplaint.complaint_id}</span>
                </div>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-7">
                    <div className="mb-3">
                      <label className="text-muted small fw-bold">CATEGORY</label>
                      <div className="fw-bold">{selectedComplaint.category}</div>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted small fw-bold">TITLE</label>
                      <div className="fs-5 fw-bold">{selectedComplaint.title}</div>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted small fw-bold">DESCRIPTION</label>
                      <div className="p-3 bg-light rounded-3 small">{selectedComplaint.description}</div>
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="text-muted small fw-bold">LOCATION</label>
                        <div>{selectedComplaint.location}</div>
                      </div>
                      <div className="col-6">
                        <label className="text-muted small fw-bold">LANDMARK</label>
                        <div>{selectedComplaint.landmark || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted small fw-bold">CURRENT STATUS</label>
                      <div>
                        <span className={`badge badge-status ${getStatusBadgeClass(selectedComplaint.status)}`}>
                          {selectedComplaint.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-5">
                    <label className="text-muted small fw-bold mb-2">EVIDENCE PHOTO</label>
                    {selectedComplaint.image ? (
                      <div className="text-center bg-light p-2 rounded-3">
                        <img
                          src={`${API_BASE}${selectedComplaint.image}`}
                          alt="Complaint photo"
                          className="complaint-img-preview img-fluid"
                          onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Photo'; }}
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-light rounded text-center text-muted small">
                        <i className="bi bi-image fs-1 d-block mb-1"></i>
                        No photo attached with this complaint.
                      </div>
                    )}

                    {selectedComplaint.assigned_staff_id && (
                      <div className="mt-3 p-3 bg-info-subtle rounded-3 small">
                        <div className="fw-bold text-dark"><i className="bi bi-person-badge me-1"></i> Assigned Technician:</div>
                        <div>{selectedComplaint.assigned_staff_id.name}</div>
                        <div className="text-muted">{selectedComplaint.assigned_staff_id.department}</div>
                        {selectedComplaint.assigned_staff_id.phone && (
                          <div>📞 {selectedComplaint.assigned_staff_id.phone}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <a href={`track-complaint.html?id=${selectedComplaint.complaint_id}`} className="btn btn-civic btn-sm">
                  <i className="bi bi-clock-history me-1"></i> View Full Timeline
                </a>
                <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CitizenDashboard />);