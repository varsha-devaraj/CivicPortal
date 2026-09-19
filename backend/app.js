require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./src/db/connection');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const staffRoutes = require('./src/routes/staffRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Core Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded complaint images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Civic Complaint System API is running smoothly.' });
});

// Fallback route for frontend HTML navigation
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found.' });
  }
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Application Error]:', err.message);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Image size exceeds maximum limit of 5MB.'
      });
    }
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error. Please try again later.'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 Online Complaint System Backend Server Started!`);
    console.log(`📡 Server Port: ${PORT}`);
    console.log(`🌐 Application URL: http://localhost:${PORT}`);
    console.log(`📁 Static Frontend served from ../frontend`);
    console.log(`===================================================`);
  });
}

module.exports = app;