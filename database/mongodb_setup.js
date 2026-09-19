/**
 * MongoDB Setup & Indexing Script for Civic Complaint System
 * Can be run using: mongosh mongodb://127.0.0.1:27017/complaint_system mongodb_setup.js
 * Or: node mongodb_setup.js
 */

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = "complaint_system";

async function setupDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB server");
    const db = client.db(dbName);

    // Create Collections if they do not exist
    const collections = await db.listCollections().toArray();
    const collNames = collections.map(c => c.name);

    if (!collNames.includes('users')) {
      await db.createCollection('users');
      console.log("Collection 'users' created.");
    }
    if (!collNames.includes('complaints')) {
      await db.createCollection('complaints');
      console.log("Collection 'complaints' created.");
    }
    if (!collNames.includes('staff')) {
      await db.createCollection('staff');
      console.log("Collection 'staff' created.");
    }
    if (!collNames.includes('complaintupdates')) {
      await db.createCollection('complaintupdates');
      console.log("Collection 'complaintupdates' created.");
    }

    // Indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('complaints').createIndex({ complaint_id: 1 }, { unique: true });
    await db.collection('complaints').createIndex({ user_id: 1 });
    await db.collection('complaints').createIndex({ status: 1 });
    await db.collection('complaints').createIndex({ category: 1 });
    await db.collection('staff').createIndex({ email: 1 }, { unique: true });
    await db.collection('complaintupdates').createIndex({ complaint_id: 1 });

    console.log("MongoDB indexes ensured successfully!");
  } catch (err) {
    console.error("Setup error:", err);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;