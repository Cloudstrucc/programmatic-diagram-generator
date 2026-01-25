// server.js - Main Application Entry Point
require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/diagram-generator-web';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✓ MongoDB connected');
  
  // Start server
  app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  CloudStrucc Diagram Generator - Web Application          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ API Server: ${process.env.API_URL || 'http://localhost:3000'}`);
    console.log('');
    console.log('Routes:');
    console.log('  GET    /              - Landing page');
    console.log('  GET    /login         - Login page');
    console.log('  GET    /register      - Registration page');
    console.log('  GET    /dashboard     - User dashboard');
    console.log('  GET    /generator     - Diagram generator');
    console.log('  GET    /my-diagrams   - User diagrams');
    console.log('');
  });
})
.catch(err => {
  console.error('✗ MongoDB connection error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
