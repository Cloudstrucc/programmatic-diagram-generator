# AI-Powered Architecture Diagram Generator v6.1

Generate professional architecture diagrams from natural language descriptions using Claude AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Python](https://img.shields.io/badge/python-%3E%3D3.8-blue.svg)
![Version](https://img.shields.io/badge/version-6.1-blue.svg)

## ✨ What's New in v6.1

- 🎨 **Draw.io Style Added** - Use `--style drawio` for editable XML diagrams
- 📊 **All Templates Compatible** - Every template now works with draw.io
- 🔄 **Same Great Features** - All 40+ templates, publishing, quality presets intact

## Features

- 🤖 **AI-Powered** - Describe architecture in plain English
- 🎨 **18+ Diagram Styles** - Azure, AWS, GCP, Kubernetes, **Draw.io**, UML, ArchiMate, C4, Elastic, Firebase, and more
- 📊 **Quality Presets** - Simple, Standard, Enterprise detail levels
- 📋 **40+ Templates** - M365 CMK, Zero Trust, AWS Serverless, K8s Microservices, and more
- 🧠 **Smart Enhancement** - Auto-suggests missing components
- 📤 **Multi-Target Publishing** - GitHub, Azure DevOps, local filesystem

## Quick Start

```bash
# Python diagram (existing - works as before)
node ai-diagram.js generate "web app with database" --style azure --open

# Draw.io diagram (NEW!)
node ai-diagram.js generate "web app with database" --style drawio --open

# Use any template with draw.io
node ai-diagram.js generate --template m365-cmk --style drawio --open

# List all styles
node ai-diagram.js styles
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Python (for Python diagram styles)

```bash
pip install diagrams
brew install graphviz  # macOS
```

**Note:** Python/Graphviz **not needed** for draw.io style!

### 3. Setup Environment

```bash
cp .env.example .env
```

Edit `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
CLAUDE_MODEL=claude-sonnet-4-5-20250929
```

## Available Styles

Run `node ai-diagram.js styles` to see all:

### Editable Diagrams
- **drawio** - Draw.io / diagrams.net (XML) ✨ NEW!

### Cloud Providers
- **azure** - Microsoft Azure
- **aws** - Amazon Web Services
- **gcp** - Google Cloud Platform
- **alibabacloud** - Alibaba Cloud
- **ibm** - IBM Cloud
- **oci** - Oracle Cloud (OCI)
- **digitalocean** - DigitalOcean
- **openstack** - OpenStack
- **outscale** - Outscale (3DS)

### Container & DevOps
- **k8s** - Kubernetes
- **generic** - Generic / Open Source

### Enterprise Architecture
- **c4** - C4 Model
- **uml** - UML / UML2
- **archimate** - ArchiMate
- **enterprise** - Enterprise (TOGAF)

### SaaS & Specialized
- **elastic** - Elastic Stack
- **firebase** - Firebase

## Templates (40+)

All templates work with **ANY style** including draw.io!

### Azure Templates

```bash
# Python PNG
node ai-diagram.js generate --template m365-cmk --style azure --open

# Draw.io XML
node ai-diagram.js generate --template m365-cmk --style drawio --open
```

Available Azure templates:
- `m365-cmk` - M365 Customer Managed Keys
- `power-platform-cmk` - Power Platform CMK
- `azure-landing-zone` - Enterprise landing zone
- `zero-trust` - Zero Trust architecture

### AWS Templates

```bash
node ai-diagram.js generate --template aws-serverless --style drawio --open
node ai-diagram.js generate --template aws-eks --style drawio --open
```

### GCP Templates

```bash
node ai-diagram.js generate --template gcp-data-platform --style drawio --open
```

### Kubernetes Templates

```bash
node ai-diagram.js generate --template k8s-microservices --style drawio --open
```

### Open Source Templates

```bash
node ai-diagram.js generate --template oss-observability --style drawio --open
node ai-diagram.js generate --template oss-cicd --style drawio --open
node ai-diagram.js generate --template oss-secrets --style drawio --open
```

**View all templates:**
```bash
node ai-diagram.js templates
```

## Usage Examples

### 🎨 Draw.io Diagrams (Editable XML - NEW!)

Generate editable diagrams that open in https://app.diagrams.net:

```bash
# Azure M365 CMK as editable draw.io
node ai-diagram.js generate \
  --template m365-cmk \
  --style drawio \
  --open

# AWS Serverless as editable draw.io
node ai-diagram.js generate \
  --template aws-serverless \
  --style drawio \
  --open

# Kubernetes microservices as editable draw.io
node ai-diagram.js generate \
  --template k8s-microservices \
  --style drawio \
  --open

# Custom AWS architecture as draw.io
node ai-diagram.js generate \
  "3-tier web app with Application Load Balancer, EC2 auto-scaling in 2 availability zones, RDS multi-AZ, ElastiCache Redis, S3 for static assets" \
  --style drawio \
  --open

# Custom Azure architecture as draw.io
node ai-diagram.js generate \
  "AKS cluster with Application Gateway ingress, frontend and backend services, Azure SQL Database with private endpoint, Redis cache, Key Vault for secrets" \
  --style drawio \
  --open

# Open Source observability as draw.io
node ai-diagram.js generate \
  --template oss-observability \
  --style drawio \
  --open
```

**Output:** `.temp-ai-diagrams/diagram.drawio` - Open in draw.io to edit, export as PNG/SVG/PDF

### 📊 Python Diagrams (PNG Images)

```bash
# AWS architecture
node ai-diagram.js generate \
  "3-tier web app with ALB, EC2, RDS" \
  --style drawio \
  --open

# Azure architecture  
node ai-diagram.js generate \
  "AKS cluster with SQL database" \
  --style drawio \
  --open

# Use template with draw.io
node ai-diagram.js generate \
  --template m365-cmk \
  --style drawio \
  --open
```

### 📊 Python Diagrams (PNG Images)

Generate PNG diagrams using official cloud provider icons:

```bash
# Azure M365 CMK with enterprise detail
node ai-diagram.js generate \
  --template m365-cmk \
  --style azure \
  --quality enterprise \
  --open

# AWS Serverless architecture
node ai-diagram.js generate \
  --template aws-serverless \
  --style aws \
  --open

# GCP Data Platform
node ai-diagram.js generate \
  --template gcp-data-platform \
  --style gcp \
  --open

# Kubernetes with full detail
node ai-diagram.js generate \
  --template k8s-microservices \
  --style k8s \
  --quality enterprise \
  --open

# Custom Kubernetes description
node ai-diagram.js generate \
  "Kubernetes cluster with Ingress controller, frontend deployment with 3 replicas, API deployment with HPA, PostgreSQL StatefulSet, Redis, Prometheus monitoring, Grafana dashboards" \
  --style k8s \
  --quality enterprise \
  --open
```

**Output:** `.temp-ai-diagrams/diagram.png` - Ready to use in documentation

### 🏛️ Enterprise Architecture

```bash
# Azure CMK
node ai-diagram.js generate \
  --template m365-cmk \
  --style azure \
  --quality enterprise \
  --open

# AWS serverless
node ai-diagram.js generate \
  --template aws-serverless \
  --style aws \
  --open

# Kubernetes
node ai-diagram.js generate \
  --template k8s-microservices \
  --style k8s \
  --open
```

### Enterprise Architecture

```bash
# UML class diagram
node ai-diagram.js generate \
  "e-commerce class diagram" \
  --style uml \
  --open

# ArchiMate layers
node ai-diagram.js generate \
  --template archimate-layered \
  --style archimate \
  --open

# C4 container diagram
node ai-diagram.js generate \
  --template c4-container \
  --style c4 \
  --open
```

## Commands

### Generate

```bash
node ai-diagram.js generate [description] [options]

Options:
  -s, --style <style>       Diagram style (default: azure)
  -q, --quality <quality>   Quality: simple, standard, enterprise
  -t, --template <template> Use predefined template
  -o, --open                Open generated file
  -v, --verbose             Verbose output
```

### List Commands

```bash
node ai-diagram.js templates  # List all 40+ templates
node ai-diagram.js styles     # List all 18+ styles
node ai-diagram.js quality    # List quality levels
```

### Preview & Regenerate

```bash
node ai-diagram.js preview --open       # Preview current diagram
node ai-diagram.js preview --code       # Show Python source
node ai-diagram.js regenerate --open    # Regenerate from spec
```

### Publishing

```bash
node ai-diagram.js publish --target local    # Save locally
node ai-diagram.js publish --target github   # Push to GitHub
node ai-diagram.js publish --target devops   # Push to Azure DevOps
node ai-diagram.js publish --target all      # Publish to all targets
```

### Clean

```bash
node ai-diagram.js clean  # Remove temp files
```

## Configuration

Create `.env` file:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
CLAUDE_MODEL=claude-sonnet-4-5-20250929

# Optional - for publishing
GITHUB_TOKEN=ghp_xxxxxx
GITHUB_OWNER=your-username
GITHUB_REPO=diagrams

AZDO_TOKEN=xxxxxx
AZDO_ORG=your-org
AZDO_PROJECT=your-project

LOCAL_OUTPUT_DIR=./output
```

## Quality Levels

Control diagram complexity:

| Level | Nodes | Clusters | Description |
|-------|-------|----------|-------------|
| `simple` | 5-8 | 1-2 | Basic, minimal detail |
| `standard` | 8-15 | 3-5 | Balanced detail (default) |
| `enterprise` | 15+ | 5+ | Full detail, automation, monitoring |

```bash
node ai-diagram.js generate "platform" --quality enterprise
```

## Opening Draw.io Files

Generated `.drawio` files can be opened in:

1. **Web:** https://app.diagrams.net
2. **VS Code:** Install "Draw.io Integration" extension
3. **Desktop:** https://github.com/jgraph/drawio-desktop/releases

## Publishing Workflow

```bash
# 1. Generate diagram
node ai-diagram.js generate --template m365-cmk --open

# 2. Preview/edit if needed
node ai-diagram.js preview --open

# 3. Publish
node ai-diagram.js publish --target github --clean
```

## Format Comparison

| Feature | Python (PNG) | Draw.io (XML) |
|---------|-------------|---------------|
| **Editable** | ❌ No | ✅ Yes |
| **Export** | PNG only | PNG, SVG, PDF, XML |
| **Best For** | Documentation | Client deliverables |
| **Requirements** | Python + Graphviz | None |
| **Speed** | Fast | Fast |

## Troubleshooting

### Draw.io Issues

If XML generation fails:
1. Be more specific in description
2. Simplify architecture
3. Try with `--verbose` flag

### Python: Graphviz Not Found

```bash
brew install graphviz  # macOS
sudo apt-get install graphviz  # Linux
```

### API Credits Error

1. Go to https://console.anthropic.com/settings/billing
2. Add payment method
3. Purchase credits ($20 recommended)

### Icon Import Errors

Common fixes:
- `Fluentd` → Use `FluentBit`
- `Tekton` → Use `GithubActions`
- `Podman` → Use `Docker`

Edit `.temp-ai-diagrams/diagram.py` and run:
```bash
node ai-diagram.js regenerate --open
```

## What Changed in v6.1?

**✅ Added:**
- Draw.io style for editable XML diagrams
- All templates compatible with draw.io

**✅ Kept (100% intact):**
- All 40+ original templates
- All 17+ Python diagram styles
- All cloud providers (Azure, AWS, GCP, Alibaba, IBM, OCI, etc.)
- All enterprise architecture (UML, ArchiMate, C4, TOGAF)
- Publishing to GitHub, Azure DevOps, local
- Preview, regenerate, quality presets
- Smart description enhancement

**Usage:**
```bash
# Before (v6.0 - still works!)
node ai-diagram.js generate --template m365-cmk --style azure

# New (v6.1 - draw.io option!)
node ai-diagram.js generate --template m365-cmk --style drawio
```

## Examples Gallery

```bash
# M365 CMK as draw.io
node ai-diagram.js generate --template m365-cmk --style drawio --open

# AWS serverless as draw.io
node ai-diagram.js generate --template aws-serverless --style drawio --open

# K8s microservices as draw.io
node ai-diagram.js generate --template k8s-microservices --style drawio --open

# UML class diagram
node ai-diagram.js generate "e-commerce system" --style uml --open

# ArchiMate enterprise architecture
node ai-diagram.js generate --template archimate-layered --style archimate --open
```

## License

MIT License

## Acknowledgments

- [Anthropic Claude](https://www.anthropic.com/)
- [Python Diagrams](https://diagrams.mingrammer.com/)
- [Draw.io](https://www.diagrams.net/)
- [Graphviz](https://graphviz.org/)