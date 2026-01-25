require('dotenv').config();

module.exports = {
  // Server
  server: {
    port: parseInt(process.env.PORT || '3000'),
  },
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  database: {
    connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017/diagram-api',
    usageCollection: process.env.USAGE_COLLECTION || 'usage',
    queueCollection: process.env.QUEUE_COLLECTION || 'queue',
    requestsCollection: process.env.REQUESTS_COLLECTION || 'requests',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },

  // Anthropic API
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
    baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1/messages',
    apiVersion: process.env.ANTHROPIC_API_VERSION || '2023-06-01',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },

  // Queue configuration
  queue: {
    maxQueueSize: parseInt(process.env.MAX_QUEUE_SIZE || '100'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '5000'),
    processingTimeout: parseInt(process.env.PROCESSING_TIMEOUT || '300000'), // 5 minutes
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '120000'), // 2 minutes
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'),
    free: parseInt(process.env.RATE_LIMIT_FREE || '10'),
    basic: parseInt(process.env.RATE_LIMIT_BASIC || '100'),
    pro: parseInt(process.env.RATE_LIMIT_PRO || '500'),
    enterprise: parseInt(process.env.RATE_LIMIT_ENTERPRISE || '5000'),
  },

  // Rate limits with tiers
  rateLimits: {
    tiers: {
      free: {
        requestsPerDay: 10,
        tokensPerDay: 100000,
      },
      basic: {
        requestsPerDay: 100,
        tokensPerDay: 1000000,
      },
      pro: {
        requestsPerDay: 500,
        tokensPerDay: 5000000,
      },
      enterprise: {
        requestsPerDay: 5000,
        tokensPerDay: 50000000,
      },
    },
  },

  // Diagram Generation
  diagrams: {
    outputDir: process.env.DIAGRAMS_OUTPUT_DIR || './diagrams',
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_DIAGRAMS || '3'),
  },
};
