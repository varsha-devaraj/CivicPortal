const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/complaint_system';
  const localUri = 'mongodb://127.0.0.1:27017/complaint_system';

  console.log('[Database] Connecting to MongoDB...');

  try {
    // Attempt connection with primary URI
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`[Database] MongoDB Connected Successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.error(`[Database Warning] Failed to connect using primary URI: ${error.message}`);

    // If Atlas connection failed and primary is not local, try local MongoDB fallback
    if (!primaryUri.includes('127.0.0.1') && !primaryUri.includes('localhost')) {
      console.log('[Database] Attempting fallback to local MongoDB (127.0.0.1:27017)...');
      try {
        await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 5000
        });
        console.log(`[Database] Connected to Local MongoDB Successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);
        return;
      } catch (localErr) {
        console.error(`[Database Error] Local MongoDB also unavailable: ${localErr.message}`);
      }
    }

    console.error('\n========================================================================');
    console.error('⚠️ MONGODB ATLAS IP WHITELIST NOTICE:');
    console.error('To allow MongoDB Atlas connections:');
    console.error('1. Go to https://cloud.mongodb.com and log in.');
    console.error('2. Click "Network Access" under Security in the left sidebar.');
    console.error('3. Click "Add IP Address" -> Select "Allow Access From Anywhere" (0.0.0.0/0).');
    console.error('4. Click "Confirm".');
    console.error('Alternatively, set MONGODB_URI=mongodb://127.0.0.1:27017/complaint_system in backend/.env');
    console.error('========================================================================\n');
    process.exit(1);
  }
};

module.exports = connectDB;