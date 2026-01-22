# AI-Powered Architecture Diagram Generator v6.0

Generate professional architecture diagrams from natural language descriptions using Claude AI and Python Diagrams.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Python](https://img.shields.io/badge/python-%3E%3D3.8-blue.svg)
![Version](https://img.shields.io/badge/version-6.0.0-blue.svg)

## What's New in v6.0

- 🏢 **Enterprise Architecture** - TOGAF and Zachman framework support
- 📐 **UML/UML2 Diagrams** - Class, Sequence, Component, State, Activity, Use Case
- 🔷 **ArchiMate 3.x** - Full layered architecture with Business, Application, Technology, Motivation
- 🎯 **C4 Model** - Context, Container, and Component diagrams
- ☁️ **Additional Cloud Providers** - Alibaba Cloud, IBM Cloud, OCI, DigitalOcean, OpenStack, Outscale
- 📊 **Elastic Stack & Firebase** - Specialized diagram support

## Features

- 🤖 **AI-Powered** - Describe your architecture in plain English, Claude generates professional diagrams
- 🎨 **20+ Diagram Styles** - Azure, AWS, GCP, K8s, Generic, UML, ArchiMate, Enterprise, C4, and more
- 📊 **Quality Presets** - Simple, Standard, or Enterprise-grade detail levels
- 📋 **50+ Pre-built Templates** - Cloud architectures, EA frameworks, UML diagrams, ArchiMate views
- 🧠 **Smart Enhancement** - Automatically suggests missing components for enterprise diagrams
- 📤 **Multi-Target Publishing** - Push to GitHub, Azure DevOps, or save locally
- 🔄 **Iterative Workflow** - Generate, preview, edit, regenerate, then publish

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Diagram Styles](#diagram-styles)
- [Templates by Category](#templates-by-category)
- [Usage Examples](#usage-examples)
- [Quality Presets](#quality-presets)
- [Publishing](#publishing)
- [Complete Icon & Style Reference](#complete-icon--style-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 18.0.0 or higher
- **Python** 3.8 or higher
- **Graphviz** (for diagram rendering)
- **Anthropic API Key** (for Claude AI)
- **GitHub Token** (optional, for GitHub publishing)
- **Azure DevOps PAT** (optional, for DevOps publishing)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Cloudstrucc/programmatic-diagram-generator.git
cd programmatic-diagram-generator
```

### 2. Install Dependencies

```bash
npm install
pip install diagrams
```

### 3. Install Graphviz

```bash
# macOS
brew install graphviz

# Ubuntu/Debian
sudo apt-get install graphviz

# Windows
choco install graphviz
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY
```

### 5. Verify Installation

```bash
node ai-diagram.js styles
node ai-diagram.js templates
```

---

## Quick Start

### Cloud Architecture Diagrams

```bash
# Azure M365 CMK architecture
node ai-diagram.js generate --template m365-cmk --open

# AWS Serverless
node ai-diagram.js generate --template aws-serverless --open

# Kubernetes microservices
node ai-diagram.js generate --template k8s-microservices --open

# Custom description
node ai-diagram.js generate "Azure web app with SQL database and Redis cache" --style azure --open
```

### Enterprise Architecture Diagrams

```bash
# TOGAF four-layer architecture
node ai-diagram.js generate --template togaf-layers --open

# Zachman framework view
node ai-diagram.js generate --template zachman-framework --open

# Business capability map
node ai-diagram.js generate --template capability-map --open

# Custom EA description
node ai-diagram.js generate "TOGAF architecture for retail company showing business capabilities, applications, data, and technology" --style enterprise --quality enterprise --open
```

### UML Diagrams

```bash
# Class diagram
node ai-diagram.js generate --template uml-class --open

# Sequence diagram
node ai-diagram.js generate --template uml-sequence --open

# Component diagram
node ai-diagram.js generate --template uml-component --open

# State machine
node ai-diagram.js generate --template uml-state --open

# Activity diagram
node ai-diagram.js generate --template uml-activity --open

# Use case diagram
node ai-diagram.js generate --template uml-usecase --open

# Custom UML description
node ai-diagram.js generate "class diagram for hospital management system with Patient, Doctor, Appointment, and Treatment classes" --style uml --open
```

### ArchiMate Diagrams

```bash
# Full layered view
node ai-diagram.js generate --template archimate-layered --open

# Motivation view
node ai-diagram.js generate --template archimate-motivation --open

# Application cooperation
node ai-diagram.js generate --template archimate-application --open

# Technology view
node ai-diagram.js generate --template archimate-technology --open

# Implementation & migration
node ai-diagram.js generate --template archimate-implementation --open

# Custom ArchiMate description
node ai-diagram.js generate "ArchiMate application layer showing CRM, ERP integration with REST APIs and message queues" --style archimate --quality enterprise --open
```

### C4 Model Diagrams

```bash
# System context
node ai-diagram.js generate --template c4-context --open

# Container diagram
node ai-diagram.js generate --template c4-container --open

# Custom C4 description
node ai-diagram.js generate "C4 context diagram for banking application showing customers, mobile app, and external payment systems" --style c4 --open
```

---

## Diagram Styles

### Cloud Providers

| Style | Command | Description |
|-------|---------|-------------|
| `azure` | `--style azure` | Microsoft Azure architectures, M365, Power Platform |
| `aws` | `--style aws` | Amazon Web Services architectures |
| `gcp` | `--style gcp` | Google Cloud Platform architectures |
| `alibabacloud` | `--style alibabacloud` | Alibaba Cloud architectures |
| `ibm` | `--style ibm` | IBM Cloud architectures |
| `oci` | `--style oci` | Oracle Cloud Infrastructure |
| `digitalocean` | `--style digitalocean` | DigitalOcean architectures |
| `openstack` | `--style openstack` | OpenStack private cloud |
| `outscale` | `--style outscale` | Outscale European cloud |

### Container & Orchestration

| Style | Command | Description |
|-------|---------|-------------|
| `k8s` | `--style k8s` | Kubernetes architectures |
| `generic` | `--style generic` | Open-source tools (Docker, Prometheus, etc.) |

### Enterprise Architecture & Modeling

| Style | Command | Description |
|-------|---------|-------------|
| `enterprise` | `--style enterprise` | TOGAF/Zachman enterprise architecture |
| `uml` | `--style uml` | UML class, sequence, component diagrams |
| `archimate` | `--style archimate` | ArchiMate 3.x layered architecture |
| `c4` | `--style c4` | C4 model (Context, Container, Component) |

### Specialized

| Style | Command | Description |
|-------|---------|-------------|
| `elastic` | `--style elastic` | Elastic Stack (ELK) architectures |
| `firebase` | `--style firebase` | Firebase mobile backend |

---

## Templates by Category

### Cloud Architecture Templates

| Template | Style | Command |
|----------|-------|---------|
| M365 Customer Managed Keys | azure | `--template m365-cmk` |
| Power Platform CMK | azure | `--template power-platform-cmk` |
| Azure Landing Zone | azure | `--template azure-landing-zone` |
| Zero Trust Architecture | azure | `--template zero-trust` |
| AWS Serverless | aws | `--template aws-serverless` |
| AWS EKS Platform | aws | `--template aws-eks` |
| GCP Data Platform | gcp | `--template gcp-data-platform` |
| K8s Microservices | k8s | `--template k8s-microservices` |
| OSS Observability | generic | `--template oss-observability` |
| OSS CI/CD | generic | `--template oss-cicd` |
| OSS Secrets (Vault) | generic | `--template oss-secrets` |

### Enterprise Architecture Templates

| Template | Style | Command |
|----------|-------|---------|
| TOGAF Architecture Layers | enterprise | `--template togaf-layers` |
| Zachman Framework View | enterprise | `--template zachman-framework` |
| Business Capability Map | enterprise | `--template capability-map` |

### UML Templates

| Template | Style | Command |
|----------|-------|---------|
| Class Diagram | uml | `--template uml-class` |
| Sequence Diagram | uml | `--template uml-sequence` |
| Component Diagram | uml | `--template uml-component` |
| State Machine Diagram | uml | `--template uml-state` |
| Activity Diagram | uml | `--template uml-activity` |
| Use Case Diagram | uml | `--template uml-usecase` |

### ArchiMate Templates

| Template | Style | Command |
|----------|-------|---------|
| Full Layered View | archimate | `--template archimate-layered` |
| Motivation View | archimate | `--template archimate-motivation` |
| Application Cooperation | archimate | `--template archimate-application` |
| Technology View | archimate | `--template archimate-technology` |
| Implementation & Migration | archimate | `--template archimate-implementation` |

### C4 Model Templates

| Template | Style | Command |
|----------|-------|---------|
| Context Diagram | c4 | `--template c4-context` |
| Container Diagram | c4 | `--template c4-container` |

### Additional Cloud Templates

| Template | Style | Command |
|----------|-------|---------|
| Alibaba E-Commerce | alibabacloud | `--template alibaba-ecommerce` |
| IBM Hybrid Cloud | ibm | `--template ibm-hybrid` |
| OCI Enterprise Landing Zone | oci | `--template oci-enterprise` |
| DigitalOcean App Platform | digitalocean | `--template digitalocean-app` |
| OpenStack Private Cloud | openstack | `--template openstack-private-cloud` |
| Outscale Enterprise | outscale | `--template outscale-enterprise` |

### Elastic & Firebase Templates

| Template | Style | Command |
|----------|-------|---------|
| Elastic Observability | elastic | `--template elastic-observability` |
| Elastic SIEM | elastic | `--template elastic-siem` |
| Firebase Mobile Backend | firebase | `--template firebase-mobile` |

---

## Usage Examples

### Using Templates

```bash
# Basic template usage
node ai-diagram.js generate --template m365-cmk --open

# Template with customization
node ai-diagram.js generate "Add Intune MDM integration" --template zero-trust --open

# Template with quality override
node ai-diagram.js generate --template uml-class --quality enterprise --open
```

### Using Natural Language Descriptions

```bash
# Cloud architecture
node ai-diagram.js generate "Azure microservices with AKS, Key Vault, and Cosmos DB" --style azure --quality enterprise --open

# UML diagram
node ai-diagram.js generate "class diagram for online bookstore with Book, Author, Customer, Order, and Review classes showing inheritance and associations" --style uml --open

# ArchiMate
node ai-diagram.js generate "ArchiMate business layer for insurance company showing claims processing business process and customer service function" --style archimate --open

# Enterprise architecture
node ai-diagram.js generate "TOGAF application architecture showing CRM, ERP, and e-commerce integration patterns" --style enterprise --quality enterprise --open

# C4 Model
node ai-diagram.js generate "C4 container diagram for food delivery app showing mobile app, API gateway, order service, restaurant service, and delivery tracking" --style c4 --open
```

### Workflow Examples

```bash
# 1. Generate initial diagram
node ai-diagram.js generate --template archimate-layered

# 2. Preview and check
node ai-diagram.js preview --open

# 3. View/edit the Python code
node ai-diagram.js preview --code

# 4. Make manual edits to .temp-ai-diagrams/diagram.py

# 5. Regenerate from edited code
node ai-diagram.js regenerate --open

# 6. Publish when satisfied
node ai-diagram.js publish --target local
node ai-diagram.js publish --target github
```

---

## Quality Presets

| Quality | Nodes | Clusters | Use Case |
|---------|-------|----------|----------|
| `simple` | 5-8 | 1-2 | Quick overviews, presentations |
| `standard` | 8-15 | 3-5 | Documentation, design reviews |
| `enterprise` | 15+ | 5+ | Detailed architecture documents, compliance |

```bash
# Simple - quick overview
node ai-diagram.js generate "web app" --quality simple --open

# Standard - balanced (default)
node ai-diagram.js generate "microservices" --quality standard --open

# Enterprise - comprehensive
node ai-diagram.js generate "enterprise platform" --quality enterprise --open
```

---

## Publishing

### Local

```bash
node ai-diagram.js publish --target local
# Saves to ./output/
```

### GitHub

```bash
# Configure in .env:
# GITHUB_TOKEN=ghp_xxx
# GITHUB_OWNER=username
# GITHUB_REPO=diagrams

node ai-diagram.js publish --target github
```

### Azure DevOps

```bash
# Configure in .env:
# AZDO_TOKEN=xxx
# AZDO_ORG=org
# AZDO_PROJECT=project

node ai-diagram.js publish --target devops
```

### All Targets

```bash
node ai-diagram.js publish --target all --clean
```

---

## Complete Icon & Style Reference

See the companion document **ICON_STYLE_REFERENCE.md** for the complete list of:

- All available icons for each cloud provider
- ArchiMate element types and colors
- UML notation patterns
- Enterprise architecture patterns
- C4 model components

---

## Troubleshooting

### Graphviz Not Found

```bash
# Install Graphviz
brew install graphviz  # macOS
sudo apt-get install graphviz  # Ubuntu
choco install graphviz  # Windows

# Verify
dot -V
```

### Icon Import Errors

Common issues and solutions:

| Error | Solution |
|-------|----------|
| `Fluentd` not found | Use `FluentBit` instead |
| `HPA` wrong location | Use `from diagrams.k8s.clusterconfig import HPA` |
| `CronJob` not found | Use `Cronjob` (lowercase j) |

### Python Syntax Errors

The tool automatically sanitizes multi-line strings. If you still see errors:

```bash
# View the generated Python code
node ai-diagram.js preview --code

# Edit manually if needed
nano .temp-ai-diagrams/diagram.py

# Regenerate
node ai-diagram.js regenerate --open
```

---

## Configuration Reference

### Environment Variables (.env)

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-xxx

# Optional - Model selection
CLAUDE_MODEL=claude-sonnet-4-5-20250929

# Optional - GitHub publishing
GITHUB_TOKEN=ghp_xxx
GITHUB_OWNER=username
GITHUB_REPO=diagrams
GITHUB_BRANCH=main
GITHUB_FOLDER=images

# Optional - Azure DevOps publishing
AZDO_TOKEN=xxx
AZDO_ORG=org
AZDO_PROJECT=project
AZDO_REPO=diagrams
AZDO_BRANCH=main
AZDO_FOLDER=images

# Optional - Local output
LOCAL_OUTPUT_DIR=./output
```

---

## Command Reference

| Command | Description |
|---------|-------------|
| `generate [desc]` | Generate diagram from description or template |
| `templates` | List all available templates |
| `styles` | List all available diagram styles |
| `quality` | List quality presets |
| `preview` | Preview current diagram |
| `regenerate` | Regenerate from edited Python code |
| `publish` | Publish to target (local, github, devops, all) |
| `clean` | Remove temp files |

### Generate Options

| Option | Description |
|--------|-------------|
| `-s, --style <style>` | Diagram style (default: azure) |
| `-q, --quality <quality>` | Quality level (default: standard) |
| `-t, --template <template>` | Use predefined template |
| `-o, --open` | Open image after generation |
| `-v, --verbose` | Show detailed output |

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Anthropic Claude](https://www.anthropic.com/) - AI diagram generation
- [Python Diagrams](https://diagrams.mingrammer.com/) - Diagram rendering library
- [Graphviz](https://graphviz.org/) - Graph visualization
- Cloud provider icon sets included in the diagrams library