// routes/diagrams.js - Diagram Routes - FIXED FOR DRAW.IO
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
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
    const templates = [];
    const styles = ['azure', 'aws', 'gcp', 'kubernetes', 'generic'];
    
    // try {
    //   const templatesData = await DiagramAPIClient.getPythonTemplates(req.user);
    //   templates = templatesData.templates || [];
      
    //   const stylesData = await DiagramAPIClient.getPythonStyles(req.user);
    //   styles = stylesData.styles || [];
    // } catch (err) {
    //   console.error('Error fetching templates/styles:', err);
    // }

    res.render('generator', {
      title: 'Generate Diagram - Cloudstrucc',
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

router.post('/generate', async (req, res) => {
    try {
        const { title, prompt, format, style, quality, drawioNative } = req.body;
        
        console.log('🐛 Received request:', { title, format, style, quality, drawioNative });
        
        // Generate request ID
        const requestId = uuidv4();
        
        // Create initial diagram record
        const diagram = new Diagram({
            user: req.user._id,
            title,
            prompt,
            diagramFormat: format,
            diagramType: 'python',
            style,
            quality,
            status: 'generating',
            requestId: requestId
        });
        
        await diagram.save();
        console.log('✅ Created diagram with ID:', diagram._id);
        
        // Start async generation (don't wait for it)
        generateDiagramAsync(diagram._id, requestId, { prompt, format, style, quality, drawioNative });
        
        // Return immediately
        res.json({ 
            success: true, 
            diagramId: diagram._id,
            requestId: requestId 
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Separate async function for generation
async function generateDiagramAsync(diagramId, requestId, options) {
    try {
        console.log('🎨 Starting generation for:', diagramId);
        
        // Call Python API - THIS is where apiResponse is defined
        const apiResponse = await callPythonAPI({
            prompt: options.prompt,
            format: options.format,
            style: options.style,
            quality: options.quality,
            drawioNative: options.drawioNative,  // Pass this!
            requestId: requestId
        });
        
        console.log('🐛 API Response received');
        console.log('   - Has imageData:', !!apiResponse.imageData);
        console.log('   - Has drawioXml:', !!apiResponse.drawioXml);
        console.log('   - drawioXml length:', apiResponse.drawioXml?.length || 0);
        
        // Update diagram with results
        await Diagram.findByIdAndUpdate(diagramId, {
            imageData: apiResponse.imageData,
            drawioXml: apiResponse.drawioXml,  // ⚠️ CRITICAL LINE
            svgData: apiResponse.svgData,
            code: apiResponse.code,
            status: 'completed'
        });
        
        console.log('✅ Diagram updated successfully');
        
    } catch (error) {
        console.error('❌ Generation failed:', error);
        
        // Update diagram with error
        await Diagram.findByIdAndUpdate(diagramId, {
            status: 'failed',
            error: error.message
        });
    }
}

// Check Diagram Status (API)
router.get('/status/:diagramId', ensureAuthenticated, async (req, res) => {
  try {
    const identifier = req.params.diagramId;
    let diagram;

    // Try to find by requestId first (e.g., req_1769...)
    if (identifier.startsWith('req_')) {
      diagram = await Diagram.findOne({
        requestId: identifier,
        user: req.user._id
      });
    } else {
      // Fall back to finding by MongoDB _id
      diagram = await Diagram.findOne({
        _id: identifier,
        user: req.user._id
      });
    }

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
          drawioXml: diagram.drawioXml,  // ✅ ADDED THIS!
          diagramType: diagram.diagramType
        }
      });
    }

    // Check API status
    const apiStatus = await DiagramAPIClient.checkStatus(req.user, diagram.requestId);

    console.log('📥 API Status Response:');
    console.log('   status:', apiStatus.status);
    console.log('   has result:', !!apiStatus.result);
    console.log('   has drawioXml:', !!apiStatus.result?.drawioXml);

    if (apiStatus.status === 'completed') {
      // FIX 4: Save drawioXml from API response
      diagram.status = 'completed';
      
      // Handle both old format (result = string) and new format (result = object)
      if (typeof apiStatus.result === 'string') {
        diagram.imageData = apiStatus.result;
      } else {
        diagram.imageData = apiStatus.result.imageData || apiStatus.result;
        diagram.drawioXml = apiStatus.result.drawioXml || null;  // ✅ ADDED THIS!
        diagram.svgData = apiStatus.result.svgData || null;
      }
      
      diagram.tokensUsed = apiStatus.tokensUsed || 0;
      await diagram.save();

      console.log('✅ Diagram updated with results');
      console.log('   has imageData:', !!diagram.imageData);
      console.log('   has drawioXml:', !!diagram.drawioXml);
      console.log('   drawioXml length:', diagram.drawioXml ? diagram.drawioXml.length : 0);

      return res.json({
        success: true,
        status: 'completed',
        diagram: {
          id: diagram._id,
          title: diagram.title,
          imageData: diagram.imageData,
          xmlData: diagram.xmlData,
          drawioXml: diagram.drawioXml,  // ✅ ADDED THIS!
          diagramType: diagram.diagramType
        }
      });
    }

    if (apiStatus.status === 'failed') {
      diagram.status = 'failed';
      diagram.error = apiStatus.error || 'Generation failed';
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
    console.error('❌ Error checking status:', err);
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