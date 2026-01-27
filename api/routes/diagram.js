// routes/diagram.js - Updated with draw.io template support
const express = require('express');
const router = express.Router();
const { authenticate, rateLimit } = require('../middleware/auth');

/**
 * GET /api/diagram/templates
 * List available diagram templates
 */
router.get('/templates', async (req, res) => {
  try {
    const drawioEngine = req.app.locals.drawioEngine;
    const templates = drawioEngine.getAvailableTemplates();

    res.json({
      success: true,
      templates: templates,
      supported: {
        cloud: ['aws', 'azure', 'gcp'],
        containers: ['kubernetes'],
        infrastructure: ['network', 'infrastructure'],
        modeling: ['flowchart', 'uml']
      }
    });

  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to retrieve templates'
    });
  }
});

/**
 * GET /api/diagram/templates/:type
 * Get detailed information about a specific template
 */
router.get('/templates/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const drawioEngine = req.app.locals.drawioEngine;

    const details = drawioEngine.getTemplateDetails(type);

    res.json({
      success: true,
      template: details.template,
      style: details.style,
      shapes: details.shapes,
      stencils: details.stencils
    });

  } catch (error) {
    if (error.message.includes('Unknown template')) {
      return res.status(404).json({
        error: 'TEMPLATE_NOT_FOUND',
        message: error.message
      });
    }

    console.error('Get template details error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to retrieve template details'
    });
  }
});

/**
 * POST /api/diagram/generate
 * Generate a diagram (supports both Mermaid and draw.io)
 */
router.post('/generate', authenticate, rateLimit('free'), async (req, res) => {
  try {
    const { 
      prompt, 
      diagramType = 'drawio',  // 'drawio' or 'python'
      templateType = 'aws',     // For draw.io
      template = null,          // For python (optional)
      style = 'azure',          // For python
      quality = 'standard',     // For python
      outputFormat = 'png'      // For python
    } = req.body;

    if (!prompt && !template) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Prompt or template is required'
      });
    }

    // Validate diagram type
    if (!['drawio', 'python'].includes(diagramType)) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'diagramType must be "drawio" or "python"'
      });
    }

    // Enqueue the request
    const result = await req.app.locals.queueManager.enqueue({
      userId: req.apiKey,
      userTier: req.tier,
      prompt,
      diagramType,
      templateType,    // Used for draw.io
      template,        // Used for python
      style,           // Used for python
      quality,         // Used for python
      outputFormat     // Used for python
    });

    res.json(result);
  } catch (error) {
    console.error('Generate diagram error:', error);
    
    if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'QUEUE_FULL') {
      return res.status(429).json({
        error: error.code,
        message: error.message
      });
    }

    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to process request'
    });
  }
});

/**
 * Get available Python diagram styles
 */
// router.get('/python/styles', authenticate, (req, res) => {
//   const styles = req.app.locals.pythonGenerator.getAvailableStyles();
//   res.json({
//     success: true,
//     styles
//   });
// });

/**
 * Get available Python diagram templates
 */
// router.get('/python/templates', authenticate, (req, res) => {
//   const templates = req.app.locals.pythonGenerator.getAvailableTemplates();
//   res.json({
//     success: true,
//     templates
//   });
// });

/**
 * GET /api/diagram/status/:requestId
 * Check status of a diagram generation request
 */
router.get('/status/:requestId', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Get status from queueManager (which checks MongoDB)
    const status = await req.app.locals.queueManager.getRequestStatus(requestId);
    
    if (!status) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Request not found'
      });
    }

    // Return the status
    res.json({
      requestId,
      status: status.status,
      position: status.position || 0,
      result: status.result,
      error: status.error,
      completedAt: status.completedAt
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to retrieve status'
    });
  }
});

/**
 * DELETE /api/diagram/cancel/:requestId
 * Cancel a queued request
 */
router.delete('/cancel/:requestId', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.apiKey;

    const cancelled = await req.app.locals.queueManager.cancelRequest(requestId, userId);

    if (!cancelled) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Request not found or already processed'
      });
    }

    res.json({
      success: true,
      message: 'Request cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to cancel request'
    });
  }
});

/**
 * GET /api/diagram/usage
 * Get usage statistics for current user
 */
router.get('/usage', authenticate, async (req, res) => {
  try {
    const userId = req.apiKey;
    const { timeWindow = 'day' } = req.query;

    const usage = await req.app.locals.usageTracker.getUserUsage(userId, timeWindow);

    res.json({
      timeWindow,
      usage: {
        requests: usage.totalRequests,
        tokens: usage.totalTokens,
        estimatedCost: usage.totalCost
      }
    });

  } catch (error) {
    console.error('Usage check error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to retrieve usage'
    });
  }
});

/**
 * GET /api/diagram/queue/status
 * Get current queue status (admin only)
 */
router.get('/queue/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const status = req.app.locals.queueManager.getQueueStatus();
    res.json(status);
  } catch (error) {
    console.error('Queue status error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to retrieve queue status'
    });
  }
});

/**
 * GET /api/diagram/stats
 * Get usage statistics (admin only)
 */
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await req.app.locals.usageTracker.getUsageStats(start, end);

    res.json({
      startDate: start,
      endDate: end,
      stats
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to retrieve statistics'
    });
  }
});

/**
 * POST /api/diagram/validate/drawio
 * Validate draw.io XML (useful for testing)
 */
router.post('/validate/drawio', async (req, res) => {
  try {
    const { xml } = req.body;

    if (!xml) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'XML content is required'
      });
    }

    const drawioEngine = req.app.locals.drawioEngine;
    const validation = drawioEngine.validateDrawioXML(xml);

    res.json({
      valid: validation.valid,
      error: validation.error || null
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to validate XML'
    });
  }
});

/**
 * Middleware to require admin access
 */
function requireAdmin(req, res, next) {
  if (!req.tier || req.tier !== 'enterprise') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Admin access required'
    });
  }
  next();
}

module.exports = router;
