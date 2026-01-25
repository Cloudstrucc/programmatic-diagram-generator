// services/usageTracker.js - Track API usage per user and globally
const config = require('../config');

class UsageTracker {
  constructor(db) {
    this.db = db;
    this.cache = new Map(); // In-memory cache for quick lookups
  }

  /**
   * Get current usage for a user
   */
  async getUserUsage(userId, timeWindow = 'day') {
    const cacheKey = `${userId}-${timeWindow}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // Cache for 1 minute
        return cached.data;
      }
    }

    const now = new Date();
    let startTime;

    switch (timeWindow) {
      case 'minute':
        startTime = new Date(now.getTime() - 60000);
        break;
      case 'hour':
        startTime = new Date(now.getTime() - 3600000);
        break;
      case 'day':
        startTime = new Date(now.getTime() - 86400000);
        break;
      default:
        startTime = new Date(now.getTime() - 86400000);
    }

    // Query database for usage
    const usage = await this.db.collection(config.database.usageCollection).aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalTokens: { $sum: '$tokensUsed' },
          totalCost: { $sum: '$estimatedCost' }
        }
      }
    ]).toArray();

    const result = usage[0] || { totalRequests: 0, totalTokens: 0, totalCost: 0 };

    // Cache the result
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Get global API usage
   */
  async getGlobalUsage(timeWindow = 'minute') {
    const cacheKey = `global-${timeWindow}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 5000) { // Cache for 5 seconds
        return cached.data;
      }
    }

    const now = new Date();
    let startTime;

    switch (timeWindow) {
      case 'minute':
        startTime = new Date(now.getTime() - 60000);
        break;
      case 'hour':
        startTime = new Date(now.getTime() - 3600000);
        break;
      case 'day':
        startTime = new Date(now.getTime() - 86400000);
        break;
    }

    const usage = await this.db.collection(config.database.usageCollection).aggregate([
      {
        $match: {
          timestamp: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalTokens: { $sum: '$tokensUsed' }
        }
      }
    ]).toArray();

    const result = usage[0] || { totalRequests: 0, totalTokens: 0 };

    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Record API usage
   */
  async recordUsage(userId, requestData) {
    const record = {
      userId: userId,
      timestamp: new Date(),
      tokensUsed: requestData.tokensUsed || 0,
      inputTokens: requestData.inputTokens || 0,
      outputTokens: requestData.outputTokens || 0,
      model: requestData.model || config.anthropic.model,
      estimatedCost: this.calculateCost(requestData),
      success: requestData.success || false,
      errorCode: requestData.errorCode || null,
      diagramType: requestData.diagramType || 'unknown'
    };

    await this.db.collection(config.database.usageCollection).insertOne(record);

    // Invalidate cache for this user
    this.cache.delete(`${userId}-minute`);
    this.cache.delete(`${userId}-hour`);
    this.cache.delete(`${userId}-day`);
    this.cache.delete('global-minute');

    return record;
  }

  /**
   * Calculate estimated cost based on token usage
   * Prices as of Jan 2025 for Sonnet 4.5
   */
  calculateCost(requestData) {
    const inputTokenPrice = 3.00 / 1000000;  // $3 per million input tokens
    const outputTokenPrice = 15.00 / 1000000; // $15 per million output tokens

    const inputCost = (requestData.inputTokens || 0) * inputTokenPrice;
    const outputCost = (requestData.outputTokens || 0) * outputTokenPrice;

    return inputCost + outputCost;
  }

  /**
   * Check if user has exceeded their tier limits
   */
  async checkUserLimit(userId, userTier) {
    const tierLimits = config.rateLimits.tiers[userTier] || config.rateLimits.tiers.free;

    // Check daily limit
    const dayUsage = await this.getUserUsage(userId, 'day');
    if (dayUsage.totalRequests >= tierLimits.requestsPerDay) {
      return {
        allowed: false,
        reason: 'daily_limit_exceeded',
        limit: tierLimits.requestsPerDay,
        current: dayUsage.totalRequests,
        resetTime: this.getResetTime('day')
      };
    }

    // Check hourly limit
    const hourUsage = await this.getUserUsage(userId, 'hour');
    if (hourUsage.totalRequests >= tierLimits.requestsPerHour) {
      return {
        allowed: false,
        reason: 'hourly_limit_exceeded',
        limit: tierLimits.requestsPerHour,
        current: hourUsage.totalRequests,
        resetTime: this.getResetTime('hour')
      };
    }

    return { allowed: true };
  }

  /**
   * Check global API limits
   */
  async checkGlobalLimit() {
    // Check per-minute limits
    const minuteUsage = await this.getGlobalUsage('minute');
    
    if (minuteUsage.totalRequests >= config.rateLimits.requestsPerMinute) {
      return {
        allowed: false,
        reason: 'global_request_limit',
        retryAfter: 60 - (new Date().getSeconds())
      };
    }

    if (minuteUsage.totalTokens >= config.rateLimits.tokensPerMinute) {
      return {
        allowed: false,
        reason: 'global_token_limit',
        retryAfter: 60 - (new Date().getSeconds())
      };
    }

    return { allowed: true };
  }

  /**
   * Get time until limit reset
   */
  getResetTime(window) {
    const now = new Date();
    switch (window) {
      case 'minute':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 
                       now.getHours(), now.getMinutes() + 1, 0);
      case 'hour':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 
                       now.getHours() + 1, 0, 0);
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      default:
        return new Date(now.getTime() + 60000);
    }
  }

  /**
   * Get usage statistics for admin dashboard
   */
  async getUsageStats(startDate, endDate) {
    const stats = await this.db.collection(config.database.usageCollection).aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          totalRequests: { $sum: 1 },
          totalTokens: { $sum: '$tokensUsed' },
          totalCost: { $sum: '$estimatedCost' },
          uniqueUsers: { $addToSet: '$userId' },
          successfulRequests: {
            $sum: { $cond: ['$success', 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]).toArray();

    return stats.map(s => ({
      date: s._id.date,
      requests: s.totalRequests,
      tokens: s.totalTokens,
      cost: s.totalCost,
      uniqueUsers: s.uniqueUsers.length,
      successRate: (s.successfulRequests / s.totalRequests * 100).toFixed(2)
    }));
  }
}

module.exports = UsageTracker;
