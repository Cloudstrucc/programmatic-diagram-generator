// middleware/auth.js - Authentication and authorization middleware
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * CORS middleware
 */
function cors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}

/**
 * Verify JWT token and attach user to request
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);
    
    req.user = decoded;
    req.apiKey = decoded.apiKey;
    req.tier = decoded.tier || 'free';
    
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Invalid token'
    });
  }
}

/**
 * Authenticate using API key
 */
function authenticateApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'No API key provided'
      });
    }
    
    req.apiKey = apiKey;
    req.tier = 'free';
    
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Invalid API key'
    });
  }
}

/**
 * Rate limiting - returns a factory function
 */
function rateLimit(tier) {
  return function(req, res, next) {
    const limits = config.rateLimit;
    const maxRequests = limits[tier || req.tier || 'free'] || limits.free;
    
    req.rateLimit = {
      tier: tier || req.tier || 'free',
      limit: maxRequests,
      remaining: maxRequests
    };
    
    next();
  };
}

module.exports = {
  cors,
  authenticate,
  authenticateApiKey,
  rateLimit
};
