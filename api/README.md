# AI Diagram Generator API

Production-ready REST API server for AI-powered diagram generation with intelligent queue management, rate limiting, and dual-format support (Draw.io XML + Python PNG diagrams).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-5%2B-green)](https://www.mongodb.com)

## 🚀 Features

### Dual Diagram Formats
- **Draw.io XML** - Editable diagrams for collaboration
- **Python PNG** - High-quality images with official cloud provider icons

### Enterprise-Ready
- ✅ **Intelligent Queue Management** - Priority-based processing with automatic retries
- ✅ **Multi-Tier Rate Limiting** - Free, Basic, Pro, Enterprise subscription tiers
- ✅ **Real-time Updates** - WebSocket support for live status notifications
- ✅ **Usage Tracking** - Token counting and cost estimation
- ✅ **JWT Authentication** - Secure API key management
- ✅ **Database Persistence** - MongoDB for reliability
- ✅ **Docker Support** - Easy deployment with Docker Compose

### Comprehensive Template Library
- **40+ Built-in Templates** - AWS, Azure, GCP, Kubernetes, Enterprise Architecture
- **18+ Icon Styles** - All major cloud providers and frameworks
- **3 Quality Levels** - Simple, Standard, Enterprise detail levels

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [API Endpoints](#-api-endpoints)
- [Diagram Types](#-diagram-types)
- [Subscription Tiers](#-subscription-tiers)
- [Architecture](#-architecture)
- [Configuration](#-configuration)
- [Docker Deployment](#-docker-deployment)
- [Troubleshooting](#-troubleshooting)

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **MongoDB** 5+ ([Download](https://www.mongodb.com/try/download/community) or use Docker)
- **Python** 3.8+ (for Python diagram generation)
- **Graphviz** (for Python diagrams): `brew install graphviz`
- **Anthropic API Key** ([Get one](https://console.anthropic.com))

### Installation

```bash
# 1. Navigate to API directory
cd programmatic-diagram-generator/api

# 2. Run setup script
./scripts/setup.sh

# 3. Configure environment
cp .env.example .env
nano .env  # Add your ANTHROPIC_API_KEY

# 4. Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 5. Install Python dependencies
pip3 install diagrams graphviz anthropic --break-system-packages

# 6. Start server
npm start
```

### Generate JWT Token

```bash
# Generate test token
node scripts/generate-jwt.js > .jwt-token

# Test the API
curl http://localhost:3000/health
```

## 📚 API Endpoints

### Base URL
```
http://localhost:3000/api/diagram
```

### Authentication
All endpoints require JWT token:
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Core Endpoints

#### 1. Generate Diagram
```http
POST /api/diagram/generate
```

**Draw.io Request:**
```json
{
  "prompt": "3-tier web application with load balancer",
  "diagramType": "drawio",
  "templateType": "aws|azure|gcp|kubernetes|network|flowchart|uml"
}
```

**Python Diagram Request:**
```json
{
  "prompt": "Azure AKS cluster with SQL database",
  "diagramType": "python",
  "style": "azure|aws|gcp|k8s|generic|c4|uml",
  "quality": "simple|standard|enterprise",
  "outputFormat": "png"
}
```

**Using Templates:**
```json
{
  "template": "m365-cmk",
  "diagramType": "python",
  "style": "azure",
  "quality": "enterprise"
}
```

**Response:**
```json
{
  "success": true,
  "requestId": "req_abc123",
  "status": "queued",
  "position": 1,
  "estimatedWaitTime": 5000
}
```

#### 2. Check Status
```http
GET /api/diagram/status/:requestId
```

**Response (Completed):**
```json
{
  "requestId": "req_abc123",
  "status": "completed",
  "result": {
    "type": "python",
    "format": "png",
    "imageData": "base64-encoded-data...",
    "fileName": "diagram_abc123.png",
    "tokensUsed": 5000
  }
}
```

#### 3. Get Templates
```http
GET /api/diagram/templates
GET /api/diagram/python/styles
GET /api/diagram/python/templates
```

#### 4. Usage Statistics
```http
GET /api/diagram/usage?timeWindow=day|week|month
```

**Response:**
```json
{
  "period": "day",
  "totalRequests": 42,
  "totalTokens": 180000,
  "estimatedCost": 0.72,
  "byDiagramType": {
    "drawio": 20,
    "python": 22
  }
}
```

#### 5. Cancel Request
```http
DELETE /api/diagram/cancel/:requestId
```

#### 6. Health Check (No Auth)
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-25T20:00:00Z",
  "queue": {
    "length": 3,
    "processing": true
  }
}
```

## 🎨 Diagram Types

### Draw.io Templates (8 types)

| Template | Description | Best For |
|----------|-------------|----------|
| `aws` | Amazon Web Services | AWS architectures |
| `azure` | Microsoft Azure | Azure cloud solutions |
| `gcp` | Google Cloud Platform | GCP infrastructures |
| `kubernetes` | Container orchestration | K8s clusters |
| `network` | Network topology | Network diagrams |
| `infrastructure` | Datacenter layouts | Infrastructure |
| `flowchart` | Process flows | Workflows |
| `uml` | Software design | Class/sequence diagrams |

### Python Diagram Styles (18+ types)

**Cloud Providers:**
- `azure` - Microsoft Azure (50+ services)
- `aws` - Amazon Web Services (60+ services)
- `gcp` - Google Cloud Platform (40+ services)
- `alibabacloud`, `ibm`, `oci`, `digitalocean`, `openstack`, `outscale`

**Container & DevOps:**
- `k8s` - Kubernetes
- `generic` - Generic/Open Source

**Enterprise Architecture:**
- `c4` - C4 Model
- `uml` - UML 2.0 diagrams
- `archimate` - ArchiMate framework
- `enterprise` - TOGAF layers

**Specialized:**
- `elastic` - Elastic Stack
- `firebase` - Firebase services

### Quality Levels

| Level | Nodes | Detail | Use Case |
|-------|-------|--------|----------|
| `simple` | 5-8 | Minimal | Quick concepts, internal docs |
| `standard` | 8-15 | Balanced | Team presentations, documentation |
| `enterprise` | 15+ | Comprehensive | Client presentations, compliance |

## 💳 Subscription Tiers

| Tier | Requests/Day | Tokens/Day | Concurrent | Use Case |
|------|-------------|-----------|------------|----------|
| **Free** | 10 | 100K | 1 | Testing, personal |
| **Basic** | 100 | 1M | 2 | Small teams |
| **Pro** | 500 | 5M | 5 | Medium teams |
| **Enterprise** | 5000 | 50M | 20 | Large organizations |

### Rate Limiting

**User Limits:**
- Per-day request quotas
- Per-hour token limits
- Concurrent request limits

**Global Limits (20x Plan):**
- 100 requests/minute
- 800K tokens/minute

## 🏗️ Architecture

```
┌─────────────┐
│   Clients   │
│ (Web/Mobile)│
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Express Server    │
│  + WebSocket Server │
└──────┬──────────────┘
       │
       ├──────▶ Auth Middleware (JWT)
       │
       ├──────▶ Rate Limiter
       │
       ▼
┌─────────────────────┐
│   Queue Manager     │
│  (Priority-based)   │
└──────┬──────────────┘
       │
       ├──────▶ Usage Tracker
       │
       ▼
┌─────────────────────┐
│  Request Processor  │
│  (Draw.io/Python)   │
└──────┬──────────────┘
       │
       ├──────▶ MongoDB (Persistence)
       ├──────▶ Redis (Caching)
       └──────▶ Anthropic API
```

[View Detailed Architecture](./docs/ARCHITECTURE.md)

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database
MONGODB_URI=mongodb://localhost:27017/diagram-api

# Server
PORT=3000
NODE_ENV=development

# Optional - Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Rate Limits (requests per day)
RATE_LIMIT_FREE=10
RATE_LIMIT_BASIC=100
RATE_LIMIT_PRO=500
RATE_LIMIT_ENTERPRISE=5000
```

### Customizing Tiers

Edit `config.js`:

```javascript
rateLimits: {
  tiers: {
    free: {
      requestsPerDay: 10,
      tokensPerDay: 100000,
      requestsPerHour: 5,
      concurrentRequests: 1
    },
    // ... customize other tiers
  }
}
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# Services started:
# - MongoDB (port 27017)
# - Redis (port 6379)  
# - API Server (port 3000)

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v
```

### Docker Compose Configuration

```yaml
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
      - redis
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
```

## 🧪 Testing

### Run Test Suite

```bash
# Complete test suite
./scripts/test-api.sh
```

### Manual Tests

```bash
# 1. Generate Draw.io diagram
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat .jwt-token)" \
  -d '{
    "prompt": "3-tier web application",
    "diagramType": "drawio",
    "templateType": "aws"
  }'

# 2. Generate Python diagram
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat .jwt-token)" \
  -d '{
    "prompt": "Azure AKS cluster with monitoring",
    "diagramType": "python",
    "style": "azure",
    "quality": "enterprise"
  }'

# 3. Get status (use requestId from above)
curl http://localhost:3000/api/diagram/status/req_abc123 \
  -H "Authorization: Bearer $(cat .jwt-token)"

# 4. Get templates
curl http://localhost:3000/api/diagram/python/templates \
  -H "Authorization: Bearer $(cat .jwt-token)"

# 5. Check usage
curl http://localhost:3000/api/diagram/usage \
  -H "Authorization: Bearer $(cat .jwt-token)"
```

## 📁 Project Structure

```
api/
├── server.js                 # Main application
├── config.js                 # Configuration
├── package.json              # Dependencies
├── .env.example              # Environment template
├── docker-compose.yml        # Docker setup
│
├── services/
│   ├── queueManager.js       # Request queue & processing
│   ├── usageTracker.js       # Usage tracking & limits
│   ├── drawioTemplates.js    # Draw.io template engine
│   └── pythonDiagramGenerator.js  # Python diagram integration
│
├── routes/
│   └── diagram.js            # API endpoints
│
├── middleware/
│   └── auth.js               # Authentication & rate limiting
│
├── scripts/
│   ├── setup.sh              # Setup script
│   ├── generate-jwt.js       # Token generator
│   ├── test-api.sh           # Test suite
│   └── README.md             # Scripts documentation
│
└── docs/
    ├── ARCHITECTURE.md       # System architecture
    └── Python-diagram-integration.md  # Integration guide
```

## 🐛 Troubleshooting

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Restart MongoDB
docker restart mongodb
# OR
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Check connection string in .env
cat .env | grep MONGODB_URI
```

### Python Diagrams Not Working

```bash
# Install dependencies
pip3 install diagrams graphviz anthropic --break-system-packages

# Install Graphviz
brew install graphviz  # macOS
sudo apt-get install graphviz  # Ubuntu

# Verify installation
python3 -c "from diagrams import Diagram; print('✓ OK')"
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart server
npm start
```

### Queue Not Processing

```bash
# Check queue status
curl http://localhost:3000/api/diagram/queue/status \
  -H "Authorization: Bearer $(cat .jwt-token)"

# Restart server
npm run dev
```

### Invalid JWT Token

```bash
# Generate fresh token
node scripts/generate-jwt.js > .jwt-token

# Verify JWT_SECRET matches between .env and server
grep JWT_SECRET .env
```

### Rate Limit Exceeded

```bash
# Check usage
curl http://localhost:3000/api/diagram/usage \
  -H "Authorization: Bearer $(cat .jwt-token)"

# Generate token with higher tier
node scripts/generate-jwt.js my-key pro > .jwt-token
```

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Use HTTPS/TLS for all connections
- [ ] Set `NODE_ENV=production`
- [ ] Use managed MongoDB (MongoDB Atlas)
- [ ] Enable Redis cluster for caching
- [ ] Configure load balancer
- [ ] Set up monitoring (APM)
- [ ] Configure log aggregation
- [ ] Implement health checks
- [ ] Set up auto-scaling
- [ ] Enable CORS for trusted origins only
- [ ] Implement IP-based rate limiting
- [ ] Set up automated backups
- [ ] Configure alerting

### Environment Variables (Production)

```bash
NODE_ENV=production
PORT=3000
ANTHROPIC_API_KEY=sk-ant-production-key
JWT_SECRET=production-secret-minimum-32-chars
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/diagram-api
REDIS_HOST=redis-cluster.example.com
REDIS_PORT=6379
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
```

### Scaling Considerations

**Horizontal Scaling:**
- Deploy multiple API server instances
- Use load balancer (AWS ALB, Nginx)
- Share state via MongoDB and Redis

**Database:**
- MongoDB Atlas with auto-scaling
- Redis Cluster for distributed caching
- Regular backups and monitoring

**Monitoring:**
- Application Performance Monitoring (APM)
- Error tracking (Sentry, Rollbar)
- Log aggregation (ELK, Datadog)
- Custom metrics and alerts

## 📊 Usage Examples

### Complete Workflow

```bash
# 1. Setup
./scripts/setup.sh
nano .env  # Add API key

# 2. Start dependencies
docker-compose up -d mongodb redis

# 3. Generate token
node scripts/generate-jwt.js > .jwt-token

# 4. Start server
npm start

# 5. Test endpoints
./scripts/test-api.sh

# 6. Generate diagram
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

## 🤝 Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000/api/diagram';
const TOKEN = process.env.JWT_TOKEN;

async function generateDiagram() {
  const response = await axios.post(`${API_URL}/generate`, {
    prompt: 'Azure AKS cluster',
    diagramType: 'python',
    style: 'azure',
    quality: 'enterprise'
  }, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });

  const { requestId } = response.data;
  
  // Poll for completion
  let status = 'queued';
  while (status !== 'completed') {
    await new Promise(r => setTimeout(r, 2000));
    const statusRes = await axios.get(`${API_URL}/status/${requestId}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    status = statusRes.data.status;
  }

  return statusRes.data.result;
}
```

### Python

```python
import requests
import time
import os

API_URL = 'http://localhost:3000/api/diagram'
TOKEN = os.getenv('JWT_TOKEN')
headers = {'Authorization': f'Bearer {TOKEN}'}

# Generate diagram
response = requests.post(f'{API_URL}/generate', json={
    'prompt': 'AWS serverless architecture',
    'diagramType': 'python',
    'style': 'aws',
    'quality': 'standard'
}, headers=headers)

request_id = response.json()['requestId']

# Poll for completion
while True:
    status_res = requests.get(f'{API_URL}/status/{request_id}', headers=headers)
    status = status_res.json()['status']
    
    if status == 'completed':
        result = status_res.json()['result']
        break
    
    time.sleep(2)

# Save image
import base64
with open('diagram.png', 'wb') as f:
    f.write(base64.b64decode(result['imageData']))
```

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/Cloudstrucc/programmatic-diagram-generator/issues)
- **Email**: support@cloudstrucc.com
- **Documentation**: [Full Docs](./docs/)

## 🙏 Acknowledgments

- Built with [Anthropic Claude](https://www.anthropic.com) Sonnet 4.5
- Draw.io templates powered by [diagrams.net](https://www.diagrams.net)
- Python diagrams using [diagrams library](https://diagrams.mingrammer.com)
- Cloud provider icons from official sources

---

**Built with ❤️ by [CloudStrucc](https://cloudstrucc.com)**