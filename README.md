# AI-Powered Architecture Diagram Generator

Generate professional architecture diagrams from natural language descriptions using Claude AI and PlantUML.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## Features

- 🤖 **AI-Powered** - Describe your architecture in plain English, Claude generates the PlantUML
- 🎨 **Multiple Styles** - C4 Model, Azure Icons, AWS Icons, or Plain PlantUML
- 🐳 **Local Rendering** - Docker-based Kroki for fast, offline diagram generation
- 📤 **Multi-Target Publishing** - Push to GitHub, Azure DevOps, or save locally
- 🔄 **Iterative Workflow** - Generate, preview, edit, regenerate, then publish

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Docker Setup](#docker-setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [Diagram Styles](#diagram-styles)
- [Examples](#examples)
- [Publishing](#publishing)
- [Using Images in Markdown](#using-images-in-markdown)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 18.0.0 or higher
- **Docker Desktop** (for local diagram rendering)
- **Anthropic API Key** (for Claude AI)
- **GitHub Token** (optional, for GitHub publishing)
- **Azure DevOps PAT** (optional, for DevOps publishing)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/cloudstrucc/programmatic-diagram-generator.git
cd programmatic-diagram-generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Configuration](#configuration)).

---

## Docker Setup

The diagram generator uses **Kroki** with **PlantUML Server** to render diagrams locally. This provides fast rendering and supports Azure/AWS icons.

### Installing Docker Desktop

1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Install and start Docker Desktop
3. Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

### Starting the Diagram Services

```bash
# Start Kroki and PlantUML services
docker-compose up -d

# Verify services are running
docker-compose ps
```

You should see both `kroki` and `plantuml` services running.

### Checking Service Health

```bash
# Test Kroki is responding
curl http://localhost:8000/health

# Or open in browser
open http://localhost:8000
```

### Stopping Services

```bash
# Stop services (keeps containers)
docker-compose stop

# Stop and remove containers
docker-compose down
```

### Handling Port Conflicts

If port 8000 is already in use:

#### Option 1: Find and Stop Conflicting Container

```bash
# List all running containers
docker ps

# Find container using port 8000
docker ps --filter "publish=8000"

# Stop the conflicting container
docker stop <container_id>

# Or remove it completely
docker rm -f <container_id>
```

#### Option 2: Change the Port

Edit `docker-compose.yml` to use a different port:

```yaml
services:
  kroki:
    ports:
      - "8001:8000"  # Changed from 8000 to 8001
```

Then update your `.env`:

```bash
KROKI_LOCAL_URL=http://localhost:8001
```

#### Option 3: Remove All Unused Docker Resources

```bash
# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Nuclear option: remove everything
docker system prune -a
```

### Docker Compose Configuration

The `docker-compose.yml` file:

```yaml
version: "3"
services:
  kroki:
    image: yuzutech/kroki
    depends_on:
      - plantuml
    environment:
      - KROKI_PLANTUML_HOST=plantuml
      - KROKI_SAFE_MODE=unsafe
    ports:
      - "8000:8000"

  plantuml:
    image: plantuml/plantuml-server:jetty
    environment:
      - PLANTUML_LIMIT_SIZE=8192
      - ALLOW_PLANTUML_INCLUDE=true
    expose:
      - "8080"
```

Key settings:
- `KROKI_SAFE_MODE=unsafe` - Enables remote includes for Azure/AWS icons
- `ALLOW_PLANTUML_INCLUDE=true` - Allows PlantUML to fetch icon libraries from GitHub

---

## Configuration

Create a `.env` file in the project root:

```bash
# =============================================================================
# ANTHROPIC API
# =============================================================================
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Model options (best to fastest):
#   claude-opus-4-20250514      - Most intelligent
#   claude-sonnet-4-5-20250929  - Good balance (DEFAULT)
#   claude-haiku-3-5-20250929   - Fastest, cheapest
CLAUDE_MODEL=claude-sonnet-4-5-20250929

# =============================================================================
# KROKI / PLANTUML
# =============================================================================
# Local Kroki (for C4/plain styles)
KROKI_LOCAL_URL=http://localhost:8000

# Public Kroki fallback (if local not running)
KROKI_PUBLIC_URL=https://kroki.io

# =============================================================================
# GITHUB (Optional)
# =============================================================================
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=your-username
GITHUB_REPO=your-diagrams-repo
GITHUB_BRANCH=main
GITHUB_FOLDER=images
GITHUB_USER_NAME=Your Name
GITHUB_USER_EMAIL=your.email@example.com

# =============================================================================
# AZURE DEVOPS (Optional)
# =============================================================================
AZDO_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AZDO_ORG=your-org
AZDO_PROJECT=your-project
AZDO_REPO=diagrams
AZDO_BRANCH=main
AZDO_FOLDER=images
AZDO_USER_NAME=Your Name
AZDO_USER_EMAIL=your.email@example.com

# =============================================================================
# OUTPUT
# =============================================================================
LOCAL_OUTPUT_DIR=./output
COMMIT_MESSAGE_PREFIX=docs(diagrams): update architecture diagrams
```

### Getting API Keys

#### Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new key

#### GitHub Personal Access Token
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Generate new token (classic)
3. Select `repo` scope
4. Copy the token

#### Azure DevOps PAT
1. Go to `https://dev.azure.com/{your-org}/_usersSettings/tokens`
2. Create new token
3. Select `Code (Read & Write)` scope
4. Copy the token

---

## Usage

### Basic Commands

```bash
# Generate a diagram
node ai-diagram.js generate "Your architecture description"

# Preview current diagram
node ai-diagram.js preview --open

# Show PlantUML source
node ai-diagram.js preview --puml

# Regenerate after manual edits
node ai-diagram.js regenerate --open

# Publish to target
node ai-diagram.js publish --target local
node ai-diagram.js publish --target github
node ai-diagram.js publish --target devops
node ai-diagram.js publish --target all

# List available styles
node ai-diagram.js styles

# Clean temp files
node ai-diagram.js clean
```

### Command Options

```bash
generate <description>
  -s, --style <style>   Diagram style: c4, azure, aws, plain (default: c4)
  -o, --open            Open image after generation
  -v, --verbose         Show detailed output

preview
  -o, --open            Open the image
  -p, --puml            Show PlantUML source code

regenerate
  -o, --open            Open after regeneration
  -v, --verbose         Show detailed output

publish
  -t, --target <target> Target: local, github, devops, all (default: local)
  -c, --clean           Clean temp files after publishing
  -v, --verbose         Show detailed output
```

---

## Diagram Styles

| Style | Description | Rendering | Best For |
|-------|-------------|-----------|----------|
| `c4` | C4 Model diagrams | Local Kroki (fast) | System architecture, containers |
| `azure` | Azure service icons | PlantUML Server | Azure-specific architectures |
| `aws` | AWS service icons | PlantUML Server | AWS-specific architectures |
| `plain` | Basic PlantUML shapes | Local Kroki (fast) | Simple, universal diagrams |

### Style Selection

```bash
# C4 Model (default) - fast, works offline
node ai-diagram.js generate "microservices architecture" --style c4

# Azure Icons - requires internet for icon fetching
node ai-diagram.js generate "Azure architecture" --style azure

# AWS Icons - requires internet for icon fetching
node ai-diagram.js generate "AWS serverless" --style aws

# Plain PlantUML - fast, works everywhere
node ai-diagram.js generate "simple flowchart" --style plain
```

---

## Examples

### C4 Model Examples

```bash
# Microservices Architecture
node ai-diagram.js generate "Microservices architecture with API Gateway, three backend services (User Service, Order Service, Payment Service), message queue for async communication, and PostgreSQL databases for each service" --style c4 --open

# E-commerce Platform
node ai-diagram.js generate "E-commerce platform with React frontend, Node.js BFF, microservices for catalog, cart, checkout, and inventory, Redis cache, and MongoDB database" --style c4 --open

# CI/CD Pipeline
node ai-diagram.js generate "CI/CD pipeline showing GitHub repository, GitHub Actions for build and test, Docker registry, Kubernetes cluster with staging and production namespaces, and monitoring with Prometheus and Grafana" --style c4 --open

# Data Pipeline
node ai-diagram.js generate "Data pipeline with Kafka for ingestion, Spark for processing, data lake on S3, Snowflake data warehouse, and Tableau for visualization" --style c4 --open

# Authentication System
node ai-diagram.js generate "Authentication system with identity provider, OAuth 2.0 authorization server, API gateway with JWT validation, and protected microservices" --style c4 --open
```

### Azure Architecture Examples

```bash
# Customer Managed Keys (CMK)
node ai-diagram.js generate "Azure CMK architecture with Key Vault storing customer-managed encryption keys, Entra ID for identity, Managed Identity for passwordless auth, App Service web application, and Blob Storage with encryption at rest" --style azure --open

# Hub-Spoke Network
node ai-diagram.js generate "Azure hub-spoke network topology with central hub VNet containing Azure Firewall, VPN Gateway, and Bastion. Three spoke VNets for production, development, and shared services, all peered to hub" --style azure --open

# AKS with DevOps
node ai-diagram.js generate "Azure Kubernetes Service deployment with Azure Container Registry, Azure DevOps pipelines for CI/CD, Key Vault for secrets, Application Insights for monitoring, and Azure SQL Database backend" --style azure --open

# Event-Driven Architecture
node ai-diagram.js generate "Azure event-driven architecture with Event Hub for ingestion, Azure Functions for processing, Cosmos DB for storage, and Service Bus for reliable messaging between services" --style azure --open

# M365 Security Architecture
node ai-diagram.js generate "Microsoft 365 security architecture showing Entra ID with Conditional Access, Microsoft Purview for compliance, Defender for Cloud Apps, Sentinel for SIEM, and Log Analytics for monitoring" --style azure --open

# Power Platform with Dataverse
node ai-diagram.js generate "Power Platform solution with Power Apps canvas app, Power Automate flows, Dataverse database, Power BI dashboards, and integration with SharePoint and Teams" --style azure --open
```

### AWS Architecture Examples

```bash
# Serverless Web Application
node ai-diagram.js generate "AWS serverless web application with CloudFront CDN, S3 for static hosting, API Gateway, Lambda functions, DynamoDB database, and Cognito for authentication" --style aws --open

# Three-Tier Architecture
node ai-diagram.js generate "AWS three-tier architecture with Application Load Balancer, EC2 Auto Scaling group in private subnets, RDS Multi-AZ PostgreSQL, ElastiCache Redis, and NAT Gateway for outbound traffic" --style aws --open

# Data Lake Architecture
node ai-diagram.js generate "AWS data lake with S3 raw/curated/published zones, Glue for ETL, Athena for queries, Lake Formation for governance, and QuickSight for visualization" --style aws --open

# Container Platform
node ai-diagram.js generate "AWS container platform with EKS cluster, ECR for images, Application Load Balancer with Ingress, EFS for persistent storage, and CloudWatch Container Insights" --style aws --open

# Event-Driven Microservices
node ai-diagram.js generate "AWS event-driven microservices with EventBridge for events, SQS queues, Lambda functions, Step Functions for orchestration, and X-Ray for tracing" --style aws --open
```

### Plain PlantUML Examples

```bash
# Simple Flowchart
node ai-diagram.js generate "User registration flowchart: user enters email, system validates, if valid send confirmation email and create account, if invalid show error" --style plain --open

# System Components
node ai-diagram.js generate "System components showing web server, application server, cache layer, primary database, and read replica with connections between them" --style plain --open

# Sequence Diagram Style
node ai-diagram.js generate "Login flow between user, browser, auth service, and database showing the request/response sequence" --style plain --open
```

---

## Publishing

### Local Publishing

Saves diagrams to the `./output` directory (configurable via `LOCAL_OUTPUT_DIR`).

```bash
node ai-diagram.js publish --target local
```

### GitHub Publishing

Pushes diagrams to a GitHub repository.

```bash
# Ensure GITHUB_* variables are set in .env
node ai-diagram.js publish --target github
```

**Output:**
```
✓ Pushed to GitHub
![Azure CMK Architecture](https://raw.githubusercontent.com/your-user/your-repo/main/images/azure_cmk_architecture.png)
```

### Azure DevOps Publishing

Pushes diagrams to an Azure DevOps Git repository.

```bash
# Ensure AZDO_* variables are set in .env
node ai-diagram.js publish --target devops
```

### Publish to All Targets

```bash
node ai-diagram.js publish --target all --clean
```

The `--clean` flag removes temp files after successful publishing.

---

## Using Images in Markdown

After publishing your diagrams, you can reference them in your documentation.

### GitHub Repository Images

For images pushed to GitHub, use the raw URL format:

```markdown
# In your README.md or documentation

## Architecture Overview

![CMK Architecture](https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/images/azure_cmk_architecture.png)

## System Components

The following diagram shows our microservices architecture:

![Microservices](https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/images/microservices_architecture.png)
```

**URL Format:**
```
https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{folder}/{filename}.png
```

**Example:**
```markdown
![My Diagram](https://raw.githubusercontent.com/cloudstrucc/programmatic-diagram-generator/main/images/cmk_architecture.png)
```

### Azure DevOps Repository Images

For images in Azure DevOps, use the raw file URL:

```markdown
![Architecture](https://dev.azure.com/{org}/{project}/_apis/git/repositories/{repo}/items?path=/images/architecture.png&api-version=6.0)
```

**Alternative - Using relative paths** (if markdown is in the same repo):

```markdown
![Architecture](./images/architecture.png)
```

### Wiki Integration

#### GitHub Wiki

```markdown
<!-- Reference from same repo -->
![Diagram](../blob/main/images/diagram.png)

<!-- Or use raw URL -->
![Diagram](https://raw.githubusercontent.com/owner/repo/main/images/diagram.png)
```

#### Azure DevOps Wiki

```markdown
<!-- Relative to wiki root -->
![Diagram](/images/diagram.png)

<!-- From Git repo -->
![Diagram](/.attachments/diagram.png)
```

### Confluence / SharePoint

For Confluence or SharePoint, download the image and upload it directly, or use the raw GitHub URL if external images are allowed.

### Example Documentation Structure

```
your-project/
├── README.md
├── docs/
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── security.md
│   │   └── deployment.md
│   └── images/           # Local copies for offline viewing
│       ├── architecture.png
│       └── security.png
└── images/               # Published to GitHub
    ├── cmk_architecture.png
    ├── m365_security.png
    └── teams_premium.png
```

**docs/architecture/overview.md:**
```markdown
# Architecture Overview

## High-Level Design

Our platform uses a microservices architecture deployed on Azure Kubernetes Service.

![Architecture Overview](https://raw.githubusercontent.com/myorg/myrepo/main/images/architecture_overview.png)

## Security Architecture

Customer-managed keys provide encryption for all data at rest.

![CMK Architecture](https://raw.githubusercontent.com/myorg/myrepo/main/images/cmk_architecture.png)

## Key Components

| Component | Purpose |
|-----------|---------|
| Key Vault | Stores CMK keys with HSM protection |
| Managed Identity | Passwordless authentication |
| App Service | Web application hosting |
```

---

## Troubleshooting

### Common Issues

#### "Kroki API error: 400 Bad Request"

**Cause:** Usually means PlantUML syntax error or missing includes.

**Solution:**
1. Check the PlantUML output in verbose mode: `--verbose`
2. For Azure/AWS styles, ensure Docker services are running with `ALLOW_PLANTUML_INCLUDE=true`
3. Try a simpler description or use `--style c4`

#### "Cannot include <azure/...>" Error

**Cause:** Kroki/PlantUML doesn't have the Azure stdlib or remote includes are disabled.

**Solution:**
1. Ensure `docker-compose.yml` has `KROKI_SAFE_MODE=unsafe`
2. Restart Docker services: `docker-compose down && docker-compose up -d`
3. Or use `--style c4` which doesn't require external includes

#### Port 8000 Already in Use

**Solution:**
```bash
# Find what's using the port
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml and .env
```

#### "ANTHROPIC_API_KEY not set"

**Solution:**
1. Ensure `.env` file exists in project root
2. Check the key is correctly formatted: `ANTHROPIC_API_KEY=sk-ant-...`
3. Restart your terminal after editing `.env`

#### Docker Services Not Starting

**Solution:**
```bash
# Check Docker is running
docker info

# View service logs
docker-compose logs kroki
docker-compose logs plantuml

# Rebuild containers
docker-compose down
docker-compose pull
docker-compose up -d
```

#### Slow Diagram Generation

**Cause:** Network latency for Azure/AWS icons fetched from GitHub.

**Solution:**
1. Use `--style c4` for faster local rendering
2. Ensure local Docker services are running (avoids plantuml.com)
3. Consider caching frequently used diagrams

### Getting Help

1. Run with `--verbose` flag for detailed output
2. Check `docker-compose logs` for service errors
3. Verify your `.env` configuration
4. Test with a simple diagram: `node ai-diagram.js generate "simple box diagram" --style plain`

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## Acknowledgments

- [Anthropic Claude](https://www.anthropic.com/) - AI diagram generation
- [PlantUML](https://plantuml.com/) - Diagram rendering
- [Kroki](https://kroki.io/) - Unified diagram API
- [Azure-PlantUML](https://github.com/plantuml-stdlib/Azure-PlantUML) - Azure icons
- [AWS-PlantUML](https://github.com/awslabs/aws-icons-for-plantuml) - AWS icons
- [C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML) - C4 model support