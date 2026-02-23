// api/middleware/auth.js - Authentication Middleware with Service Account Support
const jwt = require('jsonwebtoken');

/**
 * Standard JWT authentication for external clients
 */
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'No token provided'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.apiKey = decoded.userId;
    req.tier = decoded.tier || 'free';
    next();
  } catch (error) {
    console.error('JWT authentication failed:', error.message);
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Invalid token'
    });
  }
};

/**
 * Service account authentication for internal services (webapp)
 * Falls back to JWT if service key not present
 */
const authenticateServiceAccount = (req, res, next) => {
  const serviceKey = req.headers['x-service-key'];
  const expectedKey = process.env.SERVICE_ACCOUNT_KEY;
  
  console.log('🔐 Authentication attempt:', {
    hasServiceKey: !!serviceKey,
    hasExpectedKey: !!expectedKey,
    keysMatch: serviceKey === expectedKey,
    timestamp: new Date().toISOString()
  });
  
  // Try service account authentication first
  if (serviceKey && expectedKey) {
    if (serviceKey === expectedKey) {
      console.log('✅ Service account authenticated successfully');
      req.apiKey = 'webapp-service';
      req.tier = 'pro';  // Service account gets pro tier access
      req.isServiceAccount = true;
      return next();
    } else {
      console.warn('⚠️ Invalid service key provided');
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Invalid service key'
      });
    }
  }
  
  // Fall back to JWT authentication for external clients
  console.log('🔄 Falling back to JWT authentication');
  return authenticate(req, res, next);
};

/**
 * Rate limiting middleware (placeholder - implement with express-rate-limit)
 */
const rateLimit = (tier) => {
  return (req, res, next) => {
    // Skip rate limiting for service accounts
    if (req.isServiceAccount) {
      console.log('⏭️ Skipping rate limit for service account');
      return next();
    }
    
    // Implement rate limiting logic here
    // For now, just pass through
    next();
  };
};

module.exports = {
  authenticate,
  authenticateServiceAccount,
  rateLimit
};