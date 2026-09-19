// CivicReport Common Utility Library
const API_BASE = "https://civicportal-rvn1.onrender.com/";

function getToken() {
  return localStorage.getItem('civic_token');
}

function setToken(token) {
  localStorage.setItem('civic_token', token);
}

function getUser() {
  const user = localStorage.getItem('civic_user');
  return user ? JSON.parse(user) : null;
}

function setUser(user) {
  localStorage.setItem('civic_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('civic_token');
  localStorage.removeItem('civic_user');
}

function logout() {
  clearAuth();
  window.location.href = 'login.html';
}

function checkAuth(allowedRoles = []) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    clearAuth();
    window.location.href = 'login.html';
    return false;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    alert('Access denied: You do not have permission to view this page.');
    if (user.role === 'admin') window.location.href = 'admin.html';
    else if (user.role === 'staff') window.location.href = 'staff.html';
    else window.location.href = 'dashboard.html';
    return false;
  }

  return true;
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Submitted': return 'badge-Submitted';
    case 'Pending': return 'badge-Pending';
    case 'Assigned': return 'badge-Assigned';
    case 'In Progress': return 'badge-InProgress';
    case 'Resolved': return 'badge-Resolved';
    case 'Closed': return 'badge-Closed';
    case 'Rejected': return 'badge-Rejected';
    default: return 'badge-Submitted';
  }
}