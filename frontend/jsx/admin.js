const { useState, useEffect, useRef } = React;

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal active objects
  const [assignModalData, setAssignModalData] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');

  const [statusModalData, setStatusModalData] = useState(null);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [statusRemarks, setStatusRemarks] = useState('');

  const [viewDetailsData, setViewDetailsData] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const categoryChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const chartInstances = useRef({});

  useEffect(() => {
    if (!checkAuth(['admin'])) return;
    loadDashboard();
  }, [categoryFilter, statusFilter]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const statsJson = await statsRes.json();
      if (statsRes.ok && statsJson.success) {
        setStats(statsJson.data);
        renderCharts(statsJson.data);
      }

      // 2. Fetch Staff
      const staffRes = await fetch(`${API_BASE}/api/admin/staff`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const staffJson = await staffRes.json();
      if (staffRes.ok && staffJson.success) {
        setStaffList(staffJson.data || []);
      }

      // 3. Fetch Complaints
      await fetchComplaints();
    } catch (err) {
      setAlertMsg({ type: 'danger', text: 'Error loading dashboard data.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const q = new URLSearchParams();
      if (categoryFilter !== 'all') q.append('category', categoryFilter);
      if (statusFilter !== 'all') q.append('status', statusFilter);
      if (search.trim()) q.append('search', search.trim());

      const res = await fetch(`${API_BASE}/api/admin/complaints?${q.toString()}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setComplaints(json.data.complaints || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderCharts = (data) => {
    if (!data) return;

    // Destroy existing chart instances before re-rendering
    if (chartInstances.current.category) chartInstances.current.category.destroy();
    if (chartInstances.current.status) chartInstances.current.status.destroy();

    // 1. Category Chart
    const catCanvas = document.getElementById('categoryChart');
    if (catCanvas && data.byCategory) {
      const labels = data.byCategory.map(c => c._id);
      const counts = data.byCategory.map(c => c.count);
      chartInstances.current.category = new Chart(catCanvas, {
        type: 'doughnut',
        data: {
          labels: labels.length ? labels : ['No Data'],
          datasets: [{
            data: counts.length ? counts : [1],
            backgroundColor: ['#0d9488', '#0284c7', '#8b5cf6', '#f59e0b', '#10b981']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // 2. Status Chart
    const statusCanvas = document.getElementById('statusChart');
    if (statusCanvas && data.byStatus) {
      const labels = data.byStatus.map(s => s._id);
      const counts = data.byStatus.map(s => s.count);
      chartInstances.current.status = new Chart(statusCanvas, {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['No Data'],
          datasets: [{
            label: 'Complaints',
            data: counts.length ? counts : [0],
            backgroundColor: '#0f766e',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }
      });
    }
  };

  // Assign staff handler
  const openAssignModal = (complaint) => {
    setAssignModalData(complaint);
    setSelectedStaffId(complaint.assigned_staff_id?._id || '');
    setAssignRemarks('');
    const m = new bootstrap.Modal(document.getElementById('assignModal'));
    m.show();
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/complaints/${assignModalData._id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          staff_id: selectedStaffId,
          remarks: assignRemarks || undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertMsg({ type: 'success', text: data.message });
        bootstrap.Modal.getInstance(document.getElementById('assignModal')).hide();
        loadDashboard();
      } else {
        setAlertMsg({ type: 'danger', text: data.message || 'Failed to assign staff.' });
      }
    } catch (err) {
      setAlertMsg({ type: 'danger', text: 'Network error.' });
    }
  };

  // Status update handler
  const openStatusModal = (complaint) => {
    setStatusModalData(complaint);
    setNewStatus(complaint.status);
    setStatusRemarks('');
    const m = new bootstrap.Modal(document.getElementById('statusModal'));
    m.show();
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/complaints/${statusModalData._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          status: newStatus,
          remarks: statusRemarks
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertMsg({ type: 'success', text: data.message });
        bootstrap.Modal.getInstance(document.getElementById('statusModal')).hide();
        loadDashboard();
      } else {
        setAlertMsg({ type: 'danger', text: data.message || 'Failed to update status.' });
      }
    } catch (err) {
      setAlertMsg({ type: 'danger', text: 'Network error.' });
    }
  };

  // Delete complaint handler
  const handleDelete = async (id, complaintId) => {
    if (!confirm(`Are you sure you want to delete complaint ${complaintId}? This will delete all tracking logs permanently.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/complaints/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertMsg({ type: 'success', text: `Complaint ${complaintId} deleted successfully.` });
        loadDashboard();
      } else {
        setAlertMsg({ type: 'danger', text: data.message || 'Failed to delete complaint.' });
      }
    } catch (err) {
      setAlertMsg({ type: 'danger', text: 'Network error.' });
    }
  };

  const openDetailsModal = (c) => {
    setViewDetailsData(c);
    const m = new bootstrap.Modal(document.getElementById('adminDetailsModal'));
    m.show();
  };

  const summary = stats?.summary || {};

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Municipal Administration Portal</h2>
          <p className="text-muted mb-0">Overview of civic issues, department allocations, and resolution trends.</p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={loadDashboard} className="btn btn-outline-secondary">
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh Data
          </button>
        </div>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ type: '', text: '' })}></button>
        </div>
      )}

      {/* 7 Admin Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3 col-xl">
          <div className="stat-card">
            <div className="stat-icon bg-secondary-subtle text-secondary"><i className="bi bi-people-fill"></i></div>
            <div>
              <div className="stat-val">{summary.totalUsers ?? 0}</div>
              <div className="stat-label">Total Citizens</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 col-xl">
          <div className="stat-card">
            <div className="stat-icon bg-primary-subtle text-primary"><i className="bi bi-files"></i></div>
            <div>
              <div className="stat-val">{summary.totalComplaints ?? 0}</div>
              <div className="stat-label">Total Complaints</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 col-xl">
          <div className="stat-card">
            <div className="stat-icon bg-warning-subtle text-warning"><i className="bi bi-clock"></i></div>
            <div>
              <div className="stat-val">{summary.pending ?? 0}</div>
              <div className="stat-label">Pending Review</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 col-xl">
          <div className="stat-card">
            <div className="stat-icon bg-purple-subtle text-purple" style={{backgroundColor: '#ede9fe', color: '#6d28d9'}}>
              <i className="bi bi-person-check-fill"></i>
            </div>
            <div>
              <div className="stat-val">{summary.assigned ?? 0}</div>
              <div className="stat-label">Assigned</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 col-xl">
          <div className="stat-card">
            <div className="stat-icon bg-info-subtle text-info"><i className="bi bi-tools"></i></div>
            <div>
              <div className="stat-val">{summary.inProgress ?? 0}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 col-xl">
          <div className="stat-card">
            <div className="stat-icon bg-success-subtle text-success"><i className="bi bi-check2-all"></i></div>
            <div>
              <div className="stat-val">{summary.resolved ?? 0}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 col-xl">
          <div className="stat-card">
            <div className="stat-icon bg-dark-subtle text-dark"><i className="bi bi-archive-fill"></i></div>
            <div>
              <div className="stat-val">{summary.closed ?? 0}</div>
              <div className="stat-label">Closed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold mb-3"><i className="bi bi-pie-chart-fill text-primary me-2"></i>Complaints by Category</h5>
            <div style={{height: 250}}>
              <canvas id="categoryChart"></canvas>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold mb-3"><i className="bi bi-bar-chart-fill text-primary me-2"></i>Complaints by Status</h5>
            <div style={{height: 250}}>
              <canvas id="statusChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Management Table */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="card-header bg-white border-bottom p-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search ID, title, citizen, location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyUp={(e) => { if (e.key === 'Enter') fetchComplaints(); }}
                />
                <button onClick={fetchComplaints} className="btn btn-outline-secondary">Search</button>
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="Street Light">Street Light</option>
                <option value="Water Pipe Leakage">Water Pipe Leakage</option>
                <option value="Rain Water Drainage">Rain Water Drainage</option>
                <option value="Roadside Cleaning">Roadside Cleaning</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-2 text-end">
              <span className="text-muted small fw-semibold">Count: {complaints.length}</span>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Complaint ID</th>
                <th>Citizen</th>
                <th>Category & Title</th>
                <th>Location</th>
                <th>Assigned Staff</th>
                <th>Status</th>
                <th className="text-end">Management Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No complaints found matching the criteria.
                  </td>
                </tr>
              ) : complaints.map(c => (
                <tr key={c._id}>
                  <td className="fw-bold font-monospace text-primary">{c.complaint_id}</td>
                  <td>
                    <div className="fw-semibold small">{c.user_id?.name || 'Citizen'}</div>
                    <div className="text-muted" style={{fontSize: '0.75rem'}}>{c.user_id?.phone || ''}</div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border me-1 small">{c.category}</span>
                    <div className="fw-medium text-truncate" style={{maxWidth: 200}} title={c.title}>
                      {c.title}
                    </div>
                  </td>
                  <td className="small text-muted text-truncate" style={{maxWidth: 150}}>
                    {c.location}
                  </td>
                  <td>
                    {c.assigned_staff_id ? (
                      <div>
                        <div className="fw-bold small text-dark">{c.assigned_staff_id.name}</div>
                        <div className="text-muted" style={{fontSize: '0.72rem'}}>{c.assigned_staff_id.department}</div>
                      </div>
                    ) : (
                      <span className="badge bg-warning-subtle text-warning">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-status ${getStatusBadgeClass(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <button onClick={() => openDetailsModal(c)} className="btn btn-outline-secondary" title="View Details">
                        <i className="bi bi-eye"></i>
                      </button>
                      <button onClick={() => openAssignModal(c)} className="btn btn-outline-primary" title="Assign Staff">
                        <i className="bi bi-person-plus"></i> Assign
                      </button>
                      <button onClick={() => openStatusModal(c)} className="btn btn-outline-success" title="Change Status">
                        <i className="bi bi-arrow-repeat"></i> Status
                      </button>
                      <button onClick={() => handleDelete(c._id, c.complaint_id)} className="btn btn-outline-danger" title="Delete Complaint">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Assign Staff Modal */}
      <div className="modal fade" id="assignModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleAssignSubmit}>
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Assign Complaint to Staff</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <p className="small text-muted">
                  Assign complaint <strong className="font-monospace text-primary">{assignModalData?.complaint_id}</strong> to a field officer.
                </p>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Select Staff Member</label>
                  <select
                    className="form-select"
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Field Staff --</option>
                    {staffList.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.name} - {s.department}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Assignment Remarks / Instructions</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Instructions for technician (e.g. prioritize due to safety hazards)..."
                    value={assignRemarks}
                    onChange={(e) => setAssignRemarks(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary fw-bold">Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 2. Status Change Modal */}
      <div className="modal fade" id="statusModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleStatusSubmit}>
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Update Complaint Status</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <p className="small text-muted">
                  Updating status for <strong className="font-monospace text-primary">{statusModalData?.complaint_id}</strong>
                </p>
                <div className="mb-3">
                  <label className="form-label fw-semibold">New Status</label>
                  <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} required>
                    <option value="Submitted">Submitted</option>
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Update Remarks <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Provide details about the status update..."
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-success fw-bold">Save Status Update</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 3. View Details Modal */}
      {viewDetailsData && (
        <div className="modal fade" id="adminDetailsModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">Complaint Overview</h5>
                  <span className="font-monospace text-primary small">{viewDetailsData.complaint_id}</span>
                </div>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-7">
                    <h6><strong>Title:</strong> {viewDetailsData.title}</h6>
                    <p className="p-3 bg-light rounded small">{viewDetailsData.description}</p>
                    <p><strong>Citizen:</strong> {viewDetailsData.user_id?.name} ({viewDetailsData.user_id?.email})</p>
                    <p><strong>Location:</strong> {viewDetailsData.location} (Landmark: {viewDetailsData.landmark || 'N/A'})</p>
                    <p><strong>Current Status:</strong> <span className={`badge badge-status ${getStatusBadgeClass(viewDetailsData.status)}`}>{viewDetailsData.status}</span></p>
                  </div>
                  <div className="col-md-5 text-center">
                    <label className="fw-bold small text-muted mb-2">Photo Evidence</label>
                    {viewDetailsData.image ? (
                      <img src={`${API_BASE}${viewDetailsData.image}`} className="img-fluid rounded border" alt="Evidence" />
                    ) : (
                      <div className="p-4 bg-light rounded text-muted small">No photo uploaded</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <a href={`track-complaint.html?id=${viewDetailsData.complaint_id}`} target="_blank" className="btn btn-outline-primary btn-sm">
                  View Public Track Page <i className="bi bi-box-arrow-up-right ms-1"></i>
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

ReactDOM.createRoot(document.getElementById('root')).render(<AdminDashboard />);