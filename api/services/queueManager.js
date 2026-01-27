// QueueManager - Complete Fixed Version
const redis = require('../config/redis');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const { EventEmitter } = require('events');
const execPromise = util.promisify(exec);

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
            diagramType: options.diagramType || 'python',
            style: options.style || options.templateType || 'azure',
            quality: options.quality || 'standard',
            outputFormat: options.outputFormat || 'png',
            timestamp: new Date()
        };
        
        this.queue.push(request);
        
        console.log(`✓ Enqueued: ${request.requestId}`);
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
        const { requestId, prompt, style, diagramType, quality, userId } = request;

        try {
            await this.updateRequestStatus(requestId, 'generating', {
                message: 'Generating diagram...',
                progress: 10
            });

            const result = await this.generateDiagramViaPython({
                prompt,
                style,
                diagramType,
                quality,
                requestId
            });

            await this.updateRequestStatus(requestId, 'completed', {
                message: 'Completed',
                progress: 100,
                result: result.imageData
            });

            await this.saveResultToDatabase(requestId, {
                status: 'completed',
                result: result.imageData,
                metadata: result.metadata,
                userId,
                completedAt: new Date()
            });

            this.emit('completed', {
                requestId,
                result: result.imageData,
                usage: {}
            });

            console.log(`✓ Completed: ${requestId}`);

        } catch (error) {
            console.error(`Failed: ${requestId}`, error);
            throw error;
        }
    }

    async generateDiagramViaPython(params) {
        const { prompt, style, diagramType, quality, requestId } = params;
        
        const scriptPath = path.join(__dirname, '../scripts/generate_diagram.py');
        
        const command = `python3.11 "${scriptPath}" \
            --prompt "${prompt.replace(/"/g, '\\"')}" \
            --style "${style}" \
            --type "${diagramType}" \
            --quality "${quality}" \
            --request-id "${requestId}"`;

        try {
            console.log(`Executing Python script...`);
            console.log(`Command: ${command}`);
            console.log(`Working dir: ${process.cwd()}`);
            console.log(`Script path: ${scriptPath}`);
            
            // FIXED: Add Graphviz to PATH and include ANTHROPIC_API_KEY
            const { stdout, stderr } = await execPromise(command, {
                maxBuffer: 10 * 1024 * 1024,
                timeout: 120000,
                cwd: path.join(__dirname, '..'),
                env: {
                    ...process.env,
                    PATH: `${process.env.PATH}:/usr/local/bin:/opt/homebrew/bin`,
                    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
                }
            });

            console.log('Python stdout:', stdout);
            if (stderr) {
                console.log('Python stderr:', stderr);
            }

            const result = JSON.parse(stdout);
            
            if (!result.success) {
                throw new Error(result.error || 'Generation failed');
            }
            
            return result;

        } catch (error) {
            console.error('Python error:', error);
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
                        error: data.error,
                        metadata: data.metadata,
                        completedAt: data.completedAt,
                        updatedAt: new Date()
                    }
                },
                { upsert: true }
            );
            
            console.log(`✓ DB saved: ${requestId}`);

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
                style: this.currentRequest.style,
                diagramType: this.currentRequest.diagramType
            } : null,
            upcomingRequests: this.queue.slice(0, 5).map(req => ({
                requestId: req.requestId,
                style: req.style,
                diagramType: req.diagramType
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