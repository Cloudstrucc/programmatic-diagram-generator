# AI Diagram Generator CLI

Command-line tool for generating professional architecture diagrams using AI. Supports 40+ templates, 17+ cloud/enterprise icon styles, and multiple quality levels.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.8-blue)](https://www.python.org)

## 🚀 Features

- **40+ Built-in Templates**: M365 CMK, Azure Landing Zones, AWS Serverless, K8s Microservices, and more
- **17+ Icon Styles**: Azure, AWS, GCP, Kubernetes, C4, UML, ArchiMate, IBM Cloud, Firebase, Elastic Stack
- **3 Quality Levels**: Simple, Standard, Enterprise
- **AI-Powered**: Uses Claude Sonnet 4.5 for intelligent diagram generation
- **Professional Output**: PNG diagrams with official cloud provider icons
- **CLI + API Ready**: Use standalone or integrate with the Node.js API

## 📋 Prerequisites

- **Python** 3.8+ ([Download](https://www.python.org/downloads/))
- **Node.js** 18+ ([Download](https://nodejs.org))
- **Graphviz** ([Download](https://graphviz.org/download/))
- **Anthropic API Key** ([Get one](https://console.anthropic.com))

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Cloudstrucc/programmatic-diagram-generator.git
cd programmatic-diagram-generator
```

### 2. Install Python Dependencies

```bash
# Install diagrams library and dependencies
pip install diagrams graphviz anthropic --break-system-packages

# Verify installation
python3 -c "from diagrams import Diagram; print('✓ Installation successful')"
```

### 3. Install Graphviz

**macOS:**
```bash
brew install graphviz
```

**Ubuntu/Debian:**
```bash
sudo apt-get install graphviz
```

**Windows:**
Download from [graphviz.org](https://graphviz.org/download/)

### 4. Configure Environment

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY="sk-ant-api03-your-actual-key-here"

# Or add to your shell profile (~/.zshrc or ~/.bashrc)
echo 'export ANTHROPIC_API_KEY="sk-ant-your-key"' >> ~/.zshrc
source ~/.zshrc
```

### 5. Make CLI Executable

```bash
chmod +x ai-diagram-COMPLETE-v6.1.js
```

### 6. Generate Your First Diagram

```bash
# Generate an Azure architecture diagram
node ai-diagram-COMPLETE-v6.1.js generate \
  "Azure AKS cluster with SQL database and Redis cache" \
  --style azure \
  --quality enterprise

# The diagram will be generated and automatically opened
```

## 🎯 Usage

### Basic Syntax

```bash
node ai-diagram-COMPLETE-v6.1.js <command> [options]
```

### Commands

#### 1. Generate Diagram (Custom Prompt)

```bash
node ai-diagram-COMPLETE-v6.1.js generate <prompt> [options]

Options:
  --style <name>       Icon style (azure|aws|gcp|k8s|c4|uml|etc)
  --quality <level>    Detail level (simple|standard|enterprise)
  --open              Auto-open diagram after generation
  --template <name>    Use specific template (overrides prompt)

Examples:
# Azure microservices
node ai-diagram-COMPLETE-v6.1.js generate \
  "AKS cluster with Azure SQL and Application Gateway" \
  --style azure \
  --quality enterprise \
  --open

# AWS serverless
node ai-diagram-COMPLETE-v6.1.js generate \
  "Lambda function triggered by S3, writing to DynamoDB" \
  --style aws \
  --quality standard

# Kubernetes
node ai-diagram-COMPLETE-v6.1.js generate \
  "Production K8s deployment with pods, services, and ingress" \
  --style k8s \
  --quality enterprise
```

#### 2. Use Built-in Template

```bash
node ai-diagram-COMPLETE-v6.1.js generate --template <template-name> [options]

Available Templates:
  # Azure
  - m365-cmk                # Microsoft 365 Customer Managed Keys
  - power-platform-cmk      # Power Platform CMK
  - azure-landing-zone      # Azure Landing Zone
  - zero-trust              # Zero Trust Architecture
  
  # AWS
  - aws-serverless          # AWS Serverless Architecture
  - aws-eks                 # AWS EKS Platform
  
  # GCP
  - gcp-data-platform       # GCP Data Platform
  
  # Kubernetes
  - k8s-microservices       # Kubernetes Microservices
  
  # Open Source
  - oss-observability       # Open Source Observability Stack
  - oss-cicd                # Open Source CI/CD Pipeline
  - oss-secrets             # Open Source Secrets Management
  
  # Enterprise Architecture
  - c4-context              # C4 Context Diagram
  - c4-container            # C4 Container Diagram
  - uml-class               # UML Class Diagram
  - archimate-layered       # ArchiMate Layered View
  - togaf-layers            # TOGAF Architecture Layers

Example:
node ai-diagram-COMPLETE-v6.1.js generate \
  --template m365-cmk \
  --style azure \
  --quality enterprise \
  --open
```

#### 3. List Templates

```bash
node ai-diagram-COMPLETE-v6.1.js list-templates

# View templates by category
node ai-diagram-COMPLETE-v6.1.js list-templates --category azure
node ai-diagram-COMPLETE-v6.1.js list-templates --category aws
node ai-diagram-COMPLETE-v6.1.js list-templates --category kubernetes
```

#### 4. List Styles

```bash
node ai-diagram-COMPLETE-v6.1.js list-styles

Output:
Cloud Providers:
  - azure          Microsoft Azure
  - aws            Amazon Web Services
  - gcp            Google Cloud Platform
  - alibabacloud   Alibaba Cloud
  - ibm            IBM Cloud
  - oci            Oracle Cloud Infrastructure
  
Container Platforms:
  - k8s            Kubernetes
  - generic        Generic/Open Source
  
Enterprise Architecture:
  - c4             C4 Model
  - uml            UML Diagrams
  - archimate      ArchiMate
  - enterprise     Enterprise (TOGAF)
  
Specialized:
  - elastic        Elastic Stack
  - firebase       Firebase
```

## 📊 Icon Styles Reference

### Cloud Providers
- **azure** - Microsoft Azure (50+ services)
- **aws** - Amazon Web Services (60+ services)
- **gcp** - Google Cloud Platform (40+ services)
- **alibabacloud** - Alibaba Cloud
- **ibm** - IBM Cloud
- **oci** - Oracle Cloud Infrastructure
- **digitalocean** - DigitalOcean
- **openstack** - OpenStack
- **outscale** - Outscale (3DS)

### Container & DevOps
- **k8s** - Kubernetes official icons
- **generic** - Generic/open-source tools

### Enterprise Architecture
- **c4** - C4 Model for software architecture
- **uml** - UML 2.0 diagrams
- **archimate** - ArchiMate framework
- **enterprise** - TOGAF enterprise architecture

### Specialized
- **elastic** - Elastic Stack (Elasticsearch, Kibana, Logstash)
- **firebase** - Google Firebase

## 🎨 Quality Levels

### Simple
- **Nodes**: 5-8 components
- **Detail**: Basic labels
- **Use Case**: Quick concepts, internal docs

### Standard (Default)
- **Nodes**: 8-15 components
- **Detail**: Descriptive labels, key relationships
- **Use Case**: Team presentations, standard documentation

### Enterprise
- **Nodes**: 15+ components
- **Detail**: Comprehensive coverage, nested clusters, detailed labels
- **Use Case**: Client presentations, compliance docs, architecture reviews

## 📁 Output

Generated diagrams are saved to:
```
.temp-ai-diagrams/diagram.png
.temp-ai-diagrams/diagram.py   (Python source code)
```

## 🧪 Examples

### Example 1: Azure Landing Zone

```bash
node ai-diagram-COMPLETE-v6.1.js generate \
  --template azure-landing-zone \
  --style azure \
  --quality enterprise \
  --open
```

### Example 2: AWS Serverless API

```bash
node ai-diagram-COMPLETE-v6.1.js generate \
  "API Gateway connected to Lambda functions, writing to DynamoDB with S3 for file storage and CloudFront for distribution" \
  --style aws \
  --quality standard \
  --open
```

### Example 3: Kubernetes Production Setup

```bash
node ai-diagram-COMPLETE-v6.1.js generate \
  "Production Kubernetes cluster with nginx ingress, cert-manager, prometheus monitoring, and horizontal pod autoscaling" \
  --style k8s \
  --quality enterprise \
  --open
```

### Example 4: C4 Context Diagram

```bash
node ai-diagram-COMPLETE-v6.1.js generate \
  --template c4-context \
  --style c4 \
  --quality standard \
  --open
```

### Example 5: Multi-Cloud Architecture

```bash
node ai-diagram-COMPLETE-v6.1.js generate \
  "Hybrid architecture with on-premise services connected to Azure AKS and AWS RDS via VPN" \
  --style azure \
  --quality enterprise
```

## 🔧 Advanced Usage

### Custom Template Development

Create your own template in the templates directory:

```javascript
// templates/my-custom-template.js
module.exports = {
  id: 'my-custom-template',
  name: 'My Custom Architecture',
  description: 'Description of the template',
  style: 'azure',
  quality: 'enterprise',
  prompt: 'Detailed prompt for Claude to generate the diagram...',
};
```

### Environment Variables

```bash
# Required
export ANTHROPIC_API_KEY="sk-ant-your-key"

# Optional
export DIAGRAM_OUTPUT_DIR="./my-diagrams"
export ANTHROPIC_MODEL="claude-sonnet-4-5-20250929"
export LOG_LEVEL="debug"
```

### Integration with API

The CLI can be called from the Node.js API:

```javascript
const { spawn } = require('child_process');

function generateDiagram(prompt, style, quality) {
  return new Promise((resolve, reject) => {
    const process = spawn('node', [
      'ai-diagram-COMPLETE-v6.1.js',
      'generate',
      prompt,
      '--style', style,
      '--quality', quality
    ]);
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve('./. temp-ai-diagrams/diagram.png');
      } else {
        reject(new Error(`Generation failed with code ${code}`));
      }
    });
  });
}
```

## 📊 Template Categories

### Azure Templates (4)
- M365 Customer Managed Keys
- Power Platform CMK
- Azure Landing Zone
- Zero Trust Architecture

### AWS Templates (2)
- Serverless Architecture
- EKS Platform

### GCP Templates (1)
- Data Platform

### Kubernetes Templates (1)
- Microservices Architecture

### Open Source Templates (3)
- Observability Stack
- CI/CD Pipeline
- Secrets Management

### Enterprise Architecture Templates (5)
- C4 Context Diagram
- C4 Container Diagram
- UML Class Diagram
- ArchiMate Layered View
- TOGAF Architecture Layers

## 🐛 Troubleshooting

### "Module not found: diagrams"

```bash
pip install diagrams graphviz --break-system-packages
```

### "Graphviz not found"

```bash
# macOS
brew install graphviz

# Ubuntu
sudo apt-get install graphviz
```

### "ANTHROPIC_API_KEY not set"

```bash
export ANTHROPIC_API_KEY="sk-ant-your-key"

# Or add to ~/.zshrc permanently
echo 'export ANTHROPIC_API_KEY="sk-ant-your-key"' >> ~/.zshrc
source ~/.zshrc
```

### Diagram not generating

```bash
# Run with debug mode
node ai-diagram-COMPLETE-v6.1.js generate "test" --style azure --quality simple

# Check Python installation
python3 -c "from diagrams import Diagram; print('OK')"

# Check Graphviz
dot -V
```

## 📖 Additional Resources

- [Full Template List](./docs/TEMPLATES.md)
- [Style Guide](./docs/STYLES.md)
- [Examples Gallery](./docs/EXAMPLES.md)
- [API Integration](./docs/API-INTEGRATION.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your template or feature
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/Cloudstrucc/programmatic-diagram-generator/issues)
- **Email**: support@cloudstrucc.com
- **Documentation**: [Full Docs](./docs/)

## 🙏 Acknowledgments

- Built with [Anthropic Claude](https://www.anthropic.com)
- Diagram generation using [diagrams](https://diagrams.mingrammer.com)
- Icons from official cloud providers