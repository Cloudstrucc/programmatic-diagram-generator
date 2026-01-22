# AI-Powered Architecture Diagram Generator

Generate professional architecture diagrams from natural language descriptions using Claude AI and Python Diagrams.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Python](https://img.shields.io/badge/python-%3E%3D3.8-blue.svg)

## Features

- 🤖 **AI-Powered** - Describe your architecture in plain English, Claude generates professional diagrams
- 🎨 **Multiple Styles** - Azure, AWS, GCP, Kubernetes, and Generic/Open-Source icon packs
- 📊 **Quality Presets** - Simple, Standard, or Enterprise-grade detail levels
- 📋 **Pre-built Templates** - M365 CMK, Zero Trust, AWS Serverless, K8s Microservices, and more
- 🧠 **Smart Enhancement** - Automatically suggests missing components for enterprise diagrams
- 📤 **Multi-Target Publishing** - Push to GitHub, Azure DevOps, or save locally
- 🔄 **Iterative Workflow** - Generate, preview, edit, regenerate, then publish

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Diagram Styles](#diagram-styles)
- [Quality Presets](#quality-presets)
- [Templates](#templates)
- [Available Icons](#available-icons)
- [Examples](#examples)
- [Publishing](#publishing)
- [Using Images in Markdown](#using-images-in-markdown)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

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
git clone https://github.com/cloudstrucc/programmatic-diagram-generator.git
cd programmatic-diagram-generator
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Install Python Dependencies

```bash
pip install diagrams
# or
pip3 install diagrams
```

### 4. Install Graphviz

Graphviz is required by the Python `diagrams` library to render diagrams.

**macOS:**
```bash
brew install graphviz
```

**Ubuntu/Debian:**
```bash
sudo apt-get install graphviz
```

**Windows:**
```bash
choco install graphviz
# or download from https://graphviz.org/download/
```

**Verify installation:**
```bash
dot -V
# Should output something like: dot - graphviz version 2.43.0
```

### 5. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Configuration](#configuration)).

### 6. Verify Installation

```bash
# Test the setup
node ai-diagram.js styles

# Generate a simple test diagram
node ai-diagram.js generate "simple web app with database" --quality simple --open
```

---

## Quick Start

```bash
# Generate a diagram from description
node ai-diagram.js generate "Kubernetes with Prometheus and Grafana" --style generic --open

# Use a pre-built template
node ai-diagram.js generate --template m365-cmk --open

# Enterprise-grade from description
node ai-diagram.js generate "Azure CMK architecture" --style azure --quality enterprise --open

# List available templates
node ai-diagram.js templates

# List available styles
node ai-diagram.js styles
```

---

## Configuration

Create a `.env` file in the project root:

```bash
# =============================================================================
# ANTHROPIC API (Required)
# =============================================================================
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Model options (best to fastest):
#   claude-opus-4-20250514      - Most intelligent, best quality
#   claude-sonnet-4-5-20250929  - Good balance (DEFAULT)
#   claude-haiku-3-5-20250929   - Fastest, cheapest
CLAUDE_MODEL=claude-sonnet-4-5-20250929

# =============================================================================
# GITHUB (Optional - for publishing)
# =============================================================================
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=your-username
GITHUB_REPO=your-diagrams-repo
GITHUB_BRANCH=main
GITHUB_FOLDER=images
GITHUB_USER_NAME=Your Name
GITHUB_USER_EMAIL=your.email@example.com

# =============================================================================
# AZURE DEVOPS (Optional - for publishing)
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

### Commands

```bash
# Generate a diagram
node ai-diagram.js generate "Your architecture description"
node ai-diagram.js generate --template <template-name>

# List templates
node ai-diagram.js templates

# List styles (icon packs)
node ai-diagram.js styles

# List quality presets
node ai-diagram.js quality

# Preview current diagram
node ai-diagram.js preview --open
node ai-diagram.js preview --code  # Show Python source

# Regenerate after manual edits to the Python file
node ai-diagram.js regenerate --open

# Publish to target
node ai-diagram.js publish --target local
node ai-diagram.js publish --target github
node ai-diagram.js publish --target devops
node ai-diagram.js publish --target all

# Clean temp files
node ai-diagram.js clean
```

### Command Options

```bash
generate [description]
  -s, --style <style>       Icon pack: azure, aws, gcp, k8s, generic (default: azure)
  -q, --quality <quality>   Detail level: simple, standard, enterprise (default: standard)
  -t, --template <template> Use a predefined template
  -o, --open                Open image after generation
  -v, --verbose             Show detailed output including Python code

preview
  -o, --open                Open the image
  -c, --code                Show Python source code

regenerate
  -o, --open                Open after regeneration
  -v, --verbose             Show detailed output

publish
  -t, --target <target>     Target: local, github, devops, all (default: local)
  -c, --clean               Clean temp files after publishing
  -v, --verbose             Show detailed output
```

---

## Diagram Styles

The generator supports multiple icon packs for different cloud providers and technologies.

| Style | Description | Best For |
|-------|-------------|----------|
| `azure` | Microsoft Azure icons | Azure architectures, M365, Power Platform |
| `aws` | Amazon Web Services icons | AWS cloud architectures |
| `gcp` | Google Cloud Platform icons | GCP architectures |
| `k8s` | Kubernetes icons | Container orchestration, K8s deployments |
| `generic` | Open-source & cloud-agnostic icons | Multi-cloud, OSS tools (Vault, Prometheus, etc.) |

### Style Selection

```bash
# Azure (default)
node ai-diagram.js generate "Azure CMK with Key Vault" --style azure

# AWS
node ai-diagram.js generate "Serverless with Lambda and DynamoDB" --style aws

# GCP
node ai-diagram.js generate "Data platform with BigQuery" --style gcp

# Kubernetes
node ai-diagram.js generate "Microservices with Ingress" --style k8s

# Generic/Open-Source
node ai-diagram.js generate "Vault secrets with Prometheus monitoring" --style generic
```

---

## Quality Presets

Control the level of detail in generated diagrams.

| Quality | Nodes | Clusters | Description |
|---------|-------|----------|-------------|
| `simple` | 5-8 | 1-2 | Basic diagram, minimal detail |
| `standard` | 8-15 | 3-5 | Balanced detail and organization |
| `enterprise` | 15+ | 5+ | Full detail with automation, monitoring, DR |

### Quality Examples

```bash
# Simple - quick overview
node ai-diagram.js generate "web app with database" --quality simple

# Standard - balanced (default)
node ai-diagram.js generate "microservices architecture" --quality standard

# Enterprise - comprehensive with all layers
node ai-diagram.js generate "M365 CMK encryption" --quality enterprise
```

**Enterprise quality automatically includes:**
- Identity & Access Control layers
- Automation (DevOps, CI/CD)
- Monitoring & Observability
- DR/Backup components
- Detailed RBAC flows

---

## Templates

Pre-built templates for common architecture patterns. Use `node ai-diagram.js templates` to see all available templates.

### Azure Templates

| Template | Description |
|----------|-------------|
| `m365-cmk` | M365 Customer Managed Keys with Key Vault, DEP keys, SharePoint, Exchange, Teams |
| `power-platform-cmk` | Power Platform CMK - Dataverse, Power Apps, Power Automate encryption |
| `azure-landing-zone` | Enterprise-scale landing zone with management groups, hub-spoke networking |
| `zero-trust` | Zero Trust architecture with identity, device, network, data protection |

### AWS Templates

| Template | Description |
|----------|-------------|
| `aws-serverless` | Serverless with API Gateway, Lambda, DynamoDB, Cognito |
| `aws-eks` | Production EKS with networking, security, observability |

### GCP Templates

| Template | Description |
|----------|-------------|
| `gcp-data-platform` | Data platform with BigQuery, Dataflow, Pub/Sub |

### Kubernetes Templates

| Template | Description |
|----------|-------------|
| `k8s-microservices` | Microservices with service mesh, RBAC, observability |

### Open Source Templates

| Template | Description |
|----------|-------------|
| `oss-observability` | Prometheus, Grafana, Loki, Tempo stack |
| `oss-cicd` | GitOps CI/CD with GitHub Actions, ArgoCD |
| `oss-secrets` | HashiCorp Vault secrets management |

### Using Templates

```bash
# Use template directly
node ai-diagram.js generate --template m365-cmk --open

# Customize a template with additional requirements
node ai-diagram.js generate "Add Intune MDM" --template zero-trust --open

# List all templates with descriptions
node ai-diagram.js templates
```

---

## Available Icons

The generator uses the [Python diagrams](https://diagrams.mingrammer.com/) library. Below are verified icons available for each style.

### Azure Icons (`--style azure`)

```
Compute:        FunctionApps, AppServices, VM, AKS, ContainerInstances
Database:       SQLDatabases, CosmosDb, BlobStorage, DataLake
DevOps:         Devops, Repos, Pipelines, Artifacts, Boards
Identity:       ManagedIdentities, ActiveDirectory, ConditionalAccess
Integration:    LogicApps, ServiceBus, EventGridDomains, APIManagement
Network:        VirtualNetworks, Firewall, LoadBalancers, ApplicationGateway, 
                DNS, PrivateEndpoint, Subnets
Security:       KeyVaults, SecurityCenter, Sentinel
Storage:        StorageAccounts, BlobStorage, FileStorage, QueueStorage
Analytics:      LogAnalyticsWorkspaces, EventHubs, Databricks, SynapseAnalytics
General:        Subscriptions, Resourcegroups, Managementgroups
```

### AWS Icons (`--style aws`)

```
Compute:        Lambda, EC2, ECS, EKS, Fargate, ElasticBeanstalk, Batch
Database:       RDS, Dynamodb, ElastiCache, Redshift, Aurora, Neptune
Network:        VPC, ELB, ALB, NLB, CloudFront, Route53, APIGateway,
                PrivateSubnet, PublicSubnet, NATGateway
Storage:        S3, EBS, EFS, FSx, Glacier
Security:       IAM, Cognito, KMS, SecretsManager, WAF, Shield, ACM,
                SecurityHub, GuardDuty, Inspector
Integration:    SQS, SNS, Eventbridge, StepFunctions, MQ
Analytics:      Kinesis, Athena, Glue, EMR, Quicksight, LakeFormation
Management:     Cloudwatch, Cloudtrail, Config, SystemsManager
DevTools:       Codepipeline, Codecommit, Codebuild, Codedeploy
```

### GCP Icons (`--style gcp`)

```
Compute:        Functions, Run, GKE, ComputeEngine, AppEngine
Database:       CloudSQL, Spanner, Firestore, Bigtable, Memorystore
Network:        VPC, LoadBalancing, CDN, DNS, Armor, NAT, Router
Storage:        GCS, Filestore, PersistentDisk
Security:       Iam, KMS, SecurityCommandCenter, KeyManagementService
Analytics:      BigQuery, Dataflow, Pubsub, Dataproc, Composer
Operations:     Monitoring, Logging
```

### Kubernetes Icons (`--style k8s`)

```
Compute:        Pod, Deployment, ReplicaSet, StatefulSet, DaemonSet, Job, Cronjob
Network:        Service, Ingress, NetworkPolicy
Storage:        PV, PVC, StorageClass
RBAC:           ServiceAccount, Role, RoleBinding, ClusterRole, ClusterRoleBinding
Control Plane:  APIServer, Scheduler, ControllerManager
Infrastructure: Node, Master
Config:         HPA, LimitRange, Quota, CRD, ConfigMap, Secret, Namespace
```

### Generic/Open-Source Icons (`--style generic`)

```
Containers:     Docker, Containerd
Orchestration:  Nomad
Databases:      PostgreSQL, MySQL, MongoDB, Redis, Cassandra, InfluxDB, Neo4J
Web/Proxy:      Nginx, Apache, Traefik, HAProxy, Envoy, Caddy, Gunicorn, Tomcat
Service Mesh:   Istio, Consul, Kong, Linkerd
Queue:          Kafka, RabbitMQ, ActiveMQ, Celery
Monitoring:     Prometheus, Grafana, Datadog, Splunk, Nagios, Zabbix, 
                Thanos, Cortex, Mimir, Sentry
CI/CD:          Jenkins, GithubActions, GitlabCI, CircleCI, DroneCI, 
                TravisCI, Teamcity
VCS:            Git, Github, Gitlab
Security:       Vault, Trivy, Bitwarden
Caching:        Redis, Memcached
Logging:        FluentBit, Loki, Graylog, RSyslog
Tracing:        Jaeger, Tempo
SaaS:           Teams, Slack, Cloudflare, Auth0, Okta, Pagerduty, Opsgenie
Languages:      Python, Javascript, Go, Rust, Java, Nodejs
Frameworks:     React, Vue, Angular, Django, Flask, Spring
```

> ⚠️ **Note:** Some icons that might seem obvious don't exist in the library. See [Troubleshooting](#icon-import-errors) for common issues.

---

## Examples

### M365 Customer Managed Keys (Enterprise)

```bash
node ai-diagram.js generate --template m365-cmk --open
```

Or with custom description:

```bash
node ai-diagram.js generate "M365 CMK architecture showing Key Vault with HSM-protected root keys wrapping DEP keys for SharePoint, Exchange and Teams. Include Entra ID authentication, RBAC permissions, geo-replication to DR vault, DevOps automation for key deployment, and Log Analytics for audit monitoring" --style azure --quality enterprise --open
```

### Kubernetes Microservices with Service Mesh

```bash
node ai-diagram.js generate --template k8s-microservices --open
```

Or custom:

```bash
node ai-diagram.js generate "Kubernetes microservices with Istio service mesh, secrets in HashiCorp Vault, observability with Prometheus and Grafana, and GitOps deployment with ArgoCD" --style generic --quality enterprise --open
```

### AWS Serverless

```bash
node ai-diagram.js generate --template aws-serverless --open
```

### Simple Web Application

```bash
node ai-diagram.js generate "React frontend, Node.js API, PostgreSQL database" --quality simple --open
```

### Azure Hub-Spoke Network

```bash
node ai-diagram.js generate "Azure hub-spoke network with central firewall, VPN gateway, and three spoke VNets for prod, dev, and shared services" --style azure --quality standard --open
```

### Open Source Observability Stack

```bash
node ai-diagram.js generate --template oss-observability --open
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

MARKDOWN REFERENCE:
![M365 CMK Architecture](https://raw.githubusercontent.com/your-user/your-repo/main/images/m365_cmk_architecture.png)
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

After publishing, reference your diagrams in documentation:

### GitHub Repository Images

```markdown
![CMK Architecture](https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/images/m365_cmk_architecture.png)
```

### Azure DevOps Repository Images

```markdown
![Architecture](https://dev.azure.com/{org}/{project}/_apis/git/repositories/{repo}/items?path=/images/architecture.png&api-version=6.0)
```

### Relative Paths (Same Repo)

```markdown
![Architecture](./images/architecture.png)
```

---

## Troubleshooting

### Graphviz Not Found

**Error:**
```
graphviz.backend.execute.ExecutableNotFound: failed to execute PosixPath('dot')
```

**Solution:**
Install Graphviz for your operating system:

```bash
# macOS
brew install graphviz

# Ubuntu/Debian
sudo apt-get install graphviz

# Windows
choco install graphviz

# Verify installation
dot -V
```

### Icon Import Errors

**Error:**
```
ImportError: cannot import name 'Fluentd' from 'diagrams.onprem.logging'
```

**Cause:** Claude generated code using an icon that doesn't exist in the `diagrams` library.

**Common non-existent icons and alternatives:**

| ❌ Doesn't Exist | ✅ Use Instead |
|-----------------|----------------|
| `Fluentd` | `FluentBit` |
| `Tekton` | `GithubActions` or `Jenkins` |
| `Podman` | `Docker` or `Containerd` |
| `Gitea` | `Github` or `Gitlab` |
| `Kubelet` | `Rack` (generic) |
| `CronJob` | `Cronjob` (lowercase j) |
| `HPA` in `k8s.others` | `HPA` in `k8s.clusterconfig` |

**Solution:**
1. Edit the generated Python file in `.temp-ai-diagrams/diagram.py`
2. Replace the invalid import with a valid alternative
3. Run `node ai-diagram.js regenerate --open`

### Python Syntax Errors

**Error:**
```
SyntaxError: EOL while scanning string literal
```

**Cause:** Multi-line strings with literal newlines instead of `\n` escape sequences.

**Solution:** This is automatically fixed in v5. If you see this error, ensure you're using the latest version of the script.

### ANTHROPIC_API_KEY Not Set

**Error:**
```
Error: ANTHROPIC_API_KEY not set in .env file
```

**Solution:**
1. Ensure `.env` file exists in the project root
2. Check the key is correctly formatted: `ANTHROPIC_API_KEY=sk-ant-...`
3. Restart your terminal after editing `.env`

### Diagram Not Opening

**Error:** `--open` flag doesn't work

**Solution:**
```bash
# Manually open the generated image
open .temp-ai-diagrams/diagram.png        # macOS
xdg-open .temp-ai-diagrams/diagram.png    # Linux
start .temp-ai-diagrams/diagram.png       # Windows
```

### Python Not Found

**Error:**
```
Error: Failed to start Python: spawn python3 ENOENT
```

**Solution:**
```bash
# Check Python is installed
python3 --version

# If not installed:
# macOS
brew install python

# Ubuntu/Debian
sudo apt-get install python3

# Ensure diagrams is installed
pip3 install diagrams
```

### Diagram Quality Issues

**Problem:** Generated diagram is too simple or missing components.

**Solution:**
1. Use `--quality enterprise` for comprehensive diagrams
2. Be more specific in your description
3. Use a template as a starting point: `--template m365-cmk`
4. Add specific requirements: "Include monitoring, automation, and DR components"

### GitHub/DevOps Push Fails

**Error:**
```
Error: GitHub configuration missing
```

**Solution:**
1. Verify all required environment variables are set in `.env`
2. Check token has correct permissions (`repo` scope for GitHub)
3. Ensure repository exists and is accessible

### Viewing Generated Python Code

To debug or understand what's being generated:

```bash
# Show the Python code without regenerating
node ai-diagram.js preview --code

# Generate with verbose output
node ai-diagram.js generate "your description" --verbose

# View the file directly
cat .temp-ai-diagrams/diagram.py
```

### Manual Diagram Editing

You can manually edit the generated Python code:

```bash
# 1. Generate initial diagram
node ai-diagram.js generate "your architecture" --style azure

# 2. Edit the Python file
code .temp-ai-diagrams/diagram.py

# 3. Regenerate the image
node ai-diagram.js regenerate --open

# 4. Publish when satisfied
node ai-diagram.js publish --target local
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Adding New Templates

Templates are defined in the `TEMPLATES` object in `ai-diagram.js`. Each template includes:

```javascript
'template-name': {
  name: 'Human Readable Name',
  description: 'Brief description',
  style: 'azure',  // azure, aws, gcp, k8s, generic
  quality: 'enterprise',  // simple, standard, enterprise
  prompt: `Detailed prompt describing the architecture...`,
}
```

### Verifying Icons

Before adding new icons to the styles, verify they exist:

```bash
python3 -c "
from diagrams.onprem import logging
print([x for x in dir(logging) if not x.startswith('_')])
"
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Anthropic Claude](https://www.anthropic.com/) - AI diagram generation
- [Python Diagrams](https://diagrams.mingrammer.com/) - Diagram rendering library
- [Graphviz](https://graphviz.org/) - Graph visualization
- Azure, AWS, GCP icon sets included in the diagrams library