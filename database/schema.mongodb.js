/* global use, db */
// =============================================================================
// MongoDB Database & Collection Schema Setup
// Database Name: complaint_system
//
// This file is in MongoDB Playground format (.mongodb.js).
// You can run this directly in VS Code using the official MongoDB extension,
// or via mongosh in your terminal:
//   mongosh mongodb://127.0.0.1:27017/complaint_system schema.mongodb.js
// =============================================================================

// Select the database
use('complaint_system');

// Helper function to safely create or modify collection with validation
function ensureCollection(name, validator) {
  const existing = db.getCollectionNames();
  if (!existing.includes(name)) {
    db.createCollection(name, {
      validator: validator,
      validationAction: 'warn'
    });
    print(`Created collection: ${name}`);
  } else {
    try {
      db.runCommand({
        collMod: name,
        validator: validator,
        validationAction: 'warn'
      });
      print(`Updated schema validator for existing collection: ${name}`);
    } catch (e) {
      print(`Collection ${name} exists.`);
    }
  }
}

// -----------------------------------------------------------------------------
// 1. Users Collection
// -----------------------------------------------------------------------------
ensureCollection('users', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'email', 'phone', 'address', 'password', 'role'],
    properties: {
      name: { bsonType: 'string', description: 'Full Name - Required' },
      email: { bsonType: 'string', pattern: '^.+@.+$', description: 'Unique Email - Required' },
      phone: { bsonType: 'string', description: 'Phone - Required' },
      address: { bsonType: 'string', description: 'Address - Required' },
      password: { bsonType: 'string', description: 'Hashed Password - Required' },
      role: { enum: ['citizen', 'staff', 'admin'], description: 'Role' }
    }
  }
});
db.users.createIndex({ email: 1 }, { unique: true });

// -----------------------------------------------------------------------------
// 2. Staff Collection
// -----------------------------------------------------------------------------
ensureCollection('staff', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'email', 'phone', 'department'],
    properties: {
      name: { bsonType: 'string' },
      email: { bsonType: 'string' },
      phone: { bsonType: 'string' },
      department: {
        enum: [
          'Street Light & Electrical',
          'Water Supply & Pipe Leakage',
          'Drainage & Rainwater Management',
          'Sanitation & Roadside Cleaning',
          'General Civic Services'
        ]
      }
    }
  }
});
db.staff.createIndex({ email: 1 }, { unique: true });

// -----------------------------------------------------------------------------
// 3. Complaints Collection
// -----------------------------------------------------------------------------
ensureCollection('complaints', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['complaint_id', 'user_id', 'category', 'title', 'description', 'location', 'status'],
    properties: {
      complaint_id: {
        bsonType: 'string',
        pattern: '^CMP-[0-9]{4}-[0-9]{4}$'
      },
      user_id: { bsonType: 'objectId' },
      category: {
        enum: [
          'Street Light',
          'Water Pipe Leakage',
          'Rain Water Drainage',
          'Roadside Cleaning'
        ]
      },
      title: { bsonType: 'string' },
      description: { bsonType: 'string' },
      location: { bsonType: 'string' },
      status: {
        enum: [
          'Submitted',
          'Pending',
          'Assigned',
          'In Progress',
          'Resolved',
          'Closed',
          'Rejected'
        ]
      }
    }
  }
});
db.complaints.createIndex({ complaint_id: 1 }, { unique: true });
db.complaints.createIndex({ user_id: 1 });
db.complaints.createIndex({ status: 1 });
db.complaints.createIndex({ category: 1 });
db.complaints.createIndex({ assigned_staff_id: 1 });

// -----------------------------------------------------------------------------
// 4. Complaint Updates Collection (Audit Trail)
// -----------------------------------------------------------------------------
ensureCollection('complaintupdates', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['complaint_id', 'status', 'remarks'],
    properties: {
      complaint_id: { bsonType: 'objectId' },
      status: {
        enum: [
          'Submitted',
          'Pending',
          'Assigned',
          'In Progress',
          'Resolved',
          'Closed',
          'Rejected'
        ]
      },
      remarks: { bsonType: 'string' }
    }
  }
});
db.complaintupdates.createIndex({ complaint_id: 1 });
db.complaintupdates.createIndex({ created_at: -1 });

print('✅ MongoDB schema definitions and indexes ensured successfully for complaint_system!');