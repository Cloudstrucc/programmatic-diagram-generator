// api/routes/diagram.js - Diagram Routes with Service Account Auth
const express = require('express');
const router = express.Router();
const { authenticateServiceAccount, rateLimit } = require('../middleware/auth');

/**
 * Generate Diagram Endpoint
 * Supports both service account (webapp) and JWT (external clients)
 */
router.post('/generate', authenticateServiceAccount, async (req, res) => {
  try {
    console.log('📝 Diagram generation request:', {
      userId: req.apiKey,
      tier: req.tier,
      isServiceAccount: req.isServiceAccount,
      timestamp: new Date().toISOString()
    });

    const { 
      prompt, 
      diagramType = 'python',
      templateType = 'aws',
      template = null,
      style = 'azure',
      quality = 'standard',
      outputFormat = 'png',
      drawioNative = false,
      format = 'graphviz'
    } = req.body;

    // Validation
    if (!prompt) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Prompt is required'
      });
    }

    // Enqueue the diagram generation request
    const result = await req.app.locals.queueManager.enqueue({
      userId: req.apiKey,           // 'webapp-service' for service accounts
      userTier: req.tier,            // 'pro' for service accounts
      prompt,
      diagramType,
      templateType,
      template,
      format,
      style,
      quality,
      outputFormat,
      drawioNative
    });

    console.log('✅ Request enqueued:', result.requestId);

    res.json(result);

  } catch (error) {
    console.error('❌ Generate endpoint error:', error);
    res.status(500).json({
      error: 'GENERATION_ERROR',
      message: error.message
    });
  }
});

/**
 * Check Status Endpoint
 * No authentication required (uses requestId as credential)
 */
router.get('/status/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    console.log('🔍 Status check for:', requestId);
    
    const status = await req.app.locals.queueManager.getRequestStatus(requestId);
    
    if (!status) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Request not found'
      });
    }

    res.json(status);

  } catch (error) {
    console.error('❌ Status endpoint error:', error);
    res.status(500).json({
      error: 'STATUS_ERROR',
      message: error.message
    });
  }
});

/**
 * Health Check Endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'diagram-api'
  });
});

module.exports = router;