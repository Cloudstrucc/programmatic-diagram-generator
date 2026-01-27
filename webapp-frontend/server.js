// server.js - Application Entry Point
const mongoose = require('mongoose');
const app = require('./app');

// Environment Variables
const PORT = process.env.PORT || process.env.WEBSITES_PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Start Server
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║ CloudStrucc Diagram Generator - Web Application           ║
╚════════════════════════════════════════════════════════════╝

✓ Server running on http://localhost:${PORT}
✓ API Server: ${process.env.API_URL || 'http://localhost:3000'}

Routes:
  GET    /              - Landing page
  GET    /login         - Login page
  GET    /register      - Registration page
  GET    /dashboard     - User dashboard
  GET    /generator     - Diagram generator
  GET    /my-diagrams   - User diagrams
`);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  
  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Close MongoDB connection (modern Mongoose - no callback)
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  
  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Close MongoDB connection (modern Mongoose - no callback)
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = server;