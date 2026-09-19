require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./connection');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');

async function seedDatabase() {
  try {
    await connectDB();
    console.log('[Seed] Starting database seeding...');

    // Clear existing collections if needed
    console.log('[Seed] Clearing existing collections for fresh setup...');
    await User.deleteMany({});
    await Staff.deleteMany({});
    await Complaint.deleteMany({});
    await ComplaintUpdate.deleteMany({});

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
    const staffPasswordHash = await bcrypt.hash('Staff@123', salt);
    const citizenPasswordHash = await bcrypt.hash('Citizen@123', salt);

    // 1. Create Admin User
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      phone: '9876543210',
      address: 'Municipal Corporation HQ, Civic Centre',
      password: adminPasswordHash,
      role: 'admin'
    });
    console.log(`[Seed] Admin user created: admin@example.com (Password: Admin@123)`);

    // 2. Create Staff Users & Profiles
    const staffUser1 = await User.create({
      name: 'Rajesh Sharma',
      email: 'staff@example.com',
      phone: '9876543211',
      address: 'Electrical Division Office, Ward 4',
      password: staffPasswordHash,
      role: 'staff'
    });
    const staff1 = await Staff.create({
      name: 'Rajesh Sharma',
      email: 'staff@example.com',
      phone: '9876543211',
      department: 'Street Light & Electrical',
      user_id: staffUser1._id
    });

    const staffUser2 = await User.create({
      name: 'Sunita Verma',
      email: 'sunita.water@example.com',
      phone: '9876543212',
      address: 'Water Works Board, North Zone',
      password: staffPasswordHash,
      role: 'staff'
    });
    const staff2 = await Staff.create({
      name: 'Sunita Verma',
      email: 'sunita.water@example.com',
      phone: '9876543212',
      department: 'Water Supply & Pipe Leakage',
      user_id: staffUser2._id
    });

    const staffUser3 = await User.create({
      name: 'Amit Patel',
      email: 'amit.sanitation@example.com',
      phone: '9876543213',
      address: 'Public Sanitation Department',
      password: staffPasswordHash,
      role: 'staff'
    });
    const staff3 = await Staff.create({
      name: 'Amit Patel',
      email: 'amit.sanitation@example.com',
      phone: '9876543213',
      department: 'Sanitation & Roadside Cleaning',
      user_id: staffUser3._id
    });

    console.log(`[Seed] Staff users created (e.g. staff@example.com / Staff@123)`);

    // 3. Create Sample Citizens
    const citizen1 = await User.create({
      name: 'Rahul Deshmukh',
      email: 'citizen@example.com',
      phone: '9876543220',
      address: 'Flat 302, Green Meadows, MG Road',
      password: citizenPasswordHash,
      role: 'citizen'
    });
    console.log(`[Seed] Sample citizen created: citizen@example.com (Password: Citizen@123)`);

    // 4. Create Sample Complaints with realistic civic data
    const complaint1 = await Complaint.create({
      complaint_id: 'CMP-2026-0001',
      user_id: citizen1._id,
      category: 'Street Light',
      title: 'Street Light flickering and completely dark at night',
      description: 'The street light pole #42 outside Green Meadows has been flickering and completely off for the last 4 days. Creates safety issues for pedestrians.',
      location: 'MG Road, Sector 5',
      landmark: 'Near Green Meadows Gate 2',
      status: 'In Progress',
      assigned_staff_id: staff1._id
    });

    await ComplaintUpdate.create({
      complaint_id: complaint1._id,
      updated_by_user_id: citizen1._id,
      status: 'Submitted',
      remarks: 'Complaint registered by citizen and queued for department verification.'
    });
    await ComplaintUpdate.create({
      complaint_id: complaint1._id,
      staff_id: staff1._id,
      updated_by_user_id: admin._id,
      status: 'Assigned',
      remarks: `Assigned to ${staff1.name} (${staff1.department}) for on-site inspection.`
    });
    await ComplaintUpdate.create({
      complaint_id: complaint1._id,
      staff_id: staff1._id,
      updated_by_user_id: staffUser1._id,
      status: 'In Progress',
      remarks: 'Field technician inspected the pole. Replacement LED ballast ordered and work initiated.'
    });

    const complaint2 = await Complaint.create({
      complaint_id: 'CMP-2026-0002',
      user_id: citizen1._id,
      category: 'Water Pipe Leakage',
      title: 'Major pipeline rupture overflowing onto main road',
      description: 'Continuous heavy stream of potable water overflowing from the underground connection since early morning. Road is getting waterlogged.',
      location: 'Civil Lines, Crossroad 3',
      landmark: 'Opposite State Bank Branch',
      status: 'Resolved',
      assigned_staff_id: staff2._id
    });

    await ComplaintUpdate.create({
      complaint_id: complaint2._id,
      updated_by_user_id: citizen1._id,
      status: 'Submitted',
      remarks: 'Complaint registered by citizen.'
    });
    await ComplaintUpdate.create({
      complaint_id: complaint2._id,
      staff_id: staff2._id,
      updated_by_user_id: admin._id,
      status: 'Assigned',
      remarks: 'Dispatched emergency water repair squad.'
    });
    await ComplaintUpdate.create({
      complaint_id: complaint2._id,
      staff_id: staff2._id,
      updated_by_user_id: staffUser2._id,
      status: 'In Progress',
      remarks: 'Valve shut off and high-pressure PVC pipeline joint welded.'
    });
    await ComplaintUpdate.create({
      complaint_id: complaint2._id,
      staff_id: staff2._id,
      updated_by_user_id: staffUser2._id,
      status: 'Resolved',
      remarks: 'Leakage successfully sealed and normal water pressure restored.'
    });

    const complaint3 = await Complaint.create({
      complaint_id: 'CMP-2026-0003',
      user_id: citizen1._id,
      category: 'Roadside Cleaning',
      title: 'Garbage accumulation near market corner',
      description: 'Substantial debris and uncollected waste bins spilling onto the walkway.',
      location: 'Subhash Chowk Market',
      landmark: 'Behind Vegetable Stalls',
      status: 'Submitted'
    });

    await ComplaintUpdate.create({
      complaint_id: complaint3._id,
      updated_by_user_id: citizen1._id,
      status: 'Submitted',
      remarks: 'Complaint registered by citizen and queued for department verification.'
    });

    console.log('[Seed] Sample complaints and updates seeded successfully!');
    console.log('---------------------------------------------------------');
    console.log('Seed Complete! You can now log in with:');
    console.log('Admin:   admin@example.com   / Admin@123');
    console.log('Staff:   staff@example.com   / Staff@123');
    console.log('Citizen: citizen@example.com / Citizen@123');
    console.log('---------------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seedDatabase();