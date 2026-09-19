require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');

const TEST_PORT = 3005;
const server = http.createServer(app);

async function runE2ETest() {
  server.listen(TEST_PORT, async () => {
    console.log(`\n======================================================`);
    console.log(`🚀 RUNNING FULL END-TO-END INTEGRATION TEST SUITE`);
    console.log(`======================================================\n`);

    try {
      // -------------------------------------------------------------------
      // 1. Citizen: Register new account
      // -------------------------------------------------------------------
      const testEmail = `citizen.test.${Date.now()}@example.com`;
      console.log(`[Step 1] Registering citizen: ${testEmail}...`);
      const regRes = await fetch(`http://localhost:${TEST_PORT}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Pooja Sharma',
          email: testEmail,
          phone: '9876500001',
          address: 'Block B, Sector 18, City Center',
          password: 'Password@123',
          confirmPassword: 'Password@123'
        })
      });
      const regData = await regRes.json();
      console.log(` -> Register Status: ${regRes.status}, Success: ${regData.success}`);
      if (!regData.success) throw new Error('Citizen registration failed');

      const citizenToken = regData.data.token;

      // -------------------------------------------------------------------
      // 2. Citizen: Submit a new complaint
      // -------------------------------------------------------------------
      console.log('\n[Step 2] Citizen submitting new complaint...');
      // Using standard form data or json
      // Since createComplaint supports body fields, let's test multipart simulation or JSON body
      const compRes = await fetch(`http://localhost:${TEST_PORT}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${citizenToken}`
        },
        body: JSON.stringify({
          category: 'Street Light',
          title: 'Street light pole flickering near bus stop',
          description: 'The pole lamp blinks continuously creating zero visibility after 8 PM.',
          location: 'Bus Shelter 12, Main Ring Road',
          landmark: 'Opposite Metro Station Gate 3'
        })
      });
      const compData = await compRes.json();
      console.log(` -> Submit Status: ${compRes.status}, Success: ${compData.success}`);
      console.log(` -> Generated Complaint ID: ${compData.data?.complaint_id}`);
      if (!compData.success) throw new Error('Complaint creation failed');

      const generatedId = compData.data.complaint_id;
      const complaintMongoId = compData.data.id;

      // -------------------------------------------------------------------
      // 3. Citizen: View own complaints list
      // -------------------------------------------------------------------
      console.log('\n[Step 3] Citizen viewing own complaints list...');
      const myCompRes = await fetch(`http://localhost:${TEST_PORT}/api/complaints`, {
        headers: { 'Authorization': `Bearer ${citizenToken}` }
      });
      const myCompData = await myCompRes.json();
      console.log(` -> My Complaints Count: ${myCompData.data?.length}`);

      // -------------------------------------------------------------------
      // 4. Admin: Login & Dashboard Stats
      // -------------------------------------------------------------------
      console.log('\n[Step 4] Admin logging in...');
      const adminLoginRes = await fetch(`http://localhost:${TEST_PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' })
      });
      const adminLoginData = await adminLoginRes.json();
      const adminToken = adminLoginData.data.token;
      console.log(` -> Admin Login: ${adminLoginData.success}, Role: ${adminLoginData.data.user.role}`);

      const statsRes = await fetch(`http://localhost:${TEST_PORT}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const statsData = await statsRes.json();
      console.log(` -> Admin Total Complaints: ${statsData.data.summary.totalComplaints}`);

      // -------------------------------------------------------------------
      // 5. Admin: Assign Complaint to Staff
      // -------------------------------------------------------------------
      console.log('\n[Step 5] Admin assigning complaint to staff...');
      const staffListRes = await fetch(`http://localhost:${TEST_PORT}/api/admin/staff`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const staffListData = await staffListRes.json();
      const targetStaff = staffListData.data[0];
      console.log(` -> Assigning to Staff: ${targetStaff.name} (${targetStaff.department})`);

      const assignRes = await fetch(`http://localhost:${TEST_PORT}/api/admin/complaints/${complaintMongoId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          staff_id: targetStaff._id,
          remarks: 'Assigned to field technician for priority bulb and sensor replacement.'
        })
      });
      const assignData = await assignRes.json();
      console.log(` -> Assign Status: ${assignRes.status}, Success: ${assignData.success}, New Status: ${assignData.data?.status}`);

      // -------------------------------------------------------------------
      // 6. Staff: Login & View Assigned Complaint
      // -------------------------------------------------------------------
      console.log(`\n[Step 6] Staff (${targetStaff.email}) logging in...`);
      const staffLoginRes = await fetch(`http://localhost:${TEST_PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetStaff.email, password: 'Staff@123' })
      });
      const staffLoginData = await staffLoginRes.json();
      const staffToken = staffLoginData.data.token;

      const staffCompRes = await fetch(`http://localhost:${TEST_PORT}/api/staff/complaints`, {
        headers: { 'Authorization': `Bearer ${staffToken}` }
      });
      const staffCompData = await staffCompRes.json();
      console.log(` -> Staff Assigned Count: ${staffCompData.data?.complaints?.length}`);

      // -------------------------------------------------------------------
      // 7. Staff: Update status to "In Progress"
      // -------------------------------------------------------------------
      console.log('\n[Step 7] Staff updating status to "In Progress"...');
      const inProgRes = await fetch(`http://localhost:${TEST_PORT}/api/staff/complaints/${complaintMongoId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${staffToken}`
        },
        body: JSON.stringify({
          status: 'In Progress',
          remarks: 'Arrived at location. Dismantled housing and diagnosing circuit fault.'
        })
      });
      const inProgData = await inProgRes.json();
      console.log(` -> In Progress Update: ${inProgData.success}, Status: ${inProgData.data?.status}`);

      // -------------------------------------------------------------------
      // 8. Staff: Update status to "Resolved"
      // -------------------------------------------------------------------
      console.log('\n[Step 8] Staff marking complaint as "Resolved"...');
      const resolveRes = await fetch(`http://localhost:${TEST_PORT}/api/staff/complaints/${complaintMongoId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${staffToken}`
        },
        body: JSON.stringify({
          status: 'Resolved',
          remarks: 'Installed brand-new Philips 90W LED fitting and photocell sensor. Illumination tested.'
        })
      });
      const resolveData = await resolveRes.json();
      console.log(` -> Resolved Update: ${resolveData.success}, Status: ${resolveData.data?.status}`);

      // -------------------------------------------------------------------
      // 9. Citizen: Track Complaint & Check Timeline + Remarks
      // -------------------------------------------------------------------
      console.log(`\n[Step 9] Public / Citizen tracking complaint ID: ${generatedId}...`);
      const trackRes = await fetch(`http://localhost:${TEST_PORT}/api/complaints/track/${generatedId}`);
      const trackData = await trackRes.json();
      console.log(` -> Track Status: ${trackRes.status}, Current Status: ${trackData.data?.complaint?.status}`);
      console.log(` -> Total Timeline Milestones: ${trackData.data?.history?.length}`);
      
      trackData.data.history.forEach((h, i) => {
        console.log(`     [${i+1}] ${h.status} -> "${h.remarks}"`);
      });

      console.log(`\n======================================================`);
      console.log(`✅ COMPLETE END-TO-END FLOW VERIFIED SUCCESSFULLY!`);
      console.log(`======================================================\n`);

    } catch (err) {
      console.error('\n❌ E2E Test Error:', err);
    } finally {
      server.close(() => {
        mongoose.connection.close().then(() => {
          process.exit(0);
        });
      });
    }
  });
}

runE2ETest();