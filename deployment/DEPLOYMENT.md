# CloudStrucc Diagram Generator

AI-powered architecture diagram generator using Claude AI, supporting multiple cloud providers (Azure, AWS, GCP, Kubernetes) with professional diagram output.

## 🌟 Features

- **Multi-Cloud Support**: Generate diagrams for Azure, AWS, GCP, Kubernetes, or Generic architectures
- **AI-Powered**: Uses Claude Sonnet 4.5 to intelligently design architecture diagrams
- **Multiple Quality Levels**: Simple, Standard, or Enterprise complexity
- **Download Options**: Export as PNG, SVG, or Draw.io format
- **User Authentication**: Secure login with MongoDB-backed user management
- **Tier System**: Free, Starter, Pro, and Enterprise tiers with different limits
- **Real-time Generation**: WebSocket-based status updates during generation
- **Persistent Storage**: Save and manage your diagram library
- **Favorites & Tags**: Organize your diagrams efficiently

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐
│   Webapp        │      │      API        │
│  (Port 3001)    │─────▶│   (Port 3000)   │
│  Express + HBS  │      │  Express + JWT  │
└─────────────────┘      └─────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
            ┌───────────┐  ┌───────────┐  ┌──────────┐
            │  MongoDB  │  │  Python   │  │  Claude  │
            │  (Users & │  │ (Diagrams │  │   API    │
            │ Diagrams) │  │  Library) │  │          │
            └───────────┘  └───────────┘  └──────────┘
```

## 📋 Prerequisites

- **Node.js**: v18+ (v20 LTS recommended)
- **Python**: 3.11+ with pip
- **MongoDB**: Local or Atlas instance
- **Graphviz**: For diagram rendering
- **Anthropic API Key**: For Claude AI access

### Installation

#### macOS
```bash
# Node.js
brew install node

# Python 3.11
brew install python@3.11

# MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Graphviz
brew install graphviz

# Start MongoDB
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python 3.11
sudo apt-get install -y python3.11 python3.11-venv python3-pip

# MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Graphviz
sudo apt-get install -y graphviz

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 🚀 Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/cloudstrucc-diagram-generator.git
cd cloudstrucc-diagram-generator
```

### 2. Install Python Dependencies

```bash
pip3 install anthropic diagrams graphviz python-dotenv Pillow --break-system-packages
```

### 3. Configure API

```bash
cd api

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
ANTHROPIC_API_KEY=sk-ant-your-key-here
JWT_SECRET=$(openssl rand -base64 32)
MONGODB_URI=mongodb://localhost:27017/diagram-generator
EOF

# Create diagrams directory
mkdir -p diagrams
```

### 4. Configure Webapp

```bash
cd ../webapp-frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
API_URL=http://localhost:3000
API_JWT_SECRET=$(openssl rand -base64 32)
MONGODB_URI=mongodb://localhost:27017/diagram-generator-web
SESSION_SECRET=$(openssl rand -base64 32)
EOF
```

**Important:** Make sure `API_JWT_SECRET` matches in both API and Webapp `.env` files!

### 5. Start Services

```bash
# Terminal 1 - Start API
cd api
node server.js

# Terminal 2 - Start Webapp
cd webapp-frontend
npm start

# Terminal 3 - Verify MongoDB is running
mongosh
```

### 6. Access Application

- **Webapp**: http://localhost:3001
- **API**: http://localhost:3000
- **API Health**: http://localhost:3000/health

## 🌐 Production Deployment (Azure)

### Prerequisites

- Azure CLI installed: `brew install azure-cli`
- Active Azure subscription
- Custom domain (optional, but recommended)

### Deployment Steps

1. **Prepare Deployment Configuration**

```bash
cd deployment

# Copy template to create your private configuration
cp deploy.sh .deploy.sh

# Edit your configuration (lines 11-29)
nano .deploy.sh
```

**Important Configuration Variables:**

```bash
SUBSCRIPTION_ID="your-azure-subscription-id"
RESOURCE_GROUP="cloudstrucc-rg"
LOCATION="canadacentral"  # or your preferred region

# Must be globally unique
API_APP_NAME="api-cloudstrucc-yourcompany"
WEBAPP_APP_NAME="webapp-cloudstrucc-yourcompany"
MONGODB_NAME="cloudstrucc-mongodb-yourcompany"

# Your secrets
ANTHROPIC_API_KEY="sk-ant-your-actual-key"

# Custom domains (optional)
API_CUSTOM_DOMAIN="api.yourdomain.com"
WEBAPP_CUSTOM_DOMAIN="app.yourdomain.com"
```

**Note:** `.deploy.sh` is in `.gitignore` to protect your secrets. Never commit it!

2. **Register Required Azure Providers** (One-time setup)

```bash
# Login to Azure
az login

# Register Cosmos DB provider
az provider register --namespace Microsoft.DocumentDB

# Wait for registration (2-3 minutes)
az provider show --namespace Microsoft.DocumentDB --query "registrationState"
# Should return "Registered"
```

3. **Deploy to Azure**

```bash
# From repository root
chmod +x deployment/.deploy.sh
bash deployment/.deploy.sh init
```

The script will:
- ✅ Create all Azure resources (App Services, MongoDB, etc.)
- ✅ Configure environment variables
- ✅ Install Python dependencies
- ✅ Deploy application code
- ✅ Set up SSL certificates
- ✅ Configure custom domains (if provided)

**First deployment takes ~15-20 minutes**

4. **Update After Code Changes**

```bash
# Make your code changes
git pull  # or edit files

# Redeploy just the code (much faster)
bash deployment/.deploy.sh update
```

5. **Other Commands**

```bash
# View logs
bash deployment/.deploy.sh logs

# Restart applications
bash deployment/.deploy.sh restart
```

### Custom Domain Setup

After deployment, configure DNS records in your domain registrar:

**API Domain (api.yourdomain.com):**
```
Type: CNAME
Name: api
Value: api-cloudstrucc-yourcompany.azurewebsites.net
TTL: 3600
```

**Webapp Domain (app.yourdomain.com):**
```
Type: CNAME
Name: app
Value: webapp-cloudstrucc-yourcompany.azurewebsites.net
TTL: 3600
```

**Domain Verification:**
```
Type: TXT
Name: asuid.app (or asuid)
Value: [provided by deployment script]
TTL: 3600
```

The deployment script will guide you through this process.

### Cost Estimate

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| App Service Plan (B1) | Basic | ~$13 |
| Cosmos DB for MongoDB | Serverless | ~$25 |
| SSL Certificates | Managed | Free |
| **Total** | | **~$38/month** |

## 📁 Project Structure

```
cloudstrucc-diagram-generator/
├── api/                          # Backend API
│   ├── config/                   # Configuration files
│   ├── middleware/               # Express middleware
│   ├── routes/                   # API routes
│   ├── services/                 # Business logic
│   │   ├── queueManager.js      # Diagram queue management
│   │   └── usageTracker.js      # Usage tracking
│   ├── scripts/                  # Python scripts
│   │   └── generate_diagram.py  # Diagram generator
│   ├── diagrams/                 # Generated diagrams (not in git)
│   ├── server.js                 # Main server file
│   └── .env                      # Environment variables (not in git)
│
├── webapp-frontend/              # Frontend Application
│   ├── config/                   # App configuration
│   ├── middleware/               # Express middleware
│   ├── models/                   # MongoDB models
│   ├── public/                   # Static assets
│   │   ├── css/                 # Stylesheets
│   │   ├── js/                  # Client-side JavaScript
│   │   └── images/              # Images
│   ├── routes/                   # Express routes
│   ├── services/                 # API client services
│   ├── views/                    # Handlebars templates
│   │   ├── layouts/             # Page layouts
│   │   └── partials/            # Reusable components
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   └── .env                      # Environment variables (not in git)
│
├── deployment/                   # Deployment scripts
│   ├── deploy.sh                # Template deployment script
│   ├── .deploy.sh               # Your config (not in git) ⚠️
│   └── DEPLOYMENT.md            # Detailed deployment guide
│
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## 🔐 Security Best Practices

### Environment Variables

**Never commit these files:**
- `api/.env`
- `webapp-frontend/.env`
- `deployment/.deploy.sh`  ⚠️ **Important!**

These are already in `.gitignore`.

### Production Secrets

```bash
# Generate secure secrets
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for SESSION_SECRET
```

### MongoDB Security

For production, ensure:
- ✅ Enable authentication
- ✅ Use strong passwords
- ✅ Restrict network access
- ✅ Enable encryption at rest

## 🧪 Testing

### Test API Locally

```bash
# Health check
curl http://localhost:3000/health

# Generate diagram (requires authentication)
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Simple web application",
    "style": "generic",
    "quality": "simple"
  }'
```

### Test Python Script

```bash
cd api/scripts

python3.11 generate_diagram.py \
  --prompt "Test diagram" \
  --style generic \
  --type python \
  --quality simple \
  --request-id test-123
```

## 📊 Monitoring

### View Logs Locally

```bash
# API logs
cd api
npm start  # Shows console logs

# Webapp logs
cd webapp-frontend
npm start  # Shows console logs
```

### View Logs in Azure

```bash
# Using deployment script
bash deployment/.deploy.sh logs

# Or manually
az webapp log tail \
  --resource-group cloudstrucc-rg \
  --name api-cloudstrucc-yourcompany
```

## 🐛 Troubleshooting

### Issue: MongoDB Connection Failed

```bash
# Check if MongoDB is running
mongosh

# Restart MongoDB (macOS)
brew services restart mongodb-community

# Restart MongoDB (Linux)
sudo systemctl restart mongod
```

### Issue: Python Script Fails

```bash
# Verify Python packages
pip3 list | grep -E "anthropic|diagrams|graphviz"

# Reinstall if needed
pip3 install anthropic diagrams graphviz python-dotenv Pillow --break-system-packages --force-reinstall

# Check Graphviz
which dot
dot -V
```

### Issue: Port Already in Use

```bash
# Find process using port 3000 or 3001
lsof -ti:3000
lsof -ti:3001

# Kill the process
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:3001)
```

### Issue: Diagram Generation Fails

Check logs for:
- ✅ ANTHROPIC_API_KEY is set correctly
- ✅ Python 3.11 is installed
- ✅ Graphviz is installed
- ✅ All Python packages are installed

```bash
# Test Claude API key
python3.11 -c "import anthropic; print('OK')"

# Test diagram generation
cd api/scripts
python3.11 generate_diagram.py --help
```

### Issue: Deployment Script Error

```bash
# Verify you're running from repository root
pwd  # Should show: .../cloudstrucc-diagram-generator

# Correct usage from root
bash deployment/.deploy.sh init

# NOT from deployment folder:
# cd deployment
# ./deploy.sh  # This won't work correctly
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Claude AI** by Anthropic - Powering intelligent diagram generation
- **Diagrams** Python library - Creating beautiful architecture diagrams
- **Graphviz** - Graph visualization software
- **MongoDB** - Database platform
- **Express.js** - Web framework

## 📧 Support

For support and questions:
- 📧 Email: support@cloudstrucc.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/cloudstrucc-diagram-generator/issues)
- 📖 Docs: [Full Documentation](./deployment/DEPLOYMENT.md)

## 🗺️ Roadmap

- [ ] SVG native generation (not just embedded PNG)
- [ ] Real-time collaborative editing
- [ ] Diagram versioning and history
- [ ] Export to Terraform/CloudFormation
- [ ] Team collaboration features
- [ ] Template marketplace
- [ ] Mobile app (iOS/Android)
- [ ] Dark mode support
- [ ] Diagram annotations and comments
- [ ] Integration with CI/CD pipelines

---

**Built with ❤️ by CloudStrucc Inc.**