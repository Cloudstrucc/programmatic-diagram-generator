// QueueManager - Complete Version with Draw.io XML Support
const redis = require('../config/redis');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const { EventEmitter } = require('events');
const execPromise = util.promisify(exec);
const scriptPath = path.join(__dirname, '../scripts/generate_diagram.py');


class QueueManager extends EventEmitter {
    constructor(db, usageTracker) {
        super();
        this.db = db;
        this.usageTracker = usageTracker;
        this.queue = [];
        this.processing = false;
        this.currentRequest = null;
        this.wsClients = new Map();
    }

    setWebSocketServer(wss) {
        this.wss = wss;
    }

    broadcastUpdate(requestId, update) {
        const client = this.wsClients.get(requestId);
        if (client && client.readyState === 1) {
            client.send(JSON.stringify(update));
        }
    }

    async enqueue(options) {
        const request = {
            requestId: 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userId: options.userId,
            userTier: options.userTier,
            prompt: options.prompt,
            format: options.format || 'graphviz',
            diagramType: options.diagramType || 'python',
            templateType: options.templateType,  // For draw.io templates
            style: options.style || options.templateType || 'azure',
            quality: options.quality || 'standard',
            outputFormat: options.outputFormat || 'png',
            drawioNative: options.drawioNative || false,  // NEW: Draw.io XML export flag
            timestamp: new Date()
        };
        
        this.queue.push(request);
        
        console.log(`✓ Enqueued: ${request.requestId}`);
        console.log(`  Type: ${request.diagramType}`);
        console.log(`  Format: ${request.format}, Style: ${request.style}`);
        if (request.diagramType === 'python') {
            console.log(`  Quality: ${request.quality}, DrawioNative: ${request.drawioNative}`);
        }
        console.log(`  Queue length: ${this.queue.length}`);
        
        this.emit('enqueued', request);
        
        if (!this.processing) {
            this.processQueue();
        }

        return {
            success: true,
            requestId: request.requestId,
            position: this.queue.length,
            estimatedWaitTime: this.queue.length * 30,
            status: 'queued'
        };
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        while (this.queue.length > 0) {
            const request = this.queue.shift();
            this.currentRequest = request;

            try {
                console.log(`Processing: ${request.requestId}`);
                this.emit('processing', request);
                await this.processRequest(request);
            } catch (error) {
                console.error(`Processing error:`, error);
                await this.handleRequestFailure(request, error);
            }

            this.currentRequest = null;
        }

        this.processing = false;
    }

    async processRequest(request) {
        const { 
            requestId, 
            prompt, 
            style, 
            format, 
            diagramType, 
            templateType,
            quality, 
            userId, 
            drawioNative 
        } = request;

        try {
            await this.updateRequestStatus(requestId, 'generating', {
                message: 'Generating diagram...',
                progress: 10
            });

            let result;

            // Route to correct generator based on diagramType
            if (diagramType === 'drawio') {
                console.log(`🎨 Using Draw.io template generator (templateType: ${templateType})`);
                result = await this.generateDrawioDiagram({
                    prompt,
                    templateType,
                    style,
                    requestId
                });
            } else {
                console.log(`🐍 Using Python diagram generator`);
                result = await this.generateDiagramViaPython({
                    prompt,
                    style,
                    format: format || 'graphviz',
                    quality,
                    requestId,
                    drawioNative
                });
            }

            await this.updateRequestStatus(requestId, 'completed', {
                message: 'Completed',
                progress: 100,
                result: result.imageData,
                drawioXml: result.drawioXml
            });

            await this.saveResultToDatabase(requestId, {
                status: 'completed',
                result: result.imageData,
                drawioXml: result.drawioXml,
                svgData: result.svgData,
                metadata: result.metadata,
                userId,
                completedAt: new Date()
            });

            this.emit('completed', {
                requestId,
                result: result.imageData,
                drawioXml: result.drawioXml,
                usage: {}
            });

            console.log(`✓ Completed: ${requestId}`);
            console.log(`  Type: ${diagramType}`);
            console.log(`  Has imageData: ${!!result.imageData}`);
            console.log(`  Has drawioXml: ${!!result.drawioXml}, Length: ${result.drawioXml?.length || 0}`);

        } catch (error) {
            console.error(`Failed: ${requestId}`, error);
            throw error;
        }
    }

    /**
     * Generate diagram using Draw.io templates (your existing system)
     */
    async generateDrawioDiagram(params) {
        const { prompt, templateType, style, requestId } = params;
        
        console.log('🎨 Draw.io template generation:', { templateType, style });
        
        // TODO: Implement your existing Draw.io template generation here
        // This is placeholder - replace with your actual implementation
        
        throw new Error('Draw.io template generation not yet implemented in queueManager. Please implement generateDrawioDiagram() method.');
        
        // Example of what this should return:
        // return {
        //     imageData: base64ImageData,
        //     drawioXml: drawioXmlString,  // Optional
        //     metadata: { templateType, style }
        // };
    }

    /**
     * Generate diagram using Python script
     */
    async generateDiagramViaPython(params) {
        const { prompt, style, format, quality, requestId, drawioNative } = params;
        
        const diagramFormat = format || 'graphviz';
        
        // ============================================================================
        // ENHANCED DEBUGGING - Check environment variables before exec
        // ============================================================================
        console.log('\n🐍 Python Execution Environment:');
        console.log('================================');
        console.log('Format:', diagramFormat);
        console.log('Style:', style);
        console.log('Quality:', quality);
        console.log('DrawioNative:', drawioNative);
        console.log('ANTHROPIC_API_KEY available:', process.env.ANTHROPIC_API_KEY ? 'YES ✓' : 'NO ✗');
        console.log('APPSETTING_ANTHROPIC_API_KEY available:', process.env.APPSETTING_ANTHROPIC_API_KEY ? 'YES ✓' : 'NO ✗');
        
        if (process.env.ANTHROPIC_API_KEY) {
            console.log('API Key length:', process.env.ANTHROPIC_API_KEY.length);
            console.log('API Key starts with:', process.env.ANTHROPIC_API_KEY.substring(0, 10));
        }
        
        const allAnthropicKeys = Object.keys(process.env).filter(k => k.includes('ANTHROPIC'));
        console.log('All ANTHROPIC env keys:', allAnthropicKeys);
        console.log('================================\n');

        if (!process.env.ANTHROPIC_API_KEY && !process.env.APPSETTING_ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY not available in Node.js environment! Check Azure Portal configuration.');
        }
        // ============================================================================
        
        const scriptPath = path.join(__dirname, '../scripts/generate_diagram.py');
        
        const command = `python3.11 "${scriptPath}" \
            --prompt "${prompt.replace(/"/g, '\\"')}" \
            --format "${diagramFormat}" \
            --style "${style}" \
            --quality "${quality}" \
            --request-id "${requestId}"`;

        try {
            console.log(`Executing Python script...`);
            console.log(`Command: ${command}`);
            console.log(`Working dir: ${process.cwd()}`);
            console.log(`Script path: ${scriptPath}`);
            
            // Explicitly pass environment variables to child process
            const envVars = {
                ...process.env,
                PATH: `${process.env.PATH}:/usr/local/bin:/opt/homebrew/bin`,
                ANTHROPIC_API_KEY: process.env.APPSETTING_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
                CLAUDE_MODEL: process.env.APPSETTING_CLAUDE_MODEL || process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
                PYTHONUNBUFFERED: '1'
            };

            console.log('Environment variables being passed to Python:');
            console.log('- ANTHROPIC_API_KEY:', envVars.ANTHROPIC_API_KEY ? `Set (${envVars.ANTHROPIC_API_KEY.length} chars, starts with ${envVars.ANTHROPIC_API_KEY.substring(0, 20)}...)` : 'NOT SET');
            console.log('- PATH:', envVars.PATH?.substring(0, 100) + '...');
            
            const { stdout, stderr } = await execPromise(command, {
                maxBuffer: 10 * 1024 * 1024,
                timeout: 120000,
                cwd: path.join(__dirname, '..'),
                env: envVars
            });

            console.log('Python stdout:', stdout);
            if (stderr) {
                console.log('Python stderr:', stderr);
            }

            const result = JSON.parse(stdout);
            
            if (!result.success) {
                throw new Error(result.error || 'Generation failed');
            }
            
            // Debug logging for result
            console.log('✅ Python result parsed:', {
                success: result.success,
                hasImageData: !!result.imageData,
                imageDataLength: result.imageData?.length || 0,
                hasDrawioXml: !!result.drawioXml,
                drawioXmlLength: result.drawioXml?.length || 0,
                hasSvgData: !!result.svgData,
                format: result.format
            });
            
            return result;

        } catch (error) {
            console.error('❌ Python error:', error);
            console.error('Error details:', {
                message: error.message,
                stdout: error.stdout,
                stderr: error.stderr
            });
            throw new Error(`Diagram generation failed: ${error.message}`);
        }
    }

    async handleRequestFailure(request, error) {
        try {
            await this.updateRequestStatus(request.requestId, 'failed', {
                message: error.message,
                error: error.message
            });

            await this.saveResultToDatabase(request.requestId, {
                status: 'failed',
                error: error.message,
                userId: request.userId
            });

            this.emit('failed', {
                requestId: request.requestId,
                error: error.message,
                code: 'GENERATION_FAILED'
            });

        } catch (updateError) {
            console.error('Error update failed:', updateError);
        }
    }

    async updateRequestStatus(requestId, status, data) {
        const update = {
            requestId,
            status,
            timestamp: new Date().toISOString(),
            ...data
        };

        // Redis disabled - using MongoDB only
        this.broadcastUpdate(requestId, update);
        return update;
    }

    async saveResultToDatabase(requestId, data) {
        try {
            if (!this.db) return;

            const collection = this.db.collection('queue');
            
            await collection.updateOne(
                { requestId },
                { 
                    $set: {
                        status: data.status,
                        result: data.result,
                        drawioXml: data.drawioXml,  // NEW: Save Draw.io XML
                        svgData: data.svgData,      // NEW: Save SVG data
                        error: data.error,
                        metadata: data.metadata,
                        completedAt: data.completedAt,
                        updatedAt: new Date()
                    }
                },
                { upsert: true }
            );
            
            console.log(`✓ DB saved: ${requestId}`);
            console.log(`  Has drawioXml: ${!!data.drawioXml}, Length: ${data.drawioXml?.length || 0}`);

        } catch (error) {
            console.error('DB save error:', error);
        }
    }

    async getRequestStatus(requestId) {
        try {
            // Use MongoDB only (Redis disabled)
            if (this.db) {
                const dbData = await this.db.collection('queue').findOne({ requestId });
                if (dbData) {
                    return {
                        requestId: dbData.requestId,
                        status: dbData.status,
                        result: dbData.result,
                        drawioXml: dbData.drawioXml,  // NEW: Return Draw.io XML
                        svgData: dbData.svgData,      // NEW: Return SVG data
                        error: dbData.error,
                        completedAt: dbData.completedAt,
                        position: 0
                    };
                }
            }

            console.log(`Request ${requestId} not found in database`);
            return null;
        } catch (error) {
            console.error('Status check error:', error);
            return null;
        }
    }

    async cancelRequest(requestId, userId) {
        const index = this.queue.findIndex(req => 
            req.requestId === requestId && req.userId === userId
        );
        
        if (index > -1) {
            this.queue.splice(index, 1);
            await this.updateRequestStatus(requestId, 'cancelled', {
                message: 'Cancelled by user'
            });
            this.emit('cancelled', { requestId });
            return true;
        }

        return false;
    }

    getQueueStatus() {
        return {
            queueLength: this.queue.length,
            processing: this.processing,
            currentRequest: this.currentRequest ? {
                requestId: this.currentRequest.requestId,
                diagramType: this.currentRequest.diagramType,
                format: this.currentRequest.format,
                style: this.currentRequest.style
            } : null,
            upcomingRequests: this.queue.slice(0, 5).map(req => ({
                requestId: req.requestId,
                diagramType: req.diagramType,
                format: req.format,
                style: req.style
            }))
        };
    }

    getStats() {
        return {
            totalQueued: this.queue.length,
            processing: this.processing,
            activeConnections: this.wsClients.size
        };
    }

    async restoreQueue() {
        console.log('Queue restored');
    }

    stopProcessing() {
        this.processing = false;
        console.log('Processing stopped');
    }
}

module.exports = QueueManager;