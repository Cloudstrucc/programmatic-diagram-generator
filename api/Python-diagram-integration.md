# Python Diagram Generator Integration - Step by Step

This integrates Python diagram generation alongside existing draw.io functionality.

## Step 1: Copy the Python Generator Service

```bash
# Download pythonDiagramGenerator.js from outputs
# Place it in: webapp/diagram-api/services/
cp ~/Downloads/pythonDiagramGenerator.js webapp/diagram-api/services/
```

## Step 2: Copy ai-diagram.js to API directory

```bash
# Copy your CLI tool to the API directory
cp /path/to/ai-diagram-COMPLETE-v6.1.js webapp/diagram-api/ai-diagram.js
```

## Step 3: Update server.js

Add import at top (around line 10):
```javascript
const PythonDiagramGenerator = require('./services/pythonDiagramGenerator');
```

Add to constructor (around line 20):
```javascript
this.pythonGenerator = null;
```

Add initialization in start() method (around line 295):
```javascript
// Initialize Python diagram generator
this.pythonGenerator = new PythonDiagramGenerator();
this.app.locals.pythonGenerator = this.pythonGenerator;
console.log('✓ Python diagram generator initialized');
```

## Step 4: Update queueManager.js

### A. Add import at top:
```javascript
const PythonDiagramGenerator = require('./pythonDiagramGenerator');
```

### B. Add to constructor:
```javascript
this.pythonGenerator = new PythonDiagramGenerator();
```

### C. Update processRequest method (around line 140):

Replace the existing processRequest with this:

```javascript
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
```

### D. Add new methods (add after processRequest):

```javascript
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
```

## Step 5: Update routes/diagram.js

Update the generate endpoint (around line 90):

```javascript
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
```

## Step 6: Add new endpoint for getting Python styles/templates

Add to routes/diagram.js:

```javascript
/**
 * Get available Python diagram styles
 */
router.get('/python/styles', authenticate, (req, res) => {
  const styles = req.app.locals.pythonGenerator.getAvailableStyles();
  res.json({
    success: true,
    styles
  });
});

/**
 * Get available Python diagram templates
 */
router.get('/python/templates', authenticate, (req, res) => {
  const templates = req.app.locals.pythonGenerator.getAvailableTemplates();
  res.json({
    success: true,
    templates
  });
});
```

## Step 7: Restart Server

```bash
lsof -ti:3000 | xargs kill -9
node server.js
```

## Testing

### Test Draw.io (Existing - Still Works)
```bash
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat .jwt-token)" \
  -d '{
    "prompt": "3-tier web application",
    "diagramType": "drawio",
    "templateType": "aws"
  }'
```

### Test Python Diagram (NEW!)
```bash
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat .jwt-token)" \
  -d '{
    "prompt": "Azure AKS cluster with SQL database",
    "diagramType": "python",
    "style": "azure",
    "quality": "enterprise"
  }'
```

### Test Python with Template
```bash
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat .jwt-token)" \
  -d '{
    "template": "m365-cmk",
    "diagramType": "python",
    "style": "azure",
    "quality": "enterprise"
  }'
```

### Get Python Styles
```bash
curl http://localhost:3000/api/diagram/python/styles \
  -H "Authorization: Bearer $(cat .jwt-token)"
```

### Get Python Templates
```bash
curl http://localhost:3000/api/diagram/python/templates \
  -H "Authorization: Bearer $(cat .jwt-token)"
```

## API Request Formats

### Draw.io Diagram
```json
{
  "prompt": "Your architecture description",
  "diagramType": "drawio",
  "templateType": "aws|azure|gcp|kubernetes|network|infrastructure|uml|flowchart"
}
```

### Python Diagram (Custom Prompt)
```json
{
  "prompt": "Your architecture description",
  "diagramType": "python",
  "style": "azure|aws|gcp|k8s|generic|...",
  "quality": "simple|standard|enterprise",
  "outputFormat": "png"
}
```

### Python Diagram (Using Template)
```json
{
  "template": "m365-cmk|aws-serverless|k8s-microservices|...",
  "diagramType": "python",
  "style": "azure",
  "quality": "enterprise",
  "outputFormat": "png"
}
```

## Response Formats

### Python Diagram Response
```json
{
  "requestId": "req_xxx",
  "status": "completed",
  "result": {
    "type": "python",
    "format": "png",
    "style": "azure",
    "quality": "enterprise",
    "imageData": "base64-encoded-png-data...",
    "fileName": "diagram_xxx.png",
    "sourceCode": "/path/to/diagram.py",
    "tokensUsed": 5000
  }
}
```

### Draw.io Response (Existing)
```json
{
  "requestId": "req_xxx",
  "status": "completed",
  "result": {
    "type": "drawio",
    "xml": "```xml\n<mxGraphModel>...</mxGraphModel>\n```",
    "tokensUsed": 5550
  }
}
```

## Summary

✅ Both diagram types work side-by-side
✅ Same queue system for both
✅ Same authentication and rate limiting
✅ Python diagrams use your existing CLI tool
✅ Draw.io diagrams still work exactly as before
✅ Both count toward API usage limits

You now have a unified API that supports:
- **Draw.io** - Editable XML diagrams (collaborative)
- **Python** - PNG images with official cloud provider icons (presentation-ready)