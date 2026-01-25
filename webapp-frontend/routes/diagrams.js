// routes/diagrams.js - Diagram Routes
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const Diagram = require('../models/Diagram');
const DiagramAPIClient = require('../services/diagramApiClient');

// Generator Page
router.get('/generator', ensureAuthenticated, async (req, res) => {
  try {
    // Check if user can create diagram
    req.user.resetDailyCount();
    await req.user.save();

    const canCreate = req.user.canCreateDiagram();
    const limits = req.user.getTierLimits();

    // Get available templates and styles
    let templates = [];
    let styles = [];
    
    try {
      const templatesData = await DiagramAPIClient.getPythonTemplates(req.user);
      templates = templatesData.templates || [];
      
      const stylesData = await DiagramAPIClient.getPythonStyles(req.user);
      styles = stylesData.styles || [];
    } catch (err) {
      console.error('Error fetching templates/styles:', err);
    }

    res.render('generator', {
      title: 'Generate Diagram - CloudStrucc',
      layout: 'main',
      canCreate,
      remaining: limits.diagramsPerDay - req.user.diagramsToday,
      limit: limits.diagramsPerDay,
      templates,
      styles
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading generator');
    res.redirect('/dashboard');
  }
});

// Generate Diagram (API)
router.post('/generate', ensureAuthenticated, async (req, res) => {
  try {
    const { title, prompt, diagramType, style, quality, template } = req.body;

    // Validate
    if (!title || !prompt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and prompt are required' 
      });
    }

    // Check if user can create diagram
    req.user.resetDailyCount();
    if (!req.user.canCreateDiagram()) {
      const limits = req.user.getTierLimits();
      return res.status(429).json({ 
        success: false, 
        message: `Daily limit reached (${limits.diagramsPerDay} diagrams/day)` 
      });
    }

    // Create diagram record
    const diagram = new Diagram({
      user: req.user._id,
      title,
      prompt,
      diagramType: diagramType || 'python',
      style: style || 'azure',
      quality: quality || 'standard',
      template: template || null,
      status: 'generating'
    });

    await diagram.save();

    // Call API to generate diagram
    const apiResponse = await DiagramAPIClient.generateDiagram(req.user, {
      prompt,
      diagramType: diagramType || 'python',
      style: style || 'azure',
      quality: quality || 'standard',
      template: template || null
    });

    // Update diagram with request ID
    diagram.requestId = apiResponse.requestId;
    await diagram.save();

    // Update user stats
    req.user.diagramsToday += 1;
    req.user.diagramsCreated += 1;
    req.user.lastDiagramDate = new Date();
    await req.user.save();

    res.json({ 
      success: true, 
      diagramId: diagram._id,
      requestId: apiResponse.requestId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Error generating diagram' 
    });
  }
});

// Check Diagram Status (API)
router.get('/status/:diagramId', ensureAuthenticated, async (req, res) => {
  try {
    const diagram = await Diagram.findOne({
      _id: req.params.diagramId,
      user: req.user._id
    });

    if (!diagram) {
      return res.status(404).json({ 
        success: false, 
        message: 'Diagram not found' 
      });
    }

    // If already completed, return stored data
    if (diagram.status === 'completed') {
      return res.json({
        success: true,
        status: 'completed',
        diagram: {
          id: diagram._id,
          title: diagram.title,
          imageData: diagram.imageData,
          xmlData: diagram.xmlData,
          diagramType: diagram.diagramType
        }
      });
    }

    // Check API status
    const apiStatus = await DiagramAPIClient.checkStatus(req.user, diagram.requestId);

    if (apiStatus.status === 'completed') {
      // Update diagram with results
      diagram.status = 'completed';
      
      if (apiStatus.result.type === 'python') {
        diagram.imageData = apiStatus.result.imageData;
        diagram.fileName = apiStatus.result.fileName;
      } else if (apiStatus.result.type === 'drawio') {
        diagram.xmlData = apiStatus.result.xml;
      }
      
      diagram.tokensUsed = apiStatus.result.tokensUsed || 0;
      await diagram.save();

      return res.json({
        success: true,
        status: 'completed',
        diagram: {
          id: diagram._id,
          title: diagram.title,
          imageData: diagram.imageData,
          xmlData: diagram.xmlData,
          diagramType: diagram.diagramType
        }
      });
    }

    if (apiStatus.status === 'failed') {
      diagram.status = 'failed';
      diagram.error = apiStatus.error?.message || 'Generation failed';
      await diagram.save();

      return res.json({
        success: false,
        status: 'failed',
        message: diagram.error
      });
    }

    // Still processing
    res.json({
      success: true,
      status: 'generating',
      position: apiStatus.position
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking status' 
    });
  }
});

// My Diagrams Page
router.get('/my-diagrams', ensureAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const diagrams = await Diagram.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Diagram.countDocuments({ user: req.user._id });
    const pages = Math.ceil(total / limit);

    res.render('my-diagrams', {
      title: 'My Diagrams - CloudStrucc',
      layout: 'main',
      diagrams,
      pagination: {
        page,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading diagrams');
    res.redirect('/dashboard');
  }
});

// View Single Diagram
router.get('/view/:id', ensureAuthenticated, async (req, res) => {
  try {
    const diagram = await Diagram.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!diagram) {
      req.flash('error_msg', 'Diagram not found');
      return res.redirect('/diagrams/my-diagrams');
    }

    res.render('view-diagram', {
      title: `${diagram.title} - CloudStrucc`,
      layout: 'main',
      diagram
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading diagram');
    res.redirect('/diagrams/my-diagrams');
  }
});

// Delete Diagram
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const diagram = await Diagram.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!diagram) {
      return res.status(404).json({ 
        success: false, 
        message: 'Diagram not found' 
      });
    }

    await diagram.deleteOne();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting diagram' 
    });
  }
});

// Toggle Favorite
router.post('/:id/favorite', ensureAuthenticated, async (req, res) => {
  try {
    const diagram = await Diagram.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!diagram) {
      return res.status(404).json({ 
        success: false, 
        message: 'Diagram not found' 
      });
    }

    diagram.favorite = !diagram.favorite;
    await diagram.save();

    res.json({ 
      success: true, 
      favorite: diagram.favorite 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating favorite' 
    });
  }
});

module.exports = router;
