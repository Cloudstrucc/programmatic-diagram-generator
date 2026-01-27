// config.js - API Server Configuration
require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0'
  },

  database: {
    connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017/diagram-generator',
    usageCollection: 'usage',
    queueCollection: 'queue'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: '30d'
  },

  rateLimit: {
    free: 10,      // requests per day
    standard: 100,
    pro: 500,
    enterprise: 10000
  },

  queue: {
    maxSize: 1000,
    processingTimeout: 300000  // 5 minutes
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514'
  }
};