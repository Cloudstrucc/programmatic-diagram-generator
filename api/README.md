# AI Diagram Generator API

Production-ready Node.js API server for AI-powered diagram generation with intelligent queue management, rate limiting, and multi-format support (Draw.io XML + Python PNG diagrams).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

## 🚀 Features

- **Dual Diagram Formats**: 
  - Draw.io XML (editable, collaborative diagrams)
  - Python diagrams (PNG images with official cloud icons)
- **Intelligent Queue Management**: Priority-based processing with automatic retries
- **Rate Limiting**: Per-user and global limits with subscription tiers
- **Real-time Updates**: WebSocket support for live status notifications
- **Professional Templates**: 40+ built-in templates (AWS, Azure, GCP, K8s, etc.)
- **17+ Icon Styles**: Azure, AWS, GCP, Kubernetes, C4, UML, ArchiMate, and more
- **Usage Tracking**: Token counting and cost estimation
- **Production Ready**: Database persistence, error handling, monitoring

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **MongoDB** 5+ ([Download](https://www.mongodb.com/try/download/community) or use Docker)
- **Python** 3.8+ (for Python diagrams)
- **Anthropic API Key** ([Get one](https://console.anthropic.com))

### Optional
- **Redis** (for distributed caching)
- **Docker** (for containerized deployment)

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Cloudstrucc/programmatic-diagram-generator.git
cd programmatic-diagram-generator/webapp/diagram-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Python Dependencies

```bash
# Install diagrams library for Python diagram generation
pip install diagrams graphviz --break-system-packages

# Verify installation
python3 -c "from diagrams import Diagram; print('✓ Python diagrams installed')"
```

### 4. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your credentials
nano .env
```

Add your Anthropic API key:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
JWT_SECRET=your-super-secret-jwt-key-change-in-production
MONGODB_URI=mongodb://localhost:27017/diagram-api
```

### 5. Start MongoDB

**Option A: Using Docker (Recommended)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: Using Homebrew (macOS)**
```bash
brew services start mongodb-community
```

**Option C: Existing MongoDB**
```bash
# Update MONGODB_URI in .env with your connection string
```

### 6. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**Expected output:**
```
✓ Database connected
✓ Database indexes created
✓ Usage tracker initialized
✓ Queue manager initialized
✓ Draw.io template engine initialized
✓ Python diagram generator initialized
✓ Server running on port 3000
WebSocket: ws://localhost:3000
```

### 7. Generate a JWT Token

```bash
# Generate a test token
node generate-token-now.js

# Save it for testing
echo "YOUR_TOKEN_HERE" > .jwt-token
```

### 8. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Get templates
curl http://localhost:3000/api/diagram/templates \
  -H "Authorization: Bearer $(cat .jwt-token)"

# Generate a Draw.io diagram
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat .jwt-token)" \
  -d '{
    "prompt": "3-tier web application with load balancer",
    "diagramType": "drawio",
    "templateType": "aws"
  }'
```

## 🧪 Running Tests

### Complete Test Suite

```bash
# Run all tests
./test-api.sh
```

### Individual API Tests

```bash
# Test Draw.io diagram generation
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat .jwt-token)" \
  -d '{
    "prompt": "Azure AKS cluster with SQL database",
    "diagramType": "drawio",
    "templateType": "azure"
  }'

# Test Python diagram generation
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat .jwt-token)" \
  -d '{
    "prompt": "Kubernetes cluster with monitoring",
    "diagramType": "python",
    "style": "k8s",
    "quality": "enterprise"
  }'

# Get Python styles
curl http://localhost:3000/api/diagram/python/styles \
  -H "Authorization: Bearer $(cat .jwt-token)"

# Get Python templates
curl http://localhost:3000/api/diagram/python/templates \
  -H "Authorization: Bearer $(cat .jwt-token)"
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/diagram
```

### Authentication
All endpoints require JWT authentication:
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Endpoints

#### Generate Diagram
```http
POST /api/diagram/generate
```

**Draw.io Request:**
```json
{
  "prompt": "Your architecture description",
  "diagramType": "drawio",
  "templateType": "aws|azure|gcp|kubernetes|network|flowchart|uml"
}
```

**Python Diagram Request:**
```json
{
  "prompt": "Your architecture description",
  "diagramType": "python",
  "style": "azure|aws|gcp|k8s|generic",
  "quality": "simple|standard|enterprise",
  "outputFormat": "png"
}
```

#### Check Status
```http
GET /api/diagram/status/:requestId
```

#### Get Templates
```http
GET /api/diagram/templates
GET /api/diagram/python/styles
GET /api/diagram/python/templates
```

#### Usage Statistics
```http
GET /api/diagram/usage?timeWindow=day|week|month
```

## 🔧 Configuration

### Subscription Tiers

Edit `config.js` to customize tier limits:

```javascript
rateLimits: {
  tiers: {
    free: {
      requestsPerDay: 10,
      tokensPerDay: 100000,
    },
    basic: {
      requestsPerDay: 100,
      tokensPerDay: 1000000,
    },
    pro: {
      requestsPerDay: 500,
      tokensPerDay: 5000000,
    },
    enterprise: {
      requestsPerDay: 5000,
      tokensPerDay: 50000000,
    },
  },
}
```

### Anthropic Rate Limits

For 20x plan (default):
```javascript
queue: {
  maxQueueSize: 100,
  maxRetries: 3,
  requestTimeout: 120000, // 2 minutes
}
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

Services started:
- MongoDB (port 27017)
- Redis (port 6379)
- API Server (port 3000)

## 📊 Available Diagram Types

### Draw.io Templates (8 types)
- **aws** - Amazon Web Services
- **azure** - Microsoft Azure
- **gcp** - Google Cloud Platform
- **kubernetes** - Container orchestration
- **network** - Network topology
- **infrastructure** - Datacenter layouts
- **flowchart** - Process flows
- **uml** - Software design

### Python Diagram Styles (17+ types)
- **Cloud**: azure, aws, gcp, alibabacloud, ibm, oci, digitalocean, openstack
- **Containers**: k8s, generic
- **Enterprise**: c4, uml, archimate, enterprise
- **Specialized**: elastic, firebase

### Quality Levels
- **simple** - 5-8 nodes, minimal detail
- **standard** - 8-15 nodes, balanced detail
- **enterprise** - 15+ nodes, comprehensive coverage

## 📁 Project Structure

```
diagram-api/
├── server.js                 # Main application
├── config.js                 # Configuration
├── package.json              # Dependencies
├── .env                      # Environment variables (gitignored)
├── .env.example              # Environment template
│
├── services/
│   ├── queueManager.js       # Request queue & processing
│   ├── usageTracker.js       # Usage tracking
│   ├── drawioTemplates.js    # Draw.io template engine
│   └── pythonDiagramGenerator.js  # Python diagram integration
│
├── routes/
│   └── diagram.js            # API endpoints
│
├── middleware/
│   └── auth.js               # Authentication & rate limiting
│
└── diagrams/                 # Generated diagrams (created at runtime)
```

## 🔐 Security Best Practices

- ✅ Change `JWT_SECRET` in production
- ✅ Use HTTPS in production
- ✅ Rotate API keys regularly
- ✅ Enable CORS only for trusted origins
- ✅ Use MongoDB Atlas or managed database
- ✅ Enable Redis for distributed caching
- ✅ Set up monitoring and alerting
- ✅ Implement rate limiting per IP
- ✅ Keep dependencies updated

## 🚀 Production Deployment

### Environment Variables
```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=production-secret-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/diagram-api

# Optional
REDIS_HOST=redis.example.com
REDIS_PORT=6379
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

### Scaling Checklist
- [ ] Deploy to cloud (AWS, GCP, Azure)
- [ ] Use managed MongoDB (Atlas)
- [ ] Enable Redis cluster
- [ ] Set up load balancer
- [ ] Configure auto-scaling
- [ ] Add APM monitoring
- [ ] Set up log aggregation
- [ ] Implement health checks
- [ ] Configure SSL/TLS
- [ ] Set up CI/CD pipeline

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Restart MongoDB
brew services restart mongodb-community
# OR
docker restart mongodb
```

### Python Diagrams Not Working
```bash
# Install dependencies
pip install diagrams graphviz --break-system-packages

# Verify installation
python3 -c "from diagrams import Diagram; print('OK')"
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
lsof -ti:3000 | xargs kill -9
npm start
```

## 📖 Additional Resources

- [API Documentation](./docs/API.md)
- [Draw.io Templates Guide](./docs/DRAWIO_TEMPLATES.md)
- [Python Diagram Styles](./docs/PYTHON_STYLES.md)
- [Integration Guide](./docs/INTEGRATION-PATCH.md)
- [Architecture Diagrams](./docs/ARCHITECTURE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/Cloudstrucc/programmatic-diagram-generator/issues)
- **Email**: support@cloudstrucc.com
- **Documentation**: [Full Docs](./docs/)

## 🙏 Acknowledgments

- Built with [Anthropic Claude](https://www.anthropic.com)
- Draw.io templates powered by [diagrams.net](https://www.diagrams.net)
- Python diagrams using [diagrams](https://diagrams.mingrammer.com)