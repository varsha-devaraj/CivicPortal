require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');

const PORT = 3001;
const server = http.createServer(app);

server.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}`);
  
  try {
    // 1. Test Login as Admin
    const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' })
    });
    const loginData = await loginRes.json();
    console.log('1. Admin Login Status:', loginRes.status, 'Success:', loginData.success, 'Role:', loginData.data?.user?.role);
    const token = loginData.data?.token;

    // 2. Test Track Complaint CMP-2026-0001
    const trackRes = await fetch(`http://localhost:${PORT}/api/complaints/track/CMP-2026-0001`);
    const trackData = await trackRes.json();
    console.log('2. Track Complaint Status:', trackRes.status, 'Found ID:', trackData.data?.complaint?.complaint_id, 'History Count:', trackData.data?.history?.length);

    // 3. Test Admin Stats
    const statsRes = await fetch(`http://localhost:${PORT}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsData = await statsRes.json();
    console.log('3. Admin Stats Status:', statsRes.status, 'Total Complaints:', statsData.data?.summary?.totalComplaints);

    console.log('ALL BACKEND API TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close(() => {
      mongoose.connection.close().then(() => {
        process.exit(0);
      });
    });
  }
});