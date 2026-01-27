// server.js - Main application server
const express = require('express');
const { MongoClient } = require('mongodb');
const WebSocket = require('ws');
const http = require('http');
const config = require('./config');
const UsageTracker = require('./services/usageTracker');
const QueueManager = require('./services/queueManager');
// const DrawioTemplateEngine = require('./services/drawioTemplates');
const { authenticate, authenticateApiKey, rateLimit, cors } = require('./middleware/auth');
const diagramRoutes = require('./routes/diagram');
// const PythonDiagramGenerator = require('./services/pythonDiagramGenerator');

class DiagramAPIServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    this.db = null;
    this.usageTracker = null;
    // this.pythonGenerator = null;
    this.queueManager = null;
    this.wsClients = new Map(); // Map requestId to WebSocket connections
  }

  /**
   * Initialize database connection
   */
  async initDatabase() {
    try {
      const client = await MongoClient.connect(config.database.connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      this.db = client.db();
      console.log('✓ Database connected');

      // Create indexes
      await this.createIndexes();

    } catch (error) {
      console.error('✗ Database connection failed:', error);
      process.exit(1);
    }
  }

  /**
   * Create database indexes for performance
   */
  async createIndexes() {
    // Usage collection indexes
    await this.db.collection(config.database.usageCollection).createIndex(
      { userId: 1, timestamp: -1 }
    );
    await this.db.collection(config.database.usageCollection).createIndex(
      { timestamp: -1 }
    );

    // Queue collection indexes
    await this.db.collection(config.database.queueCollection).createIndex(
      { requestId: 1 },
      { unique: true }
    );
    await this.db.collection(config.database.queueCollection).createIndex(
      { userId: 1, timestamp: -1 }
    );
    await this.db.collection(config.database.queueCollection).createIndex(
      { status: 1, priority: -1, timestamp: 1 }
    );

    console.log('✓ Database indexes created');
  }

  /**
   * Initialize services
   */
  async initServices() {
    // Initialize usage tracker
    this.usageTracker = new UsageTracker(this.db);
    console.log('✓ Usage tracker initialized');

    // Initialize queue manager
    this.queueManager = new QueueManager(this.db, this.usageTracker);
    
    // Set up queue event listeners
    this.setupQueueEventListeners();

    // Restore queue from database
    await this.queueManager.restoreQueue();
    console.log('✓ Queue manager initialized');

    // Initialize draw.io template engine
    // this.drawioEngine = new DrawioTemplateEngine();
    // console.log('✓ Draw.io template engine initialized');

    // Make services available to routes
    this.app.locals.db = this.db;
    this.app.locals.config = config;
    this.app.locals.usageTracker = this.usageTracker;
    this.app.locals.queueManager = this.queueManager;
    // this.app.locals.drawioEngine = this.drawioEngine;
  }

  /**
   * Setup queue event listeners for WebSocket notifications
   */
  setupQueueEventListeners() {
    this.queueManager.on('enqueued', (item) => {
      console.log(`Request ${item.requestId} enqueued`);
      this.notifyClient(item.requestId, {
        type: 'status',
        status: 'queued',
        position: this.queueManager.queue.findIndex(q => q.requestId === item.requestId) + 1
      });
    });

    this.queueManager.on('processing', (item) => {
      console.log(`Processing request ${item.requestId}`);
      this.notifyClient(item.requestId, {
        type: 'status',
        status: 'processing'
      });
    });

    this.queueManager.on('completed', (data) => {
      console.log(`Request ${data.requestId} completed`);
      this.notifyClient(data.requestId, {
        type: 'completed',
        result: data.result,
        usage: data.usage
      });
    });

    this.queueManager.on('failed', (data) => {
      console.log(`Request ${data.requestId} failed:`, data.error);
      this.notifyClient(data.requestId, {
        type: 'failed',
        error: data.error,
        code: data.code
      });
    });

    this.queueManager.on('retry', (data) => {
      console.log(`Request ${data.requestId} retrying (attempt ${data.attempt})`);
      this.notifyClient(data.requestId, {
        type: 'retry',
        attempt: data.attempt
      });
    });

    this.queueManager.on('cancelled', (data) => {
      console.log(`Request ${data.requestId} cancelled`);
      this.notifyClient(data.requestId, {
        type: 'cancelled'
      });
    });
  }

  /**
   * Notify WebSocket client
   */
  notifyClient(requestId, message) {
    const ws = this.wsClients.get(requestId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        requestId,
        timestamp: new Date().toISOString(),
        ...message
      }));
    }
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // CORS
    this.app.use(cors);

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });

    // Health check endpoint (no auth required)
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        queue: this.queueManager.getQueueStatus()
      });
    });
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    // Public routes
    this.app.use('/api/diagram', 
      rateLimit(60000, 100), // 100 requests per minute
      authenticate, // or authenticateApiKey
      diagramRoutes
    );

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Endpoint not found'
      });
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      console.error('Server error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      });
    });
  }

  /**
   * Setup WebSocket server for real-time updates
   */
  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket client connected');

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);

          if (data.type === 'subscribe' && data.requestId) {
            // Subscribe to updates for a specific request
            this.wsClients.set(data.requestId, ws);
            ws.send(JSON.stringify({
              type: 'subscribed',
              requestId: data.requestId
            }));
          }

          if (data.type === 'unsubscribe' && data.requestId) {
            this.wsClients.delete(data.requestId);
            ws.send(JSON.stringify({
              type: 'unsubscribed',
              requestId: data.requestId
            }));
          }

        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        // Remove all subscriptions for this client
        for (const [requestId, client] of this.wsClients.entries()) {
          if (client === ws) {
            this.wsClients.delete(requestId);
          }
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    console.log('✓ WebSocket server initialized');
  }

  /**
   * Start the server
   */
  async start() {
    try {
      console.log('Starting Diagram API Server...\n');

      // Initialize database
      await this.initDatabase();

      // Initialize services
      await this.initServices();

      // Setup Express
      this.setupMiddleware();
      this.setupRoutes();

      // Setup WebSocket
      this.setupWebSocket();

      // Start listening
      const port = config.server.port;
      this.server.listen(port, () => {
        console.log(`\n✓ Server running on port ${port}`);
        console.log(`✓ WebSocket server ready`);
        console.log(`\nEndpoints:`);
        console.log(`  POST   /api/diagram/generate`);
        console.log(`  GET    /api/diagram/status/:requestId`);
        console.log(`  DELETE /api/diagram/cancel/:requestId`);
        console.log(`  GET    /api/diagram/usage`);
        console.log(`  GET    /api/diagram/queue/status (admin)`);
        console.log(`  GET    /api/diagram/stats (admin)`);
        console.log(`  GET    /health`);
        console.log(`\nWebSocket: ws://localhost:${port}`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());

    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('\nShutting down gracefully...');

    // Stop processing new requests
    this.queueManager.stopProcessing();

    // Close WebSocket connections
    this.wss.clients.forEach(client => {
      client.close();
    });

    // Close server
    this.server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('Forced shutdown');
      process.exit(1);
    }, 30000);
  }
}

// Start server
if (require.main === module) {
  const server = new DiagramAPIServer();
  server.start();
}

module.exports = DiagramAPIServer;
