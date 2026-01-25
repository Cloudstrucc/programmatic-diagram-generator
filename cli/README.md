# AI Diagram Generator CLI

AI-powered diagram generation tool with 40+ templates, 17+ icon styles, and multiple quality levels. Generate professional architecture diagrams using natural language prompts.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Python](https://img.shields.io/badge/python-%3E%3D3.8-blue)](https://www.python.org)

## 🚀 Quick Start

```bash
# Install dependencies
npm install
pip3 install diagrams graphviz anthropic
brew install graphviz

# Set API key
export ANTHROPIC_API_KEY="sk-ant-your-key"

# Generate your first diagram
node ai-diagram.js generate "Azure web app with database"
```

## 📋 Available Commands

```
generate [options] [description]  Generate a diagram
templates                         List available templates
styles                            List available icon styles
quality                           List quality levels
preview [options]                 Preview current diagram
regenerate [options]              Regenerate from specification
publish [options]                 Publish diagram
clean                             Remove temporary files
help [command]                    Display help for command
```

---

## 📚 Command Reference

### 1. `generate` - Generate a Diagram

Generate a new architecture diagram from a text description or template.

#### Basic Usage

```bash
node ai-diagram.js generate "your description here"
```

#### With Options

```bash
node ai-diagram.js generate [options] [description]

Options:
  -s, --style <style>       Icon style (azure|aws|gcp|k8s|generic|c4|uml)
  -q, --quality <level>     Quality level (simple|standard|enterprise)
  -t, --template <name>     Use a built-in template
  -o, --open                Open diagram after generation
  -d, --output-dir <path>   Output directory (default: .temp-ai-diagrams)
  -f, --format <format>     Output format (png|svg|pdf)
  --no-cache                Disable AI response caching
```

#### Examples

**Basic Generation:**
```bash
# Simple description
node ai-diagram.js generate "web server with database"

# Azure architecture
node ai-diagram.js generate "Azure AKS cluster with SQL database"

# AWS infrastructure
node ai-diagram.js generate "AWS Lambda API with DynamoDB and S3"
```

**With Style:**
```bash
# Azure style
node ai-diagram.js generate "web application" --style azure

# AWS style
node ai-diagram.js generate "serverless API" --style aws

# Kubernetes style
node ai-diagram.js generate "microservices deployment" --style k8s

# C4 model
node ai-diagram.js generate "system context" --style c4
```

**With Quality:**
```bash
# Simple (5-8 nodes, basic detail)
node ai-diagram.js generate "web app" --quality simple

# Standard (8-15 nodes, balanced detail) - Default
node ai-diagram.js generate "web app" --quality standard

# Enterprise (15+ nodes, comprehensive)
node ai-diagram.js generate "web app" --quality enterprise
```

**Using Templates:**
```bash
# Microsoft 365 Customer Managed Keys
node ai-diagram.js generate --template m365-cmk --style azure

# AWS Serverless Architecture
node ai-diagram.js generate --template aws-serverless --style aws

# Kubernetes Microservices
node ai-diagram.js generate --template k8s-microservices --style k8s

# C4 Context Diagram
node ai-diagram.js generate --template c4-context --style c4
```

**Auto-Open After Generation:**
```bash
# Open in default viewer
node ai-diagram.js generate "Azure landing zone" --open

# With style and quality
node ai-diagram.js generate "AWS multi-region" --style aws --quality enterprise --open
```

**Custom Output Directory:**
```bash
# Save to specific directory
node ai-diagram.js generate "web app" --output-dir ./diagrams

# Save with descriptive name (copy after generation)
node ai-diagram.js generate "frontend architecture" -d ./frontend
```

**Complete Example:**
```bash
# Full featured generation
node ai-diagram.js generate \
  "Azure landing zone with hub-spoke topology" \
  --style azure \
  --quality enterprise \
  --output-dir ./architecture-docs \
  --open
```

---

### 2. `templates` - List Available Templates

Display all built-in templates organized by category.

#### Usage

```bash
node ai-diagram.js templates
```

#### Examples

```bash
# View all templates
node ai-diagram.js templates

# Filter by category (if supported)
node ai-diagram.js templates --category azure
node ai-diagram.js templates --category aws
node ai-diagram.js templates --category kubernetes
```

#### Output Example

```
📚 Available Templates

Azure Templates:
  • m365-cmk              Microsoft 365 Customer Managed Keys
  • power-platform-cmk    Power Platform CMK
  • azure-landing-zone    Azure Landing Zone Architecture
  • zero-trust            Zero Trust Security Architecture

AWS Templates:
  • aws-serverless        AWS Serverless Architecture
  • aws-eks               AWS EKS Platform

Kubernetes Templates:
  • k8s-microservices     Kubernetes Microservices Architecture
  • k8s-production        Production Kubernetes Setup

Enterprise Architecture:
  • c4-context            C4 Context Diagram
  • c4-container          C4 Container Diagram
  • uml-class             UML Class Diagram
  • archimate-layered     ArchiMate Layered View
  • togaf-layers          TOGAF Architecture Layers

Open Source:
  • oss-observability     Observability Stack
  • oss-cicd              CI/CD Pipeline
  • oss-secrets           Secrets Management
```

---

### 3. `styles` - List Available Icon Styles

Display all available icon styles and their descriptions.

#### Usage

```bash
node ai-diagram.js styles
```

#### Examples

```bash
# View all styles
node ai-diagram.js styles

# View with details
node ai-diagram.js styles --detailed
```

#### Output Example

```
🎨 Available Icon Styles

Cloud Providers:
  • azure           Microsoft Azure (50+ services)
  • aws             Amazon Web Services (60+ services)
  • gcp             Google Cloud Platform (40+ services)
  • alibabacloud    Alibaba Cloud
  • ibm             IBM Cloud
  • oci             Oracle Cloud Infrastructure
  • digitalocean    DigitalOcean
  • openstack       OpenStack

Container Platforms:
  • k8s             Kubernetes (official icons)
  • generic         Generic/Open Source

Enterprise Architecture:
  • c4              C4 Model for software architecture
  • uml             UML 2.0 diagrams
  • archimate       ArchiMate framework
  • enterprise      TOGAF enterprise architecture

Specialized:
  • elastic         Elastic Stack (Elasticsearch, Kibana, Logstash)
  • firebase        Google Firebase
```

---

### 4. `quality` - List Quality Levels

Display available quality levels and their characteristics.

#### Usage

```bash
node ai-diagram.js quality
```

#### Output Example

```
📊 Quality Levels

simple
  • Nodes: 5-8 components
  • Detail: Basic labels
  • Use Case: Quick concepts, internal documentation
  • Generation Time: ~30 seconds

standard (default)
  • Nodes: 8-15 components
  • Detail: Descriptive labels, key relationships
  • Use Case: Team presentations, standard documentation
  • Generation Time: ~45 seconds

enterprise
  • Nodes: 15+ components
  • Detail: Comprehensive coverage, nested clusters
  • Use Case: Client presentations, compliance docs, architecture reviews
  • Generation Time: ~60-90 seconds
```

---

### 5. `preview` - Preview Current Diagram

Preview the most recently generated diagram.

#### Usage

```bash
node ai-diagram.js preview [options]

Options:
  -p, --path <path>    Preview specific diagram file
  --browser            Open in browser instead of default viewer
```

#### Examples

```bash
# Preview most recent diagram
node ai-diagram.js preview

# Preview specific file
node ai-diagram.js preview --path ./diagrams/my-architecture.png

# Open in browser
node ai-diagram.js preview --browser

# Preview with full path
node ai-diagram.js preview -p ~/Documents/architecture.png
```

---

### 6. `regenerate` - Regenerate from Specification

Regenerate a diagram from its saved specification (diagram.py file).

#### Usage

```bash
node ai-diagram.js regenerate [options]

Options:
  -s, --spec <file>        Specification file to use
  -q, --quality <level>    Override quality level
  --no-ai                  Regenerate without AI (use existing spec)
```

#### Examples

```bash
# Regenerate last diagram
node ai-diagram.js regenerate

# Regenerate with higher quality
node ai-diagram.js regenerate --quality enterprise

# Regenerate from specific spec
node ai-diagram.js regenerate --spec ./old-diagrams/diagram.py

# Regenerate without calling AI (faster)
node ai-diagram.js regenerate --no-ai
```

---

### 7. `publish` - Publish Diagram

Publish diagram to various destinations or convert to different formats.

#### Usage

```bash
node ai-diagram.js publish [options]

Options:
  -f, --format <format>     Export format (png|svg|pdf|drawio)
  -o, --output <path>       Output file path
  --git                     Commit to git with auto message
  --confluence <url>        Publish to Confluence page
  --s3 <bucket>             Upload to S3 bucket
  --github                  Create GitHub issue with diagram
  --compress                Compress before publishing
```

#### Examples

```bash
# Export to different format
node ai-diagram.js publish --format svg --output architecture.svg
node ai-diagram.js publish --format pdf --output architecture.pdf

# Export to Draw.io format
node ai-diagram.js publish --format drawio --output architecture.drawio

# Commit to git
node ai-diagram.js publish --git

# Publish to Confluence
node ai-diagram.js publish --confluence https://company.atlassian.net/wiki/spaces/ARCH/pages/123456

# Upload to S3
node ai-diagram.js publish --s3 my-diagrams-bucket/architecture/

# Multiple actions
node ai-diagram.js publish \
  --format pdf \
  --output ./docs/architecture.pdf \
  --git \
  --compress
```

**Git Commit Example:**
```bash
# Automatically commits with descriptive message
node ai-diagram.js publish --git

# Generated commit message example:
# "docs: Add architecture diagram - Azure web app with database"
```

**S3 Upload Example:**
```bash
# Upload to S3 (requires AWS credentials configured)
node ai-diagram.js publish \
  --s3 my-company-diagrams/project-x/ \
  --format png

# Uploads to: s3://my-company-diagrams/project-x/diagram.png
```

---

### 8. `clean` - Remove Temporary Files

Clean up temporary diagram files and cache.

#### Usage

```bash
node ai-diagram.js clean [options]

Options:
  --all          Remove all temp files including cache
  --cache        Remove only cache files
  --force        Force remove without confirmation
```

#### Examples

```bash
# Remove temp diagrams (with confirmation)
node ai-diagram.js clean

# Remove everything including cache
node ai-diagram.js clean --all

# Remove only cache
node ai-diagram.js clean --cache

# Force remove without asking
node ai-diagram.js clean --force
```

---

### 9. `help` - Display Help

Display help for any command.

#### Usage

```bash
node ai-diagram.js help [command]
```

#### Examples

```bash
# General help
node ai-diagram.js help

# Help for specific command
node ai-diagram.js help generate
node ai-diagram.js help publish
node ai-diagram.js help regenerate

# Same as --help flag
node ai-diagram.js generate --help
```

---

## 🎯 Common Workflows

### Workflow 1: Quick Diagram Generation

```bash
# 1. Generate
node ai-diagram.js generate "web app with database" --open

# 2. View output
ls -la .temp-ai-diagrams/
```

### Workflow 2: Enterprise Documentation

```bash
# 1. Generate with high quality
node ai-diagram.js generate \
  "Azure landing zone with hub-spoke network" \
  --style azure \
  --quality enterprise \
  --output-dir ./architecture-docs

# 2. Export to PDF
node ai-diagram.js publish \
  --format pdf \
  --output ./architecture-docs/azure-landing-zone.pdf

# 3. Commit to git
node ai-diagram.js publish --git
```

### Workflow 3: Multiple Diagrams

```bash
#!/bin/bash
# generate-all-diagrams.sh

# Frontend
node ai-diagram.js generate "React frontend with API integration" -s azure -q standard
cp .temp-ai-diagrams/diagram.png ./frontend-architecture.png

# Backend
node ai-diagram.js generate "Node.js API with microservices" -s azure -q standard
cp .temp-ai-diagrams/diagram.png ./backend-architecture.png

# Database
node ai-diagram.js generate "Database architecture with replication" -s azure -q standard
cp .temp-ai-diagrams/diagram.png ./database-architecture.png

# Infrastructure
node ai-diagram.js generate "Kubernetes deployment with monitoring" -s k8s -q enterprise
cp .temp-ai-diagrams/diagram.png ./infrastructure-architecture.png

echo "✓ All diagrams generated!"
```

### Workflow 4: Template-Based Generation

```bash
# 1. List available templates
node ai-diagram.js templates

# 2. Generate from template
node ai-diagram.js generate \
  --template m365-cmk \
  --style azure \
  --quality enterprise

# 3. Preview
node ai-diagram.js preview --open

# 4. Regenerate with modifications (if needed)
node ai-diagram.js regenerate --quality standard

# 5. Publish
node ai-diagram.js publish --format pdf --git
```

### Workflow 5: Iterative Refinement

```bash
# 1. Generate initial diagram
node ai-diagram.js generate "web application architecture" --quality simple

# 2. Preview
node ai-diagram.js preview

# 3. Regenerate with more detail
node ai-diagram.js regenerate --quality standard

# 4. Preview again
node ai-diagram.js preview

# 5. Final version with highest quality
node ai-diagram.js regenerate --quality enterprise

# 6. Publish
node ai-diagram.js publish --format svg --output final-architecture.svg
```

---

## 🎨 Style Examples

### Azure Style
```bash
# Web application
node ai-diagram.js generate "Azure App Service with SQL Database and Redis Cache" -s azure

# Landing zone
node ai-diagram.js generate --template azure-landing-zone -s azure -q enterprise

# AKS cluster
node ai-diagram.js generate "AKS cluster with Azure Container Registry and monitoring" -s azure
```

### AWS Style
```bash
# Serverless
node ai-diagram.js generate "API Gateway, Lambda, and DynamoDB" -s aws

# EKS
node ai-diagram.js generate --template aws-eks -s aws -q enterprise

# Multi-tier
node ai-diagram.js generate "3-tier application with ALB, EC2, and RDS" -s aws
```

### Kubernetes Style
```bash
# Basic cluster
node ai-diagram.js generate "K8s cluster with pods, services, and ingress" -s k8s

# Production setup
node ai-diagram.js generate --template k8s-microservices -s k8s -q enterprise

# With monitoring
node ai-diagram.js generate "K8s with Prometheus and Grafana" -s k8s
```

### C4 Model
```bash
# Context diagram
node ai-diagram.js generate --template c4-context -s c4

# Container diagram
node ai-diagram.js generate --template c4-container -s c4

# Custom C4
node ai-diagram.js generate "System context showing external users and systems" -s c4
```

---

## 📂 Output Structure

```
.temp-ai-diagrams/
├── diagram.png          # Generated diagram image
├── diagram.py           # Python source code (specification)
├── .cache/              # Cached AI responses
└── .metadata.json       # Generation metadata
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the CLI directory:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional
DIAGRAM_OUTPUT_DIR=./.temp-ai-diagrams
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
LOG_LEVEL=info
DEFAULT_STYLE=azure
DEFAULT_QUALITY=standard
AUTO_OPEN=false
ENABLE_CACHE=true
```

### Shell Aliases

Add to `~/.zshrc` or `~/.bashrc`:

```bash
# Quick diagram generation
alias diagram="node ~/path/to/cli/ai-diagram.js generate"
alias diagram-list="node ~/path/to/cli/ai-diagram.js templates"
alias diagram-clean="node ~/path/to/cli/ai-diagram.js clean"

# Usage:
diagram "web app with database"
diagram-list
diagram-clean
```

---

## 🐛 Troubleshooting

### "❌ Error: Image not created"

This is a false error message - **ignore it**. Check if the file actually exists:

```bash
ls -la .temp-ai-diagrams/diagram.png
# If file exists, it worked! ✓
```

### "Cannot find module 'dotenv'"

```bash
npm install dotenv
```

### "Python module 'diagrams' not found"

```bash
pip3 install diagrams graphviz anthropic
```

### "Graphviz not found"

```bash
brew install graphviz
```

### "ANTHROPIC_API_KEY not set"

```bash
export ANTHROPIC_API_KEY="sk-ant-your-key"
# Or create .env file
```

---

## 📊 Examples by Use Case

### Cloud Infrastructure
```bash
node ai-diagram.js generate "Azure landing zone with management groups" -s azure -q enterprise
node ai-diagram.js generate "AWS multi-region deployment with DR" -s aws -q enterprise
node ai-diagram.js generate "GCP data platform with BigQuery pipeline" -s gcp -q standard
```

### Microservices
```bash
node ai-diagram.js generate "Microservices with API gateway and service mesh" -s k8s
node ai-diagram.js generate "Event-driven architecture with message queues" -s generic
node ai-diagram.js generate "CQRS with event sourcing" -s enterprise
```

### Security
```bash
node ai-diagram.js generate --template zero-trust -s azure -q enterprise
node ai-diagram.js generate "Network security with firewalls and WAF" -s aws
node ai-diagram.js generate "Identity and access management flow" -s azure
```

### Data Platforms
```bash
node ai-diagram.js generate "Data lake with ETL pipelines" -s azure
node ai-diagram.js generate "Real-time analytics platform" -s gcp
node ai-diagram.js generate "Data warehouse architecture" -s aws
```

---

## 🚀 Advanced Usage

### Batch Processing

```bash
# Process multiple descriptions from file
while IFS= read -r description; do
  node ai-diagram.js generate "$description" -s azure
  mv .temp-ai-diagrams/diagram.png "./output/$(echo $description | tr ' ' '-').png"
done < descriptions.txt
```

### CI/CD Integration

```yaml
# .github/workflows/diagrams.yml
name: Generate Architecture Diagrams

on: [push]

jobs:
  diagrams:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          cd cli
          npm install
          pip install diagrams graphviz anthropic
          sudo apt-get install graphviz
      
      - name: Generate diagrams
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          cd cli
          node ai-diagram.js generate "System architecture" -s azure
          node ai-diagram.js publish --format png --output ../docs/architecture.png
      
      - name: Commit diagrams
        run: |
          git config user.name "Diagram Bot"
          git config user.email "bot@example.com"
          git add docs/architecture.png
          git commit -m "Update architecture diagrams" || true
          git push
```

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/Cloudstrucc/programmatic-diagram-generator/issues)
- **Email**: support@cloudstrucc.com
- **Documentation**: [Full Docs](../docs/)

---

**Built with ❤️ by [CloudStrucc](https://cloudstrucc.com)**