const { useState, useEffect } = React;

function MyComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    if (!checkAuth(['citizen', 'admin', 'staff'])) return;
    fetchComplaints();
  }, [categoryFilter, statusFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (categoryFilter !== 'all') queryParams.append('category', categoryFilter);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (search.trim()) queryParams.append('search', search.trim());

      const res = await fetch(`${API_BASE}/api/complaints?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setComplaints(data.data || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const openDetails = (item) => {
    setSelectedComplaint(item);
    const elem = document.getElementById('complaintModal');
    if (elem) {
      const m = new bootstrap.Modal(elem);
      m.show();
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">My Registered Complaints</h2>
          <p className="text-muted mb-0">Browse, filter, and review the history of all complaints submitted by you.</p>
        </div>
        <a href="complaint.html" className="btn btn-civic shadow-sm">
          <i className="bi bi-plus-circle me-1"></i> Register New Complaint
        </a>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by ID, Title, or Location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Street Light">Street Light</option>
              <option value="Water Pipe Leakage">Water Pipe Leakage</option>
              <option value="Rain Water Drainage">Rain Water Drainage</option>
              <option value="Roadside Cleaning">Roadside Cleaning</option>
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
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

          <div className="col-md-2">
            <button type="submit" className="btn btn-outline-primary w-100">
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Complaints Table */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-2">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-folder-x fs-1 text-muted"></i>
            <h5 className="fw-bold mt-2">No complaints matched your search</h5>
            <p className="text-muted small">Try changing the category/status filter or submit a new grievance.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{width: 140}}>Complaint ID</th>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id}>
                    <td className="fw-bold text-primary font-monospace">{c.complaint_id}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {c.category}
                      </span>
                    </td>
                    <td className="fw-semibold text-truncate" style={{maxWidth: 220}}>
                      {c.title}
                    </td>
                    <td className="text-muted small text-truncate" style={{maxWidth: 160}}>
                      {c.location}
                    </td>
                    <td className="text-muted small">
                      {formatDate(c.created_at)}
                    </td>
                    <td>
                      <span className={`badge badge-status ${getStatusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button onClick={() => openDetails(c)} className="btn btn-outline-primary">
                          <i className="bi bi-eye me-1"></i> Details
                        </button>
                        <a href={`track-complaint.html?id=${c.complaint_id}`} className="btn btn-outline-secondary">
                          <i className="bi bi-geo-alt"></i>
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

      {/* Details Modal */}
      {selectedComplaint && (
        <div className="modal fade" id="complaintModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">Complaint Overview</h5>
                  <span className="badge bg-primary-subtle text-primary font-monospace">{selectedComplaint.complaint_id}</span>
                </div>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-7">
                    <div className="mb-2">
                      <label className="text-muted small fw-bold">TITLE</label>
                      <h5 className="fw-bold">{selectedComplaint.title}</h5>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted small fw-bold">DESCRIPTION</label>
                      <div className="p-3 bg-light rounded-3 small">{selectedComplaint.description}</div>
                    </div>
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <label className="text-muted small fw-bold">LOCATION</label>
                        <div>{selectedComplaint.location}</div>
                      </div>
                      <div className="col-6">
                        <label className="text-muted small fw-bold">LANDMARK</label>
                        <div>{selectedComplaint.landmark || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="text-muted small fw-bold">STATUS</label>
                      <div>
                        <span className={`badge badge-status ${getStatusBadgeClass(selectedComplaint.status)}`}>
                          {selectedComplaint.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-5">
                    <label className="text-muted small fw-bold mb-1">IMAGE ATTACHMENT</label>
                    {selectedComplaint.image ? (
                      <div className="bg-light p-2 rounded text-center">
                        <img
                          src={`${API_BASE}${selectedComplaint.image}`}
                          alt="Evidence"
                          className="complaint-img-preview img-fluid"
                          onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Photo'; }}
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-light rounded text-center text-muted small">
                        No image provided
                      </div>
                    )}

                    {selectedComplaint.assigned_staff_id && (
                      <div className="mt-3 p-3 bg-light rounded border small">
                        <div className="fw-bold text-dark mb-1"><i className="bi bi-person-badge text-primary me-1"></i> Assigned Staff:</div>
                        <div>{selectedComplaint.assigned_staff_id.name}</div>
                        <div className="text-muted">{selectedComplaint.assigned_staff_id.department}</div>
                        {selectedComplaint.assigned_staff_id.phone && (
                          <div className="mt-1">📞 {selectedComplaint.assigned_staff_id.phone}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <a href={`track-complaint.html?id=${selectedComplaint.complaint_id}`} className="btn btn-civic btn-sm">
                  <i className="bi bi-activity me-1"></i> Track Progress & Remarks
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

ReactDOM.createRoot(document.getElementById('root')).render(<MyComplaintsPage />);