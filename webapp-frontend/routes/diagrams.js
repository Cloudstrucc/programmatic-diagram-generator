// routes/diagrams.js - Diagram Routes - FIXED FOR DRAW.IO
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { ensureAuthenticated } = require('../middleware/auth');
const Diagram = require('../models/Diagram');
const DiagramAPIClient = require('../services/diagramApiClient');
const fetch = require('node-fetch'); 


// webapp/routes/diagrams.js - Updated with Service Account Auth

async function callPythonAPI(options) {
    const apiUrl = process.env.API_URL || 'https://api-cloudstrucc-unique.azurewebsites.net';
    const serviceKey = process.env.SERVICE_ACCOUNT_KEY;
    
    // Validation
    if (!serviceKey) {
        throw new Error('SERVICE_ACCOUNT_KEY not configured. Please set it in Azure Portal.');
    }
    
    console.log('🔐 Preparing API call:', {
        url: apiUrl,
        hasServiceKey: !!serviceKey,
        serviceKeyLength: serviceKey?.length,
        serviceKeyPreview: serviceKey?.substring(0, 10) + '...',
        timestamp: new Date().toISOString()
    });
    
    const fullUrl = `${apiUrl}/api/diagram/generate`;
    
    const requestBody = {
        prompt: options.prompt,
        format: options.format,
        diagramType: 'python',
        style: options.style,
        quality: options.quality,
        drawioNative: options.drawioNative || false,
        request_id: options.requestId
    };
    
    console.log('📤 Request details:', {
        url: fullUrl,
        bodyKeys: Object.keys(requestBody),
        prompt: requestBody.prompt?.substring(0, 50) + '...'
    });
    
    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Service-Key': serviceKey  // ⚠️ SERVICE ACCOUNT AUTH
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('📥 Response received:', {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', {
                status: response.status,
                error: errorText
            });
            throw new Error(`API returned ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        
        console.log('✅ API Response parsed:', {
            success: result.success,
            hasRequestId: !!result.requestId,
            requestId: result.requestId
        });
        
        return result;
        
    } catch (error) {
        console.error('❌ API call failed:', {
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}


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

// Check Diagram Status (API) - FIXED VERSION
router.get('/status/:diagramId', ensureAuthenticated, async (req, res) => {
  try {
    const identifier = req.params.diagramId;
    let diagram;

    console.log('🔍 Status check for identifier:', identifier);

    // Check if it's a valid MongoDB ObjectId (24 hex chars)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    
    if (isValidObjectId) {
      console.log('   → Querying by MongoDB _id');
      diagram = await Diagram.findOne({
        _id: identifier,
        user: req.user._id
      });
    } else {
      console.log('   → Querying by requestId (UUID or req_ format)');
      diagram = await Diagram.findOne({
        requestId: identifier,
        user: req.user._id
      });
    }

    if (!diagram) {
      console.log('   ❌ Diagram not found');
      return res.status(404).json({ 
        success: false, 
        message: 'Diagram not found' 
      });
    }

    console.log('   ✅ Diagram found:', diagram._id);
    console.log('   status:', diagram.status);
    console.log('   has imageData:', !!diagram.imageData);
    console.log('   has drawioXml:', !!diagram.drawioXml);

    // Return current diagram status from database
    res.json({
      success: true,
      status: diagram.status,
      diagram: diagram.status === 'completed' ? {
        id: diagram._id,
        title: diagram.title,
        imageData: diagram.imageData,
        xmlData: diagram.xmlData,
        drawioXml: diagram.drawioXml,
        diagramType: diagram.diagramType
      } : null,
      error: diagram.error,
      position: 0
    });

  } catch (err) {
    console.error('❌ Error checking status:', err);
    console.error('   Stack:', err.stack);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Error checking status'
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