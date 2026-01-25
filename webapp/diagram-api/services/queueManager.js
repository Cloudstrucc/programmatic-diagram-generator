// services/queueManager.js - Manage API request queue
const PythonDiagramGenerator = require('./pythonDiagramGenerator');
const EventEmitter = require('events');
const config = require('../config');

class QueueManager extends EventEmitter {
  constructor(db, usageTracker) {
    super();
    this.db = db;
    this.usageTracker = usageTracker;
    this.queue = [];
    this.processing = false;
    this.pythonGenerator = new PythonDiagramGenerator();
    this.activeRequests = new Map(); // Track concurrent requests per user
    this.retryQueue = [];
  }

  /**
   * Add request to queue
   */
  async enqueue(request) {
    const { userId, userTier, requestId, prompt, options, timestamp } = request;

    // Check user limits
    const userLimit = await this.usageTracker.checkUserLimit(userId, userTier);
    if (!userLimit.allowed) {
      throw {
        code: 'USER_LIMIT_EXCEEDED',
        message: `User limit exceeded: ${userLimit.reason}`,
        details: userLimit
      };
    }

    // Check concurrent request limit for user
    const tierLimits = config.rateLimits.tiers[userTier] || config.rateLimits.tiers.free;
    const userActiveCount = this.activeRequests.get(userId) || 0;
    
    if (userActiveCount >= tierLimits.maxConcurrent) {
      throw {
        code: 'CONCURRENT_LIMIT_EXCEEDED',
        message: `Maximum concurrent requests (${tierLimits.maxConcurrent}) exceeded for tier ${userTier}`,
        currentActive: userActiveCount
      };
    }

    // Check queue size
    if (this.queue.length >= config.queue.maxQueueSize) {
      throw {
        code: 'QUEUE_FULL',
        message: `Queue is full (${config.queue.maxQueueSize} requests)`,
        queueSize: this.queue.length
      };
    }

    // Create queue item
    const queueItem = {
      requestId: requestId || this.generateRequestId(),
      userId,
      userTier,
      prompt,
      options: options || {},
      timestamp: timestamp || new Date(),
      status: 'queued',
      retries: 0,
      priority: this.calculatePriority(userTier)
    };

    // Add to queue
    this.queue.push(queueItem);
    
    // Sort by priority (higher tier = higher priority)
    this.queue.sort((a, b) => b.priority - a.priority);

    // Store in database for persistence
    await this.db.collection(config.database.queueCollection).insertOne(queueItem);

    // Emit event
    this.emit('enqueued', queueItem);

    // Start processing if not already running
    if (!this.processing) {
      this.startProcessing();
    }

    return {
      requestId: queueItem.requestId,
      position: this.queue.findIndex(q => q.requestId === queueItem.requestId) + 1,
      estimatedWait: this.estimateWaitTime(queueItem)
    };
  }

  /**
   * Start processing queue
   */
  startProcessing() {
    if (this.processing) return;
    
    this.processing = true;
    this.processQueue();
  }

  /**
   * Process queue items
   */
  async processQueue() {
    while (this.processing && (this.queue.length > 0 || this.retryQueue.length > 0)) {
      try {
        // Check global rate limits
        const globalLimit = await this.usageTracker.checkGlobalLimit();
        
        if (!globalLimit.allowed) {
          console.log(`Global limit reached: ${globalLimit.reason}. Waiting ${globalLimit.retryAfter}s`);
          await this.sleep(globalLimit.retryAfter * 1000);
          continue;
        }

        // Process retry queue first
        if (this.retryQueue.length > 0) {
          const retryItem = this.retryQueue.shift();
          await this.processRequest(retryItem);
          continue;
        }

        // Process next item in main queue
        if (this.queue.length > 0) {
          const item = this.queue.shift();
          await this.processRequest(item);
        }

        // Wait before next iteration
        await this.sleep(config.queue.processingInterval);

      } catch (error) {
        console.error('Queue processing error:', error);
        await this.sleep(config.queue.processingInterval);
      }
    }

    this.processing = false;
  }

  /**
   * Process individual request
   */
  async processRequest(request) {
    try {
      this.processing = true;
      this.currentRequest = request;

      console.log(`Processing request ${request.requestId}`);

      // Broadcast status update
      this.broadcastUpdate(request.requestId, 'processing');

      let result;
      
      // Handle different diagram types
      if (request.diagramType === 'python') {
        // Python diagram generation
        result = await this.generatePythonDiagram(request);
      } else {
        // Draw.io diagram generation (existing)
        result = await this.generateDrawioDiagram(request);
      }

      // Update request as completed
      request.status = 'completed';
      request.result = result;
      request.completedAt = new Date();
      request.tokensUsed = result.tokensUsed || 0;

      await this.saveRequestToDatabase(request);

      // Broadcast completion
      this.broadcastUpdate(request.requestId, 'completed', result);

      console.log(`Request ${request.requestId} completed successfully`);
    } catch (error) {
      console.error(`Request ${request.requestId} failed:`, error);
      request.status = 'failed';
      request.error = {
        code: error.code,
        message: error.message,
        retries: request.retries
      };

      await this.saveRequestToDatabase(request);
      this.broadcastUpdate(request.requestId, 'failed', { error: error.message });

      if (request.retries < config.queue.maxRetries) {
        request.retries++;
        this.retryQueue.push(request);
        console.log(`Request ${request.requestId} added to retry queue (attempt ${request.retries})`);
      }
    } finally {
      this.processing = false;
      this.currentRequest = null;
      this.processQueue();
    }
  }

  /**
 * Generate Python diagram
 */
async generatePythonDiagram(request) {
  try {
    const options = {
      prompt: request.prompt,
      style: request.style || 'azure',
      quality: request.quality || 'standard',
      template: request.template || null,
      outputFormat: request.outputFormat || 'png'
    };

    const result = await this.pythonGenerator.generateDiagram(options);
    
    // Read the diagram file
    const fs = require('fs');
    const imageBuffer = fs.readFileSync(result.filePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    return {
      type: 'python',
      format: result.format,
      style: result.style,
      quality: result.quality,
      imageData: imageBase64,
      fileName: result.fileName,
      sourceCode: result.sourceCode,
      tokensUsed: 5000 // Approximate
    };
  } catch (error) {
    throw new Error(`Python diagram generation failed: ${error.message}`);
  }
}

/**
 * Generate Draw.io diagram (existing makeAnthropicRequest renamed)
 */
  async generateDrawioDiagram(request) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.queue.requestTimeout);
    
    try {
      const response = await fetch(config.anthropic.baseURL, {
        method: 'POST',
        headers: {
          'x-api-key': config.anthropic.apiKey,
          'anthropic-version': config.anthropic.apiVersion,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: config.anthropic.model,
          max_tokens: 8192,
          messages: [{
            role: 'user',
            content: this.drawioTemplates.generatePrompt(request.prompt, request.templateType)
          }],
          system: this.drawioTemplates.getSystemPrompt(request.templateType)
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content.find(item => item.type === 'text');
      
      if (!content) {
        throw new Error('No text content in response');
      }

      return {
        type: 'drawio',
        xml: content.text,
        tokensUsed: data.usage?.output_tokens || 0
      };
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }
  /**
   * Make request to Anthropic API
   */
  async makeAnthropicRequest(prompt, options) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.queue.requestTimeout);

    try {
      const response = await fetch(config.anthropic.baseURL, {
        method: 'POST',
        headers: {
          'x-api-key': config.anthropic.apiKey,
          'anthropic-version': config.anthropic.apiVersion,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: config.anthropic.model,
          max_tokens: options.maxTokens || 4096,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options.temperature || 1.0
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error = await response.json();
        throw {
          status: response.status,
          code: error.error?.type || 'API_ERROR',
          message: error.error?.message || 'Unknown API error',
          retryAfter: response.headers.get('retry-after')
        };
      }

      return await response.json();

    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  /**
   * Handle request errors with retry logic
   */
  async handleRequestError(item, error) {
    const { requestId, userId } = item;

    console.error(`Request ${requestId} failed:`, error);

    // Determine if error is retryable
    const retryable = this.isRetryableError(error);

    if (retryable && item.retries < config.queue.retryAttempts) {
      item.retries++;
      item.status = 'retrying';
      
      // Add to retry queue with exponential backoff
      setTimeout(() => {
        this.retryQueue.push(item);
      }, config.queue.retryDelay * Math.pow(2, item.retries - 1));

      this.emit('retry', { requestId, attempt: item.retries });

    } else {
      // Record failed request
      await this.usageTracker.recordUsage(userId, {
        tokensUsed: 0,
        success: false,
        errorCode: error.code || error.status || 'UNKNOWN'
      });

      // Update database
      await this.db.collection(config.database.queueCollection).updateOne(
        { requestId },
        { 
          $set: { 
            status: 'failed',
            failedAt: new Date(),
            error: {
              code: error.code || error.status,
              message: error.message,
              retries: item.retries
            }
          } 
        }
      );

      this.emit('failed', {
        requestId,
        error: error.message || 'Request failed',
        code: error.code
      });
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    const retryableCodes = [429, 500, 502, 503, 504];
    const retryableTypes = ['rate_limit_error', 'overloaded_error'];

    return retryableCodes.includes(error.status) || 
           retryableTypes.includes(error.code) ||
           error.name === 'AbortError';
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      retryQueueLength: this.retryQueue.length,
      processing: this.processing,
      activeRequests: Array.from(this.activeRequests.entries()).map(([userId, count]) => ({
        userId,
        count
      }))
    };
  }

  /**
   * Get request status
   */
  async getRequestStatus(requestId) {
    // Check in-memory queue first
    const queueItem = this.queue.find(q => q.requestId === requestId) ||
                      this.retryQueue.find(q => q.requestId === requestId);
    
    if (queueItem) {
      return {
        requestId,
        status: queueItem.status,
        position: this.queue.findIndex(q => q.requestId === requestId) + 1,
        retries: queueItem.retries
      };
    }

    // Check database
    const dbItem = await this.db.collection(config.database.queueCollection)
      .findOne({ requestId });

    if (dbItem) {
      return {
        requestId,
        status: dbItem.status,
        result: dbItem.result,
        error: dbItem.error,
        completedAt: dbItem.completedAt,
        tokensUsed: dbItem.tokensUsed
      };
    }

    return null;
  }

  /**
   * Cancel request
   */
  async cancelRequest(requestId, userId) {
    const index = this.queue.findIndex(q => q.requestId === requestId && q.userId === userId);
    
    if (index !== -1) {
      this.queue.splice(index, 1);
      
      await this.db.collection(config.database.queueCollection).updateOne(
        { requestId },
        { $set: { status: 'cancelled', cancelledAt: new Date() } }
      );

      this.emit('cancelled', { requestId });
      return true;
    }

    return false;
  }

  /**
   * Calculate priority based on user tier
   */
  calculatePriority(userTier) {
    const priorities = {
      enterprise: 4,
      pro: 3,
      basic: 2,
      free: 1
    };
    return priorities[userTier] || 1;
  }

  /**
   * Estimate wait time
   */
  estimateWaitTime(item) {
    const position = this.queue.findIndex(q => q.requestId === item.requestId);
    const avgProcessingTime = 5000; // 5 seconds average
    return position * avgProcessingTime;
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stop processing
   */
  stopProcessing() {
    this.processing = false;
  }

  /**
   * Restore queue from database on startup
   */
  async restoreQueue() {
    const pendingRequests = await this.db.collection(config.database.queueCollection)
      .find({ status: { $in: ['queued', 'processing', 'retrying'] } })
      .sort({ priority: -1, timestamp: 1 })
      .toArray();

    this.queue = pendingRequests;
    console.log(`Restored ${this.queue.length} pending requests from database`);

    if (this.queue.length > 0) {
      this.startProcessing();
    }
  }
}

module.exports = QueueManager;
