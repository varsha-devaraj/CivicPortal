const { useState } = React;

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Client-side validations
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMsg('Please fill in all profile fields.');
      return;
    }

    if (formData.phone.trim().length < 10) {
      setErrorMsg('Please enter a valid phone number of at least 10 digits.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMsg(result.message || 'Registration failed. Please check your details.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Account created successfully! Logging you in...');
      if (result.data && result.data.token) {
        setToken(result.data.token);
        setUser(result.data.user);
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1200);
      } else {
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1200);
      }
    } catch (err) {
      setErrorMsg('Server connection failed. Please ensure the backend is running.');
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5 bg-white">
            <div className="text-center mb-4">
              <div className="rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center p-3 mb-2" style={{width: 60, height: 60}}>
                <i className="bi bi-person-plus fs-3"></i>
              </div>
              <h3 className="fw-bold mb-1">Citizen Registration</h3>
              <p className="text-muted small">Create your civic account to submit and monitor municipal complaints</p>
            </div>

            {errorMsg && (
              <div className="alert alert-danger d-flex align-items-center small py-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{errorMsg}</div>
              </div>
            )}

            {successMsg && (
              <div className="alert alert-success d-flex align-items-center small py-2" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                <div>{successMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="bi bi-person text-muted"></i></span>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-envelope text-muted"></i></span>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-telephone text-muted"></i></span>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="10-digit mobile"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Residential Address / Ward</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="bi bi-geo-alt text-muted"></i></span>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    placeholder="House/Apartment, Street, Ward number"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Password (min 6 chars)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-lock text-muted"></i></span>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-shield-lock text-muted"></i></span>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-civic w-100 py-2 fw-bold shadow-sm"
              >
                {loading ? (
                  <span><span className="spinner-border spinner-border-sm me-2"></span>Registering...</span>
                ) : (
                  <span>Create Account <i className="bi bi-check2-circle ms-1"></i></span>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted small">Already have an account? </span>
              <a href="login.html" className="text-decoration-none fw-semibold">Sign In here</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<RegisterForm />);