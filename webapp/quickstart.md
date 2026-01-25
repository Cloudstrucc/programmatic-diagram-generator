# Quick Start Guide

Get your Diagram API Server running in 5 minutes.

## Prerequisites

- Node.js 18+
- MongoDB (or use Docker)
- Anthropic API Key

## Method 1: Local Development (Fastest)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
DATABASE_URL=mongodb://localhost:27017/diagram_api
```

### Step 3: Start MongoDB

Using Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Or use your existing MongoDB instance.

### Step 4: Start Server

```bash
npm run dev
```

You should see:
```
✓ Database connected
✓ Database indexes created
✓ Usage tracker initialized
✓ Queue manager initialized
✓ Server running on port 3000
```

### Step 5: Test It

```bash
curl http://localhost:3000/health
```

## Method 2: Docker Compose (Production-Ready)

### Step 1: Configure Environment

```bash
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY
```

### Step 2: Start All Services

```bash
docker-compose up -d
```

This starts:
- MongoDB
- Redis (for caching)
- API Server

### Step 3: Check Status

```bash
docker-compose ps
docker-compose logs -f api
```

## Testing the API

### 1. Create a Test User & API Key

First, you'll need to create a user and API key in your database. Here's a MongoDB script:

```javascript
// Create in MongoDB
use diagram_api

// Create a test user
db.users.insertOne({
  email: "test@example.com",
  subscriptionTier: "pro",
  status: "active",
  role: "user",
  createdAt: new Date()
})

// Get the user ID
const userId = db.users.findOne({email: "test@example.com"})._id

// Create an API key (this is: "test-api-key-12345" hashed with SHA256)
db.api_keys.insertOne({
  userId: userId,
  keyHash: "8f1a7f4e1f4e8e0c9d0a5b2e3f6d8c7b9e0a1f2d3c4b5a6e7f8d9c0b1a2e3f4d",
  active: true,
  createdAt: new Date(),
  lastUsedAt: new Date(),
  usageCount: 0
})
```

### 2. Generate a Diagram

```bash
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-api-key-12345" \
  -d '{
    "prompt": "Create a flowchart showing the software development lifecycle",
    "diagramType": "mermaid"
  }'
```

Response:
```json
{
  "success": true,
  "requestId": "req_1706097600_abc123",
  "status": "queued",
  "position": 1,
  "estimatedWait": 5000,
  "statusUrl": "/api/diagram/status/req_1706097600_abc123"
}
```

### 3. Check Status

```bash
curl http://localhost:3000/api/diagram/status/req_1706097600_abc123 \
  -H "X-API-Key: test-api-key-12345"
```

### 4. Using the JavaScript Client

```javascript
const DiagramClient = require('./client-example');

const client = new DiagramClient(
  'http://localhost:3000',
  'test-api-key-12345'
);

async function test() {
  // Generate with WebSocket (real-time updates)
  const result = await client.generateDiagramWithWebSocket(
    'Create a sequence diagram for a payment flow'
  );
  
  console.log(result.result);
}

test();
```

## Understanding Subscription Tiers

Configure in `config.js`:

| Tier       | Requests/Day | Requests/Hour | Concurrent | Monthly Cost |
|------------|--------------|---------------|------------|--------------|
| Free       | 10           | 5             | 1          | $0           |
| Basic      | 100          | 20            | 2          | $9           |
| Pro        | 500          | 100           | 5          | $49          |
| Enterprise | 5000         | 1000          | 20         | $299         |

## Handling Rate Limits

When you hit limits, you'll receive:

```json
{
  "error": "USER_LIMIT_EXCEEDED",
  "message": "User limit exceeded: hourly_limit_exceeded",
  "details": {
    "limit": 20,
    "current": 20,
    "resetTime": "2025-01-24T11:00:00Z"
  }
}
```

### Client-Side Handling

```javascript
async function generateWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.generateDiagram(prompt);
    } catch (error) {
      if (error.code === 'USER_LIMIT_EXCEEDED') {
        const resetTime = new Date(error.details.resetTime);
        const waitTime = resetTime - new Date();
        
        if (i < maxRetries - 1) {
          console.log(`Rate limited. Waiting ${waitTime}ms...`);
          await sleep(waitTime);
          continue;
        }
      }
      throw error;
    }
  }
}
```

## Upgrading from 5x to 20x Plan

1. Update `config.js`:

```javascript
// Change from 5x limits:
rateLimits: {
  requestsPerMinute: 25,      // Old
  tokensPerMinute: 200000,    // Old
  
// To 20x limits:
rateLimits: {
  requestsPerMinute: 100,     // New
  tokensPerMinute: 800000,    // New
```

2. Restart the server:
```bash
npm restart
# or with Docker
docker-compose restart api
```

## Monitoring Usage

### Get Your Usage Stats

```bash
curl http://localhost:3000/api/diagram/usage?timeWindow=day \
  -H "X-API-Key: test-api-key-12345"
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

### Admin Dashboard Stats

```bash
curl "http://localhost:3000/api/diagram/stats?startDate=2025-01-20&endDate=2025-01-24" \
  -H "Authorization: Bearer your-admin-jwt"
```

## Production Deployment Checklist

- [ ] Set strong `JWT_SECRET` in `.env`
- [ ] Use MongoDB Atlas or managed MongoDB
- [ ] Enable Redis for distributed queue
- [ ] Set up SSL/TLS certificates
- [ ] Configure proper CORS origins
- [ ] Set up monitoring (APM)
- [ ] Configure log aggregation
- [ ] Set up automated backups
- [ ] Use environment-specific configs
- [ ] Implement API key rotation
- [ ] Set up alerting for rate limits

## Common Issues

### "Database connection failed"

```bash
# Check MongoDB is running
docker ps | grep mongodb

# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### "ANTHROPIC_API_KEY not set"

```bash
# Edit .env file
nano .env

# Add your key
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# Restart server
npm restart
```

### "Queue not processing"

```bash
# Check queue status
curl http://localhost:3000/api/diagram/queue/status

# Check server logs
npm run dev  # or docker-compose logs -f api
```

## Next Steps

1. **Integrate with Your Frontend**: Use the client library or direct API calls
2. **Set Up Authentication**: Implement user registration and login
3. **Add Payment Processing**: Integrate Stripe for subscriptions
4. **Customize Rate Limits**: Adjust based on your business needs
5. **Monitor Performance**: Add APM and logging
6. **Scale Up**: Deploy to cloud (AWS, GCP, Azure)

## Support

- Documentation: See `README.md` and `ARCHITECTURE.md`
- Issues: GitHub Issues
- Email: support@yourcompany.com