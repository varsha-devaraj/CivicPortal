const { useState, useEffect } = React;

function TrackComplaintPage() {
  const [complaintIdInput, setComplaintIdInput] = useState('');
  const [complaintData, setComplaintData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const statusSteps = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

  useEffect(() => {
    // Read ?id= from URL query
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    if (idParam) {
      setComplaintIdInput(idParam);
      trackId(idParam);
    }

    // Check if user is logged in to adapt nav button
    const user = getUser();
    const authBtn = document.getElementById('authBtn');
    if (user && authBtn) {
      authBtn.href = user.role === 'admin' ? 'admin.html' : (user.role === 'staff' ? 'staff.html' : 'dashboard.html');
      authBtn.innerText = `${user.name} (${user.role})`;
    }
  }, []);

  const trackId = async (idToTrack) => {
    const cleanId = (idToTrack || complaintIdInput).trim();
    if (!cleanId) {
      setErrorMsg('Please enter a Complaint ID.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/complaints/track/${encodeURIComponent(cleanId)}`);
      const result = await res.json();

      if (!res.ok || !result.success) {
        setErrorMsg(result.message || 'Complaint not found. Please verify the ID.');
        setComplaintData(null);
        setHistory([]);
        setLoading(false);
        return;
      }

      setComplaintData(result.data.complaint);
      setHistory(result.data.history || []);
      setLoading(false);
    } catch (err) {
      setErrorMsg('Failed to connect to tracking service.');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    trackId(complaintIdInput);
  };

  // Helper to determine step status
  const getStepIndex = (status) => {
    switch (status) {
      case 'Submitted':
      case 'Pending':
        return 0;
      case 'Assigned':
        return 1;
      case 'In Progress':
        return 2;
      case 'Resolved':
        return 3;
      case 'Closed':
        return 4;
      case 'Rejected':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = complaintData ? getStepIndex(complaintData.status) : 0;

  return (
    <div className="container py-5">
      {/* Search Header */}
      <div className="row justify-content-center mb-5">
        <div className="col-lg-8 text-center">
          <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold mb-2">
            Public Tracking Portal
          </span>
          <h2 className="fw-bold mb-2">Track Civic Complaint Resolution</h2>
          <p className="text-muted mb-4">
            Enter your unique Complaint ID (e.g., <span className="font-monospace text-dark fw-bold">CMP-2026-0001</span>) to check live status updates and inspection logs.
          </p>

          <form onSubmit={handleSubmit} className="d-flex gap-2 justify-content-center">
            <div className="input-group input-group-lg shadow-sm" style={{maxWidth: 540}}>
              <span className="input-group-text bg-white"><i className="bi bi-search text-primary"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. CMP-2026-0001"
                value={complaintIdInput}
                onChange={(e) => setComplaintIdInput(e.target.value)}
                required
              />
              <button type="submit" disabled={loading} className="btn btn-civic px-4 fw-bold">
                {loading ? 'Tracking...' : 'Track'}
              </button>
            </div>
          </form>

          {/* Quick links to sample complaints */}
          <div className="mt-3 small text-muted">
            Try sample IDs: 
            <button onClick={() => { setComplaintIdInput('CMP-2026-0001'); trackId('CMP-2026-0001'); }} className="btn btn-link btn-sm p-0 mx-1">CMP-2026-0001</button> | 
            <button onClick={() => { setComplaintIdInput('CMP-2026-0002'); trackId('CMP-2026-0002'); }} className="btn btn-link btn-sm p-0 mx-1">CMP-2026-0002</button> | 
            <button onClick={() => { setComplaintIdInput('CMP-2026-0003'); trackId('CMP-2026-0003'); }} className="btn btn-link btn-sm p-0 mx-1">CMP-2026-0003</button>
          </div>

          {errorMsg && (
            <div className="alert alert-danger mt-3 mb-0" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Tracking Result Card */}
      {complaintData && (
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
          {/* Card Header */}
          <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4 flex-wrap gap-3">
            <div>
              <div className="text-muted small text-uppercase fw-bold">Complaint Tracking File</div>
              <h3 className="fw-bold mb-1">{complaintData.title}</h3>
              <div className="d-flex align-items-center gap-3 mt-2 flex-wrap">
                <span className="badge bg-primary text-white font-monospace fs-6 px-3 py-1">
                  {complaintData.complaint_id}
                </span>
                <span className="badge bg-light text-dark border">
                  {complaintData.category}
                </span>
                <span className="text-muted small">
                  <i className="bi bi-calendar3 me-1"></i> Submitted: {formatDate(complaintData.created_at)}
                </span>
              </div>
            </div>

            <div className="text-md-end">
              <div className="text-muted small fw-bold">CURRENT STATUS</div>
              <span className={`badge badge-status fs-6 mt-1 ${getStatusBadgeClass(complaintData.status)}`}>
                {complaintData.status}
              </span>
            </div>
          </div>

          {/* Visual Timeline Stepper */}
          {complaintData.status !== 'Rejected' ? (
            <div className="mb-5">
              <h6 className="fw-bold text-muted text-uppercase mb-4" style={{fontSize: '0.8rem'}}>
                Resolution Progression Timeline
              </h6>
              <div className="timeline-stepper">
                {statusSteps.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isActive = idx === currentStepIdx;
                  return (
                    <div key={step} className={`step-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                      <div className="step-circle">
                        {isCompleted ? <i className="bi bi-check-lg"></i> : (idx + 1)}
                      </div>
                      <div className="step-label">{step}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="alert alert-danger mb-4">
              <i className="bi bi-x-circle-fill me-2"></i> This complaint was marked as <strong>Rejected</strong> by the municipal administration.
            </div>
          )}

          {/* Overview Grid */}
          <div className="row g-4 mb-4">
            <div className="col-md-7">
              <div className="p-3 bg-light rounded-3 mb-3">
                <div className="text-muted small fw-bold mb-1">COMPLAINT DESCRIPTION</div>
                <p className="mb-0 small">{complaintData.description}</p>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3">
                    <div className="text-muted small fw-bold mb-1">LOCATION</div>
                    <div className="fw-semibold small"><i className="bi bi-geo-alt text-danger me-1"></i>{complaintData.location}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3">
                    <div className="text-muted small fw-bold mb-1">LANDMARK</div>
                    <div className="fw-semibold small"><i className="bi bi-pin-map text-primary me-1"></i>{complaintData.landmark || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {complaintData.assigned_staff_id && (
                <div className="mt-3 p-3 bg-info-subtle rounded-3">
                  <div className="fw-bold text-dark mb-1">
                    <i className="bi bi-person-check-fill text-primary me-1"></i> Assigned Municipal Officer:
                  </div>
                  <div className="fw-semibold">{complaintData.assigned_staff_id.name}</div>
                  <div className="text-muted small">{complaintData.assigned_staff_id.department}</div>
                  {complaintData.assigned_staff_id.phone && (
                    <div className="small text-dark mt-1">📞 {complaintData.assigned_staff_id.phone}</div>
                  )}
                </div>
              )}
            </div>

            <div className="col-md-5">
              <div className="text-muted small fw-bold mb-2">EVIDENCE PHOTO</div>
              {complaintData.image ? (
                <div className="bg-light p-2 rounded text-center">
                  <img
                    src={`${API_BASE}${complaintData.image}`}
                    alt="Complaint photo"
                    className="complaint-img-preview img-fluid"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Photo'; }}
                  />
                </div>
              ) : (
                <div className="p-4 bg-light rounded text-center text-muted small">
                  <i className="bi bi-camera-slash fs-2 d-block mb-1"></i>
                  No photo attached with this grievance.
                </div>
              )}
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="mt-4 pt-3 border-top">
            <h5 className="fw-bold mb-3"><i className="bi bi-clock-history text-primary me-2"></i>Status History & Remarks</h5>
            {history.length === 0 ? (
              <p className="text-muted small">No updates recorded yet.</p>
            ) : (
              <div className="ps-2 mt-3">
                {history.map((h, i) => (
                  <div key={h._id || i} className="history-item">
                    <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap">
                      <span className={`badge badge-status ${getStatusBadgeClass(h.status)}`}>
                        {h.status}
                      </span>
                      <span className="text-muted small">{formatDate(h.created_at)}</span>
                    </div>
                    <p className="mb-1 text-dark small fw-medium">{h.remarks}</p>
                    <div className="text-muted" style={{fontSize: '0.75rem'}}>
                      Updated by: {h.updated_by_user_id?.name || 'System'} {h.staff_id ? `(${h.staff_id.name})` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<TrackComplaintPage />);