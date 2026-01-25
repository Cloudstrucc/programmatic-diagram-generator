// client-example.js - Example client for Diagram API
const WebSocket = require('ws');

class DiagramClient {
  constructor(apiUrl, apiKey) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.wsUrl = apiUrl.replace('http', 'ws').replace('https', 'wss');
  }

  /**
   * Generate a diagram with polling
   */
  async generateDiagram(prompt, options = {}) {
    try {
      // Submit request
      const response = await fetch(`${this.apiUrl}/api/diagram/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          prompt,
          diagramType: options.diagramType || 'mermaid',
          options: {
            maxTokens: options.maxTokens || 4096,
            temperature: options.temperature || 1.0
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.message}`);
      }

      const data = await response.json();
      console.log(`Request queued: ${data.requestId}`);
      console.log(`Position in queue: ${data.position}`);
      console.log(`Estimated wait: ${Math.ceil(data.estimatedWait / 1000)}s`);

      // Poll for completion
      return await this.pollForResult(data.requestId);

    } catch (error) {
      console.error('Generate error:', error.message);
      throw error;
    }
  }

  /**
   * Generate a diagram with WebSocket (real-time updates)
   */
  async generateDiagramWithWebSocket(prompt, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        // Submit request first
        const response = await fetch(`${this.apiUrl}/api/diagram/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          },
          body: JSON.stringify({
            prompt,
            diagramType: options.diagramType || 'mermaid',
            options: {
              maxTokens: options.maxTokens || 4096,
              temperature: options.temperature || 1.0
            }
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`API Error: ${error.message}`);
        }

        const data = await response.json();
        const requestId = data.requestId;

        console.log(`Request queued: ${requestId}`);

        // Connect to WebSocket
        const ws = new WebSocket(this.wsUrl);

        ws.on('open', () => {
          console.log('WebSocket connected');
          // Subscribe to updates
          ws.send(JSON.stringify({
            type: 'subscribe',
            requestId: requestId
          }));
        });

        ws.on('message', (message) => {
          const update = JSON.parse(message);
          console.log('Update:', update);

          if (update.type === 'status') {
            console.log(`Status: ${update.status}`);
            if (update.position) {
              console.log(`Position: ${update.position}`);
            }
          }

          if (update.type === 'processing') {
            console.log('Processing request...');
          }

          if (update.type === 'completed') {
            console.log('Diagram generated successfully!');
            ws.close();
            resolve({
              requestId,
              result: update.result,
              usage: update.usage
            });
          }

          if (update.type === 'failed') {
            console.error(`Request failed: ${update.error}`);
            ws.close();
            reject(new Error(update.error));
          }

          if (update.type === 'retry') {
            console.log(`Retrying (attempt ${update.attempt})...`);
          }
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        });

        ws.on('close', () => {
          console.log('WebSocket disconnected');
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Poll for request result
   */
  async pollForResult(requestId, maxAttempts = 120, interval = 2000) {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.checkStatus(requestId);

      if (status.status === 'completed') {
        console.log('Diagram completed!');
        return {
          requestId,
          result: status.result,
          tokensUsed: status.tokensUsed
        };
      }

      if (status.status === 'failed') {
        throw new Error(`Request failed: ${status.error?.message || 'Unknown error'}`);
      }

      if (status.status === 'cancelled') {
        throw new Error('Request was cancelled');
      }

      // Still processing
      if (status.position) {
        console.log(`Queue position: ${status.position}`);
      }

      await this.sleep(interval);
    }

    throw new Error('Request timeout - maximum polling attempts reached');
  }

  /**
   * Check request status
   */
  async checkStatus(requestId) {
    const response = await fetch(`${this.apiUrl}/api/diagram/status/${requestId}`, {
      headers: {
        'X-API-Key': this.apiKey
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Status check failed: ${error.message}`);
    }

    return await response.json();
  }

  /**
   * Cancel a request
   */
  async cancelRequest(requestId) {
    const response = await fetch(`${this.apiUrl}/api/diagram/cancel/${requestId}`, {
      method: 'DELETE',
      headers: {
        'X-API-Key': this.apiKey
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cancel failed: ${error.message}`);
    }

    return await response.json();
  }

  /**
   * Get usage statistics
   */
  async getUsage(timeWindow = 'day') {
    const response = await fetch(`${this.apiUrl}/api/diagram/usage?timeWindow=${timeWindow}`, {
      headers: {
        'X-API-Key': this.apiKey
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Usage check failed: ${error.message}`);
    }

    return await response.json();
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Example usage
async function main() {
  const client = new DiagramClient(
    'http://localhost:3000',
    'your-api-key-here'
  );

  try {
    console.log('\n=== Example 1: Generate with Polling ===\n');
    
    const result1 = await client.generateDiagram(
      'Create a flowchart showing the user authentication process',
      { diagramType: 'mermaid' }
    );

    console.log('\nResult:', result1.result.substring(0, 200) + '...');
    console.log('Tokens used:', result1.tokensUsed);

    console.log('\n=== Example 2: Generate with WebSocket ===\n');

    const result2 = await client.generateDiagramWithWebSocket(
      'Create a sequence diagram for a REST API call',
      { diagramType: 'mermaid' }
    );

    console.log('\nResult:', result2.result.substring(0, 200) + '...');
    console.log('Tokens used:', result2.usage.input_tokens + result2.usage.output_tokens);

    console.log('\n=== Example 3: Check Usage ===\n');

    const usage = await client.getUsage('day');
    console.log('Today\'s usage:', usage);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run examples if called directly
if (require.main === module) {
  main();
}

module.exports = DiagramClient;
