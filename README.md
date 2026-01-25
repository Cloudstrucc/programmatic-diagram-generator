# AI Diagram Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Python](https://img.shields.io/badge/python-%3E%3D3.8-blue)](https://www.python.org)

AI-powered diagram generation toolkit with both CLI and API interfaces. Generate professional architecture diagrams using natural language prompts with support for 40+ templates and 18+ cloud/enterprise icon styles.

## 🚀 Quick Links

- **[CLI Tool](./cli/README.md)** - Command-line diagram generator
- **[API Server](./api/README.md)** - RESTful API with queue management
- **[Documentation](./docs/)** - Complete documentation
- **[Installation Scripts](./scripts/)** - Setup helpers

## ✨ What's New in v6.1

- 🎨 **Draw.io Support** - Generate editable XML diagrams with `--style drawio`
- 📊 **All Templates Compatible** - Every template works with both PNG and Draw.io formats
- 🔄 **Same Great Features** - All 40+ templates, 18+ styles, and quality presets intact

## 📦 What's Included

### 🖥️ CLI Tool (`cli/`)

Command-line interface for quick diagram generation.

**Features:**
- 40+ built-in templates (M365 CMK, Azure Landing Zones, AWS Serverless, K8s, etc.)
- 18+ icon styles (Azure, AWS, GCP, Kubernetes, Draw.io, C4, UML, ArchiMate, etc.)
- 3 quality levels (Simple, Standard, Enterprise)
- AI-powered generation using Claude Sonnet 4.5
- PNG and editable Draw.io XML output

**Quick Start:**
```bash
cd cli
npm install
pip3 install diagrams graphviz anthropic
brew install graphviz

export ANTHROPIC_API_KEY="your-key"
node ai-diagram.js generate "Azure AKS cluster" --style azure --open
```

[➡️ Full CLI Documentation](./cli/README.md)

### 🌐 API Server (`api/`)

Production-ready Node.js API with advanced features.

**Features:**
- RESTful API with JWT authentication
- Dual format support (Draw.io XML + Python PNG diagrams)
- Intelligent queue management with priority processing
- Rate limiting and subscription tiers (Free, Basic, Pro, Enterprise)
- Real-time WebSocket updates
- Usage tracking and cost estimation
- Docker support for easy deployment

**Quick Start:**
```bash
cd api
npm install
cp .env.example .env  # Add your Anthropic API key
docker run -d -p 27017:27017 --name mongodb mongo:latest
npm start
```

[➡️ Full API Documentation](./api/README.md)

## 🎯 Choose Your Path

### For Developers & DevOps

**Use the CLI** if you want to:
- Generate diagrams quickly from command line
- Integrate into scripts and automation
- Create diagrams for documentation
- Test different styles and templates

### For Teams & Organizations

**Use the API** if you want to:
- Build diagram generation into applications
- Manage team diagram creation centrally
- Track usage and costs
- Implement rate limiting and authentication
- Scale to multiple users

## 🎨 Supported Diagram Types

### Editable Diagrams
- **Draw.io/Diagrams.net** - XML format, fully editable

### Cloud Providers (PNG)
- **Microsoft Azure** - 50+ Azure services
- **Amazon Web Services** - 60+ AWS services
- **Google Cloud Platform** - 40+ GCP services
- **Alibaba Cloud, IBM Cloud, Oracle OCI, DigitalOcean, OpenStack, Outscale**

### Container & DevOps (PNG)
- **Kubernetes** - Official K8s icons
- **Generic/Open Source** - OSS tools and frameworks

### Enterprise Architecture (PNG)
- **C4 Model** - Context, Container, Component, Code diagrams
- **UML 2.0** - Class, sequence, component diagrams
- **ArchiMate** - Enterprise architecture framework
- **TOGAF** - Enterprise architecture layers

### Specialized (PNG)
- **Elastic Stack** - Elasticsearch, Kibana, Logstash
- **Firebase** - Google Firebase services

## 📋 Available Templates (40+)

### Microsoft 365 & Azure
- `m365-cmk` - Microsoft 365 Customer Managed Keys
- `power-platform-cmk` - Power Platform Customer Managed Keys
- `azure-landing-zone` - Enterprise Azure Landing Zone
- `zero-trust` - Zero Trust Security Architecture

### AWS
- `aws-serverless` - Serverless architecture with Lambda
- `aws-eks` - Elastic Kubernetes Service platform

### Google Cloud Platform
- `gcp-data-platform` - Data platform with BigQuery

### Kubernetes
- `k8s-microservices` - Microservices architecture
- `k8s-production` - Production cluster setup

### Open Source
- `oss-observability` - Prometheus, Grafana, Loki stack
- `oss-cicd` - Jenkins, GitLab CI, GitHub Actions
- `oss-secrets` - Vault, Sealed Secrets

### Enterprise Architecture
- `c4-context`, `c4-container` - C4 Model diagrams
- `uml-class`, `uml-sequence` - UML diagrams
- `archimate-layered` - ArchiMate layered view
- `togaf-layers` - TOGAF architecture layers

[➡️ View All Templates](./docs/examples.md)

## 🚀 Quick Examples

### CLI Examples

```bash
# Generate Azure architecture diagram
cd cli
node ai-diagram.js generate \
  "Azure AKS cluster with SQL database" \
  --style azure \
  --quality enterprise \
  --open

# Generate editable Draw.io diagram
node ai-diagram.js generate \
  --template aws-serverless \
  --style drawio \
  --open

# Use built-in template
node ai-diagram.js generate \
  --template m365-cmk \
  --style azure \
  --quality enterprise
```

### API Examples

```bash
# Start the API server
cd api
npm start

# Generate diagram via API
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "3-tier web application",
    "diagramType": "python",
    "style": "azure",
    "quality": "standard"
  }'
```

## 📊 Format Comparison

| Feature | Python (PNG) | Draw.io (XML) |
|---------|-------------|---------------|
| **Editable** | ❌ No | ✅ Yes |
| **Export Options** | PNG only | PNG, SVG, PDF, XML |
| **Icon Quality** | Official cloud icons | Shapes and text |
| **Best For** | Documentation, presentations | Client deliverables, editing |
| **Requirements** | Python + Graphviz | None |
| **File Size** | Small (KB) | Medium (KB) |

## 🏗️ Project Structure

```
programmatic-diagram-generator/
├── README.md                    # This file
├── LICENSE                      # MIT License
├── .gitignore                   # Git ignore rules
│
├── cli/                         # CLI Tool (standalone)
│   ├── README.md                # CLI documentation
│   ├── ai-diagram.js            # Main CLI script
│   ├── package.json             # Dependencies
│   └── .env.example             # Environment template
│
├── api/                         # API Server (standalone)
│   ├── README.md                # API documentation
│   ├── server.js                # Main server
│   ├── config.js                # Configuration
│   ├── package.json             # Dependencies
│   ├── docker-compose.yml       # Docker setup
│   ├── services/                # Business logic
│   ├── routes/                  # API routes
│   ├── middleware/              # Express middleware
│   └── utils/                   # Utilities
│
├── docs/                        # Shared documentation
│   ├── examples.md              # Usage examples
│   ├── icon-reference.md        # Icon library reference
│   ├── Complete-Style-Reference-Guide.md
│   └── ENV-TEMPLATE.md          # Environment setup
│
└── scripts/                     # Installation scripts
    ├── cli-install.sh           # CLI setup script
    └── new-examples-jan.sh      # Example generator
```

## 📚 Documentation

### Getting Started
- [CLI Quick Start](./cli/README.md#quick-start)
- [API Quick Start](./api/README.md#quick-start)
- [Installation Guide](./scripts/README.md)

### References
- [Complete Examples](./docs/examples.md)
- [Style Reference Guide](./docs/Complete-Style-Reference-Guide.md)
- [Icon Reference](./docs/icon-reference.md)
- [Environment Setup](./docs/ENV-TEMPLATE.md)

### Advanced Topics
- [Template Creation](./docs/examples.md#custom-templates)
- [API Integration](./api/README.md#api-integration)
- [Publishing Workflows](./cli/README.md#publishing)

## 🎯 Use Cases

### Cloud Infrastructure
- Design cloud landing zones
- Document microservices architectures
- Create disaster recovery plans
- Visualize network topologies

### Enterprise Architecture
- C4 model diagrams for software systems
- UML class and sequence diagrams
- ArchiMate enterprise views
- TOGAF architecture layers

### DevOps & SRE
- Kubernetes cluster diagrams
- CI/CD pipeline visualization
- Observability stack documentation
- Infrastructure as Code diagrams

### Security & Compliance
- Zero trust architecture designs
- Data flow diagrams
- Customer Managed Keys (CMK) documentation
- Compliance architecture views

## 🔧 Installation

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org))
- Python 3.8+ ([Download](https://python.org)) - for Python diagram styles
- Graphviz ([Download](https://graphviz.org/download/)) - for Python diagram styles
- MongoDB 5+ (optional, only for API)
- Anthropic API Key ([Get one](https://console.anthropic.com))

### Quick Install

**CLI Only:**
```bash
git clone https://github.com/Cloudstrucc/programmatic-diagram-generator.git
cd programmatic-diagram-generator
./scripts/cli-install.sh
```

**API Only:**
```bash
git clone https://github.com/Cloudstrucc/programmatic-diagram-generator.git
cd programmatic-diagram-generator/api
npm install
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY
docker-compose up -d
```

**Both:**
```bash
git clone https://github.com/Cloudstrucc/programmatic-diagram-generator.git
cd programmatic-diagram-generator

# Install CLI
./scripts/cli-install.sh

# Install API
cd api
npm install
cp .env.example .env
docker-compose up -d
```

## ⚙️ Configuration

### CLI Configuration

Create `cli/.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
DIAGRAM_OUTPUT_DIR=./.temp-ai-diagrams
```

### API Configuration

Create `api/.env`:
```bash
# Required
ANTHROPIC_API_KEY=sk-ant-your-key-here
JWT_SECRET=your-super-secret-key

# Database
MONGODB_URI=mongodb://localhost:27017/diagram-api

# Server
PORT=3000
NODE_ENV=development

# Rate Limits
RATE_LIMIT_FREE=10
RATE_LIMIT_BASIC=100
RATE_LIMIT_PRO=500
RATE_LIMIT_ENTERPRISE=5000
```

[➡️ Complete Configuration Guide](./docs/ENV-TEMPLATE.md)

## 🧪 Testing

### Test CLI
```bash
cd cli
node ai-diagram.js generate "test web server" --style azure
ls -la .temp-ai-diagrams/
```

### Test API
```bash
cd api
npm start
# In another terminal:
curl http://localhost:3000/api/health
```

## 🐛 Troubleshooting

### Common Issues

**"Cannot find module 'dotenv'"**
```bash
cd cli  # or cd api
npm install
```

**"Python module 'diagrams' not found"**
```bash
pip3 install diagrams graphviz anthropic
```

**"Graphviz not found"**
```bash
# macOS
brew install graphviz

# Ubuntu/Debian
sudo apt-get install graphviz
```

**"ANTHROPIC_API_KEY not set"**
```bash
export ANTHROPIC_API_KEY="sk-ant-your-key"
# Or add to .env file
```

**"MongoDB connection failed"**
```bash
# Start MongoDB with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

[➡️ Full Troubleshooting Guide](./docs/troubleshooting.md)

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/programmatic-diagram-generator.git
cd programmatic-diagram-generator

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and test
cd cli && npm test
cd ../api && npm test

# Commit and push
git commit -m "Add your feature"
git push origin feature/your-feature-name

# Open a Pull Request
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/Cloudstrucc/programmatic-diagram-generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Cloudstrucc/programmatic-diagram-generator/discussions)
- **Email**: support@cloudstrucc.com
- **Documentation**: [Full Docs](./docs/)

## 🙏 Acknowledgments

- Built with [Anthropic Claude](https://www.anthropic.com) Sonnet 4.5
- Draw.io templates powered by [diagrams.net](https://www.diagrams.net)
- Python diagrams using [diagrams library](https://diagrams.mingrammer.com)
- Cloud provider icons from official sources

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

## 📊 Statistics

- **40+ Templates** covering Azure, AWS, GCP, Kubernetes, and Enterprise Architecture
- **18+ Icon Styles** including all major cloud providers and frameworks
- **3 Quality Levels** for different use cases (5-8, 8-15, 15+ components)
- **2 Output Formats** (PNG and editable Draw.io XML)
- **Production Ready** with Docker support, authentication, and rate limiting

---

**Built with ❤️ by [Cloudstrucc](https://cloudstrucc.com)**