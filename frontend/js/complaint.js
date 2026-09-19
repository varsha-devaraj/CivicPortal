const { useState, useEffect } = React;

function ComplaintRegistrationForm() {
  const [category, setCategory] = useState('Street Light');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (!checkAuth(['citizen', 'admin', 'staff'])) return;

    // Check URL parameters for preset category
    const params = new URLSearchParams(window.location.search);
    const urlCategory = params.get('category');
    if (urlCategory) {
      setCategory(urlCategory);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    // Validation
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorMsg('Invalid image format. Only JPG, JPEG, PNG, and WEBP are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 5 MB.');
      return;
    }

    setErrorMsg('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!category || !title.trim() || !description.trim() || !location.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('location', location.trim());
      formData.append('landmark', landmark.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch(`${API_BASE}/api/complaints`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setErrorMsg(result.message || 'Failed to submit complaint.');
        setLoading(false);
        return;
      }

      setSuccessData(result.data);
      setLoading(false);
    } catch (err) {
      setErrorMsg('Network error. Unable to contact backend.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setLandmark('');
    setImageFile(null);
    setImagePreview(null);
    setSuccessData(null);
    setErrorMsg('');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          
          {/* Success Banner / Card */}
          {successData ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <div className="rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center p-3 mb-3 mx-auto" style={{width: 80, height: 80}}>
                <i className="bi bi-check-lg fs-1"></i>
              </div>
              <h3 className="fw-bold text-success mb-2">Complaint registered successfully!</h3>
              <p className="text-muted">Your report has been received and added to the municipal queue.</p>
              
              <div className="bg-light p-4 rounded-3 my-4 border text-center">
                <div className="text-muted small text-uppercase fw-bold mb-1">Generated Complaint Tracking ID</div>
                <div className="display-6 fw-bold text-primary font-monospace">{successData.complaint_id}</div>
                <div className="text-muted small mt-2">Please save this ID to track live updates on resolution progress.</div>
              </div>

              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <a href={`track-complaint.html?id=${successData.complaint_id}`} className="btn btn-civic px-4 py-2">
                  <i className="bi bi-geo-alt me-1"></i> Track Live Status
                </a>
                <a href="my-complaints.html" className="btn btn-outline-primary px-4 py-2">
                  <i className="bi bi-list-check me-1"></i> View My Complaints
                </a>
                <button onClick={resetForm} className="btn btn-outline-secondary px-3 py-2">
                  Register Another Complaint
                </button>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              <div className="mb-4">
                <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold mb-2">
                  Civic Grievance Form
                </span>
                <h3 className="fw-bold mb-1">Register a New Civic Complaint</h3>
                <p className="text-muted small">Provide clear details to help municipal staff locate and resolve the issue quickly.</p>
              </div>

              {errorMsg && (
                <div className="alert alert-danger d-flex align-items-center small py-2 mb-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{errorMsg}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Category Selection */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Complaint Category <span className="text-danger">*</span></label>
                  <select
                    className="form-select form-select-lg"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="Street Light">💡 Street Light Problems</option>
                    <option value="Water Pipe Leakage">💧 Water Pipe Leakage</option>
                    <option value="Rain Water Drainage">🌧️ Rain Water Drainage</option>
                    <option value="Roadside Cleaning">🧹 Roadside Cleaning</option>
                  </select>
                </div>

                {/* Title */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Complaint Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Broken pole lamp flickering at corner of 4th cross"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Detailed Description <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Describe the problem, severity, duration, and any immediate safety hazards..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                {/* Location & Landmark */}
                <div className="row g-3 mb-3">
                  <div className="col-md-7">
                    <label className="form-label fw-semibold">Exact Location / Area / Ward <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-light"><i className="bi bi-geo-alt text-muted"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Sector 14, 5th Main Road"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-5">
                    <label className="form-label fw-semibold">Nearby Landmark</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light"><i className="bi bi-pin-map text-muted"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Opp. City Public School"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Upload Complaint Photo <span className="text-muted small fw-normal">(Optional, max 5MB - JPG, PNG, WEBP)</span>
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleImageChange}
                  />

                  {imagePreview && (
                    <div className="mt-3 p-2 bg-light rounded text-center">
                      <div className="small text-muted mb-1">Image Preview:</div>
                      <img src={imagePreview} alt="Upload preview" className="complaint-img-preview" />
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="d-flex justify-content-end gap-2">
                  <a href="dashboard.html" className="btn btn-light px-4">Cancel</a>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-civic px-5 py-2 fw-bold shadow-sm"
                  >
                    {loading ? (
                      <span><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</span>
                    ) : (
                      <span>Submit Complaint <i className="bi bi-send ms-1"></i></span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ComplaintRegistrationForm />);