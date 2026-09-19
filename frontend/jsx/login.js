const { useState } = React;

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDemoFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('Admin@123');
    } else if (role === 'staff') {
      setEmail('staff@example.com');
      setPassword('Staff@123');
    } else {
      setEmail('citizen@example.com');
      setPassword('Citizen@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMsg(result.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Login successful! Redirecting...');
      setToken(result.data.token);
      setUser(result.data.user);

      setTimeout(() => {
        const role = result.data.user.role;
        if (role === 'admin') {
          window.location.href = 'admin.html';
        } else if (role === 'staff') {
          window.location.href = 'staff.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 900);
    } catch (err) {
      setErrorMsg('Unable to connect to backend server. Ensure server is running on port 3000.');
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5 bg-white">
            <div className="text-center mb-4">
              <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center p-3 mb-2" style={{width: 60, height: 60}}>
                <i className="bi bi-box-arrow-in-right fs-3"></i>
              </div>
              <h3 className="fw-bold mb-1">Sign In to CivicReport</h3>
              <p className="text-muted small">Access your civic dashboard & complaints</p>
            </div>

            {/* Quick Demo Credentials Bar */}
            <div className="p-3 bg-light rounded-3 mb-4 border">
              <div className="small fw-bold text-muted mb-2 text-uppercase" style={{fontSize: '0.72rem'}}>
                ⚡ Quick Demo Login (Click to fill):
              </div>
              <div className="d-flex gap-1 flex-wrap">
                <button type="button" onClick={() => handleDemoFill('citizen')} className="btn btn-outline-primary btn-sm flex-fill py-1" style={{fontSize: '0.8rem'}}>
                  👤 Citizen
                </button>
                <button type="button" onClick={() => handleDemoFill('staff')} className="btn btn-outline-success btn-sm flex-fill py-1" style={{fontSize: '0.8rem'}}>
                  🛠️ Staff
                </button>
                <button type="button" onClick={() => handleDemoFill('admin')} className="btn btn-outline-danger btn-sm flex-fill py-1" style={{fontSize: '0.8rem'}}>
                  🛡️ Admin
                </button>
              </div>
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
                <label className="form-label fw-semibold small">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="bi bi-envelope text-muted"></i></span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. citizen@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="bi bi-lock text-muted"></i></span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-civic w-100 py-2 fw-bold shadow-sm"
              >
                {loading ? (
                  <span><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</span>
                ) : (
                  <span>Sign In <i className="bi bi-arrow-right ms-1"></i></span>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted small">Need an account? </span>
              <a href="register.html" className="text-decoration-none fw-semibold">Register as Citizen</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<LoginForm />);