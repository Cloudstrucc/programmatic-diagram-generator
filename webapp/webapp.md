# Diagram Generator API Server

A production-ready Node.js API server for AI-powered diagram generation with intelligent queue management, rate limiting, and subscription tier support.

## Features

- **Intelligent Queue Management**: Handles multiple concurrent requests with priority-based processing
- **Rate Limiting**: Per-user and global rate limits with automatic retry logic
- **Subscription Tiers**: Support for Free, Basic, Pro, and Enterprise tiers with different quotas
- **Usage Tracking**: Comprehensive token and cost tracking per user
- **Real-time Updates**: WebSocket support for live request status updates
- **Graceful Degradation**: Exponential backoff and retry logic for API failures
- **Scalable Architecture**: Database-backed queue persistence for reliability

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │─────▶│  API Server  │─────▶│   Queue     │
│  (Diagram)  │      │  (Rate Limit)│      │  Processor  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │                      │
                            ▼                      ▼
                     ┌──────────────┐      ┌─────────────┐
                     │   Database   │      │  Anthropic  │
                     │ (Usage Track)│      │     API     │
                     └──────────────┘      └─────────────┘
```

## Installation

### Prerequisites

- Node.js 18+ 
- MongoDB 5+
- Anthropic API Key (5x or 20x plan)

### Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd diagram-api
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB:
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use your existing MongoDB instance
```

5. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## Configuration

### Subscription Tiers

Configure tier limits in `config.js`:

```javascript
tiers: {
  free: {
    requestsPerDay: 10,
    requestsPerHour: 5,
    maxConcurrent: 1
  },
  basic: {
    requestsPerDay: 100,
    requestsPerHour: 20,
    maxConcurrent: 2
  },
  pro: {
    requestsPerDay: 500,
    requestsPerHour: 100,
    maxConcurrent: 5
  },
  enterprise: {
    requestsPerDay: 5000,
    requestsPerHour: 1000,
    maxConcurrent: 20
  }
}
```

### API Rate Limits

Adjust based on your Anthropic plan (5x or 20x):

```javascript
// For 20x plan (in config.js)
rateLimits: {
  requestsPerMinute: 100,
  tokensPerMinute: 800000,
  requestsPerDay: 100000,
  tokensPerDay: 50000000
}
```

## API Endpoints

### Generate Diagram

**POST** `/api/diagram/generate`

```bash
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "prompt": "Create a flowchart showing user authentication",
    "diagramType": "mermaid",
    "options": {
      "maxTokens": 4096,
      "temperature": 1.0
    }
  }'
```

Response:
```json
{
  "success": true,
  "requestId": "req_1234567890_abc123",
  "status": "queued",
  "position": 3,
  "estimatedWait": 15000,
  "statusUrl": "/api/diagram/status/req_1234567890_abc123"
}
```

### Check Status

**GET** `/api/diagram/status/:requestId`

```bash
curl http://localhost:3000/api/diagram/status/req_1234567890_abc123 \
  -H "X-API-Key: your-api-key"
```

Response (completed):
```json
{
  "requestId": "req_1234567890_abc123",
  "status": "completed",
  "result": "```mermaid\nflowchart TD\n...",
  "completedAt": "2025-01-24T10:30:00Z",
  "tokensUsed": 1523
}
```

### Cancel Request

**DELETE** `/api/diagram/cancel/:requestId`

```bash
curl -X DELETE http://localhost:3000/api/diagram/cancel/req_1234567890_abc123 \
  -H "X-API-Key: your-api-key"
```

### Get Usage

**GET** `/api/diagram/usage?timeWindow=day`

```bash
curl http://localhost:3000/api/diagram/usage?timeWindow=day \
  -H "X-API-Key: your-api-key"
```

Response:
```json
{
  "timeWindow": "day",
  "usage": {
    "requests": 45,
    "tokens": 68420,
    "estimatedCost": 0.82
  }
}
```

### Queue Status (Admin)

**GET** `/api/diagram/queue/status`

```bash
curl http://localhost:3000/api/diagram/queue/status \
  -H "Authorization: Bearer admin-jwt-token"
```

## Client Usage

### Using the Client Library

```javascript
const DiagramClient = require('./client-example');

const client = new DiagramClient(
  'http://localhost:3000',
  'your-api-key'
);

// Method 1: Polling
const result = await client.generateDiagram(
  'Create a sequence diagram for OAuth flow',
  { diagramType: 'mermaid' }
);

console.log(result.result);
```

### Using WebSocket (Real-time)

```javascript
// Method 2: WebSocket (recommended for better UX)
const result = await client.generateDiagramWithWebSocket(
  'Create an ER diagram for e-commerce',
  { diagramType: 'mermaid' }
);

// Receives real-time updates:
// - queued
// - processing
// - completed/failed
```

### Frontend Integration

```javascript
// React example
async function generateDiagram(prompt) {
  const response = await fetch('/api/diagram/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify({ prompt, diagramType: 'mermaid' })
  });

  const { requestId, statusUrl } = await response.json();

  // Connect to WebSocket for real-time updates
  const ws = new WebSocket('ws://localhost:3000');
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'subscribe',
      requestId
    }));
  };

  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    
    if (update.type === 'completed') {
      setDiagram(update.result);
      ws.close();
    }
    
    if (update.type === 'status') {
      setQueuePosition(update.position);
    }
  };
}
```

## Error Handling

### Rate Limit Exceeded

```json
{
  "error": "USER_LIMIT_EXCEEDED",
  "message": "User limit exceeded: hourly_limit_exceeded",
  "details": {
    "allowed": false,
    "reason": "hourly_limit_exceeded",
    "limit": 20,
    "current": 20,
    "resetTime": "2025-01-24T11:00:00Z"
  }
}
```

### Queue Full

```json
{
  "error": "QUEUE_FULL",
  "message": "Queue is full (1000 requests)",
  "queueSize": 1000
}
```

### Anthropic API Errors

The system automatically retries on:
- 429 (rate limit)
- 500, 502, 503, 504 (server errors)
- Network timeouts

Max retries: 3 with exponential backoff

## Monitoring

### Usage Statistics

```bash
# Get stats for date range
curl "http://localhost:3000/api/diagram/stats?startDate=2025-01-01&endDate=2025-01-24" \
  -H "Authorization: Bearer admin-jwt-token"
```

Response:
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-24",
  "stats": [
    {
      "date": "2025-01-24",
      "requests": 1250,
      "tokens": 1850000,
      "cost": 42.50,
      "uniqueUsers": 87,
      "successRate": "98.40"
    }
  ]
}
```

### Health Check

```bash
curl http://localhost:3000/health
```

## Deployment

### Production Considerations

1. **Database**: Use MongoDB Atlas or managed MongoDB
2. **Redis**: Enable Redis for distributed queue (multiple server instances)
3. **Load Balancer**: Put behind nginx or AWS ALB
4. **Monitoring**: Add APM (New Relic, Datadog)
5. **Logging**: Implement structured logging (Winston, Pino)
6. **Secrets**: Use AWS Secrets Manager or HashiCorp Vault

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

### Environment Variables

See `.env.example` for all required configuration.

## Scaling to Higher Volumes

If you need more than 20x plan capacity:

1. **Contact Anthropic Sales**: Request custom enterprise limits
2. **Implement Caching**: Cache common diagram patterns
3. **Optimize Prompts**: Reduce token usage per request
4. **Batch Processing**: Group similar requests
5. **Multi-tenant**: Separate high-volume clients to dedicated instances

## Troubleshooting

### Queue Not Processing

```bash
# Check queue status
curl http://localhost:3000/api/diagram/queue/status

# Restart queue processing
# In server console, the queue auto-restarts on server restart
```

### High Token Usage

```bash
# Monitor usage
curl http://localhost:3000/api/diagram/usage?timeWindow=hour

# Implement prompt optimization
# - Use more concise prompts
# - Set lower maxTokens limits
# - Cache common patterns
```

### Database Connection Issues

```bash
# Check MongoDB connection
mongo mongodb://localhost:27017/diagram_api

# Verify indexes are created
db.api_usage.getIndexes()
db.request_queue.getIndexes()
```

## Security

- **API Keys**: Store hashed in database
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize all inputs
- **CORS**: Restrict to known origins
- **JWT Expiration**: Set reasonable token lifetimes
- **SSL/TLS**: Use HTTPS in production

## License

MIT

## Support

For issues or questions:
- GitHub Issues
- Email: support@yourcompany.com