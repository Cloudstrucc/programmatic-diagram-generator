# Azure Architecture Diagram Generator v2.1

Generate professional Azure/M365 architecture diagrams and automatically publish to GitHub or Azure DevOps Git repositories.

## Features

- 🤖 **AI-Powered Generation** - Describe diagrams in natural language using Claude API
- 🎨 **Professional Diagrams** - Uses PlantUML with C4 notation via Kroki API
- 🐙 **GitHub Integration** - Auto-push to public/private GitHub repos
- 🔷 **Azure DevOps Integration** - Auto-push to Azure DevOps Git repos  
- 📁 **Local Export** - Save to local filesystem
- 🔗 **URL Generation** - Get raw URLs for Markdown embedding
- 🐳 **Docker Support** - Run Kroki locally for offline/air-gapped environments
- 🔄 **CI/CD Ready** - Run in pipelines for automated diagram updates

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [AI-Powered Diagram Generation](#ai-powered-diagram-generation)
3. [Pre-defined Diagrams](#pre-defined-diagrams)
4. [Docker & Kroki Setup](#docker--kroki-setup)
5. [Publishing to Repositories](#publishing-to-repositories)
6. [Claude Model Options](#claude-model-options)
7. [CI/CD Integration](#cicd-integration)
8. [Adding Custom Diagrams](#adding-custom-diagrams)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Clone or download the project
cd node-diagrams-v2

# 2. Install dependencies
npm install

# 3. Start Kroki locally with Docker
docker run -d --name kroki -p 8000:8000 yuzutech/kroki

# 4. Configure environment
cp .env.template .env
# Edit .env and add your ANTHROPIC_API_KEY (for AI generation)

# 5. Generate a diagram with AI
node ai-diagram.js generate "A three-tier web application with load balancer"

# 6. Preview the result
open .temp-ai-diagrams/diagram-preview.png

# 7. Publish when ready
node ai-diagram.js publish --target local
```

---

## AI-Powered Diagram Generation

Generate architecture diagrams from natural language descriptions using Claude API.

### Setup

1. Get your Anthropic API key from https://console.anthropic.com/
2. Add to `.env`:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
   KROKI_URL=http://localhost:8000
   ```

### Commands

```bash
# Generate from description
node ai-diagram.js generate "Your architecture description here"
node ai-diagram.js generate "Azure web app with App Service, Key Vault, and Cosmos DB" --open
node ai-diagram.js generate "Kubernetes cluster with ingress" --verbose

# Preview current diagram in temp
node ai-diagram.js preview
node ai-diagram.js preview --open        # Open image automatically
node ai-diagram.js preview --puml        # Show PlantUML source code

# Regenerate after manual edits to the spec file
node ai-diagram.js regenerate --open

# Publish to targets
node ai-diagram.js publish --target local
node ai-diagram.js publish --target github
node ai-diagram.js publish --target devops
node ai-diagram.js publish --target all
node ai-diagram.js publish --target github --clean  # Clean temp after publish

# Clean temp files
node ai-diagram.js clean
```

### Example Prompts

```bash
# Simple architectures
node ai-diagram.js generate "Three-tier web application with load balancer, app servers, and PostgreSQL database"

# Azure architectures
node ai-diagram.js generate "Azure architecture with App Service, Azure Functions, Key Vault for secrets, Cosmos DB, and Application Insights for monitoring"

# Security architectures
node ai-diagram.js generate "M365 security architecture showing Conditional Access, Entra ID, and Microsoft Defender protecting Exchange, SharePoint, and Teams"

# Kubernetes
node ai-diagram.js generate "Kubernetes cluster with nginx ingress, three microservices (users, orders, payments), Redis cache, and PostgreSQL"

# Data pipelines
node ai-diagram.js generate "Data pipeline with Event Hub ingesting data, Stream Analytics for processing, Data Lake for storage, and Power BI for visualization"

# Power Platform
node ai-diagram.js generate "Power Platform solution with Dataverse, canvas app, Power Automate flows connecting to SharePoint and external REST API"
```

### Workflow: Generate → Edit → Publish

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   You Describe  │────▶│   Claude API    │────▶│   Kroki API     │
│   Architecture  │     │   Generates     │     │   Renders PNG   │
└─────────────────┘     │   PlantUML      │     └────────┬────────┘
                        └─────────────────┘              │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   GitHub or     │◀────│   You Review    │◀────│   Temp Folder   │
│   Azure DevOps  │     │   & Approve     │     │   Preview       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. **Generate**: Create initial diagram
   ```bash
   node ai-diagram.js generate "Your description" --verbose
   ```

2. **Preview**: Check the generated diagram
   ```bash
   open .temp-ai-diagrams/diagram-preview.png
   # Or
   node ai-diagram.js preview --open
   ```

3. **Edit (Optional)**: Modify the PlantUML if needed
   ```bash
   # View the spec
   cat .temp-ai-diagrams/diagram-spec.json
   
   # Edit with your editor
   code .temp-ai-diagrams/diagram-spec.json
   
   # Regenerate image from your edits
   node ai-diagram.js regenerate --open
   ```

4. **Publish**: Send to your target
   ```bash
   node ai-diagram.js publish --target github --clean
   ```

---

## Pre-defined Diagrams

Use `generate-diagram.js` for pre-built diagram templates:

```bash
# Generate all pre-defined diagrams
node generate-diagram.js --target local

# Generate specific diagram
node generate-diagram.js --diagrams cmk --target local

# Push to GitHub
node generate-diagram.js --target github
```

### Available Templates

| Name | Description |
|------|-------------|
| `cmk` | M365 & Power Platform Customer Managed Keys architecture |
| `m365` | LCE M365 Security Architecture (Protected B / NATO) |
| `teams` | Teams Premium Meeting Security with sensitivity labels |

---

## Docker & Kroki Setup

The diagram generator uses [Kroki](https://kroki.io) to render PlantUML diagrams.

### Option A: Docker (Recommended)

```bash
# Start Kroki container
docker run -d --name kroki -p 8000:8000 yuzutech/kroki

# Verify it's running
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

### Option B: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3'
services:
  kroki:
    image: yuzutech/kroki
    ports:
      - "8000:8000"
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```

### Option C: Hosted Kroki (No Docker)

Use `https://kroki.io` in your `.env`:
```bash
KROKI_URL=https://kroki.io
```

Note: Hosted version may have rate limits.

### Docker Commands Reference

```bash
# Start
docker run -d --name kroki -p 8000:8000 yuzutech/kroki

# Check status
docker ps | grep kroki

# View logs
docker logs kroki

# Stop
docker stop kroki

# Start again
docker start kroki

# Remove
docker rm -f kroki

# Update to latest
docker pull yuzutech/kroki
docker rm -f kroki
docker run -d --name kroki -p 8000:8000 yuzutech/kroki
```

---

## Publishing to Repositories

### GitHub Setup

1. **Create a Personal Access Token:**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scope: `repo`
   - Copy the token

2. **Create a repository** (e.g., `diagrams`)

3. **Configure `.env`:**
   ```bash
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   GITHUB_OWNER=your-username
   GITHUB_REPO=diagrams
   GITHUB_BRANCH=main
   GITHUB_FOLDER=images
   ```

4. **Publish:**
   ```bash
   node ai-diagram.js publish --target github
   ```

5. **Use in Markdown:**
   ```markdown
   ![Architecture](https://raw.githubusercontent.com/your-username/diagrams/main/images/diagram_name.png)
   ```

### Azure DevOps Setup

1. **Create a Personal Access Token:**
   - Go to `https://dev.azure.com/{org}/_usersSettings/tokens`
   - Click "New Token"
   - Select scope: `Code` → `Read & Write`

2. **Create a repository** in your project

3. **Configure `.env`:**
   ```bash
   AZDO_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   AZDO_ORG=your-org
   AZDO_PROJECT=your-project
   AZDO_REPO=diagrams
   AZDO_BRANCH=main
   AZDO_FOLDER=images
   ```

4. **Publish:**
   ```bash
   node ai-diagram.js publish --target devops
   ```

---

## Claude Model Options

You can choose different Claude models based on your needs:

| Model | ID | Best For |
|-------|-----|----------|
| **Claude Opus 4** | `claude-opus-4-20250514` | Most intelligent, complex architectures |
| **Claude Sonnet 4.5** | `claude-sonnet-4-5-20250929` | Good balance (DEFAULT) |
| **Claude Sonnet 4** | `claude-sonnet-4-20250514` | Good balance, slightly older |
| **Claude Haiku 3.5** | `claude-haiku-3-5-20250929` | Fastest, cheapest, simple diagrams |

### Changing the Model

In `.env`:
```bash
# For complex, detailed architectures
CLAUDE_MODEL=claude-opus-4-20250514

# For everyday use (default)
CLAUDE_MODEL=claude-sonnet-4-5-20250929

# For simple diagrams (faster, cheaper)
CLAUDE_MODEL=claude-haiku-3-5-20250929
```

---

## CI/CD Integration

### Azure DevOps Pipeline

```yaml
trigger:
  paths:
    include:
      - docs/diagrams/**

pool:
  vmImage: 'ubuntu-latest'

variables:
  - group: diagram-secrets

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'

  - script: |
      docker run -d --name kroki -p 8000:8000 yuzutech/kroki
      sleep 5
      curl http://localhost:8000/health
    displayName: 'Start Kroki'

  - script: |
      cd docs/diagrams
      npm ci
    displayName: 'Install dependencies'

  - script: |
      cd docs/diagrams
      node generate-diagram.js --target github --verbose
    displayName: 'Generate and push diagrams'
    env:
      KROKI_URL: http://localhost:8000
      GITHUB_TOKEN: $(GITHUB_TOKEN)
      GITHUB_OWNER: $(GITHUB_OWNER)
      GITHUB_REPO: diagrams

  - script: docker rm -f kroki
    displayName: 'Cleanup'
    condition: always()
```

### GitHub Actions

```yaml
name: Update Architecture Diagrams

on:
  push:
    paths:
      - 'docs/diagrams/**'
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    
    services:
      kroki:
        image: yuzutech/kroki
        ports:
          - 8000:8000
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd docs/diagrams
          npm ci
          
      - name: Wait for Kroki
        run: |
          timeout 30 bash -c 'until curl -s http://localhost:8000/health; do sleep 1; done'
          
      - name: Generate diagrams
        run: |
          cd docs/diagrams
          node generate-diagram.js --target github --verbose
        env:
          KROKI_URL: http://localhost:8000
          GITHUB_TOKEN: ${{ secrets.DIAGRAM_PAT }}
          GITHUB_OWNER: ${{ github.repository_owner }}
          GITHUB_REPO: diagrams
```

---

## Adding Custom Diagrams

### To `generate-diagram.js`

Add to the `diagrams` object:

```javascript
const diagrams = {
  // ... existing ...
  
  myDiagram: {
    name: 'my_custom_diagram',
    title: 'My Custom Architecture',
    puml: `@startuml
skinparam backgroundColor white
skinparam componentStyle rectangle

title My Custom Architecture

rectangle "Frontend" #e3f2fd {
  component "Web App" as webapp #90caf9
}

rectangle "Backend" #e8f5e9 {
  component "API" as api #a5d6a7
  database "Database" as db #a5d6a7
}

webapp -[#blue]-> api : REST
api -[#green]-> db : queries

@enduml`
  }
};
```

### PlantUML Reference

**Shapes:**
```plantuml
component "Service" as svc
database "Database" as db
storage "Storage" as store
queue "Queue" as q
actor "User" as user
file "File" as f
```

**Grouping:**
```plantuml
rectangle "Group Name" #e3f2fd {
  component "Item" as item #90caf9
}
```

**Connections:**
```plantuml
a --> b : label
a -[#blue]-> b : blue
a -[#red,bold]-> b : red bold
a -[#green,dashed]-> b : green dashed
a -[#gray,dotted]-> b : gray dotted
```

**Colors (Material Design):**
```
Blue:   #e3f2fd (light), #90caf9 (medium), #1976d2 (dark)
Green:  #e8f5e9 (light), #a5d6a7 (medium), #388e3c (dark)
Orange: #fff3e0 (light), #ffcc80 (medium), #f57c00 (dark)
Red:    #ffebee (light), #ef9a9a (medium), #d32f2f (dark)
Purple: #f3e5f5 (light), #ce93d8 (medium), #7b1fa2 (dark)
Cyan:   #e0f7fa (light), #80deea (medium), #0097a7 (dark)
```

---

## Troubleshooting

### "Kroki API error: 400 Bad Request"

- PlantUML syntax error
- Run with `--verbose` to see the generated PlantUML
- Test at https://kroki.io/ manually

### "ECONNREFUSED 127.0.0.1:8000"

- Kroki container isn't running
- Start it: `docker run -d --name kroki -p 8000:8000 yuzutech/kroki`

### "ANTHROPIC_API_KEY not set"

- Add your API key to `.env`
- Get one at https://console.anthropic.com/

### "GitHub configuration missing"

- Ensure `GITHUB_TOKEN` and `GITHUB_OWNER` are set in `.env`

### "Repository not found"

- Verify the repository exists
- Check branch name (usually `main`)
- Verify token has access

### Port 8000 already in use

```bash
# Find what's using it
lsof -i :8000

# Use different port
docker run -d --name kroki -p 9000:8000 yuzutech/kroki
# Update .env: KROKI_URL=http://localhost:9000
```

---

## Environment Variables Reference

```bash
# AI Generation (required for ai-diagram.js)
ANTHROPIC_API_KEY=sk-ant-xxxxx
CLAUDE_MODEL=claude-sonnet-4-5-20250929

# Diagram Rendering (required)
KROKI_URL=http://localhost:8000

# GitHub Publishing (optional)
GITHUB_TOKEN=ghp_xxxxx
GITHUB_OWNER=username
GITHUB_REPO=diagrams
GITHUB_BRANCH=main
GITHUB_FOLDER=images
GITHUB_USER_NAME=Your Name
GITHUB_USER_EMAIL=you@example.com

# Azure DevOps Publishing (optional)
AZDO_TOKEN=xxxxx
AZDO_ORG=your-org
AZDO_PROJECT=your-project
AZDO_REPO=diagrams
AZDO_BRANCH=main
AZDO_FOLDER=images
AZDO_USER_NAME=Your Name
AZDO_USER_EMAIL=you@example.com

# Local Output
LOCAL_OUTPUT_DIR=./output
COMMIT_MESSAGE_PREFIX=docs(diagrams): update architecture diagrams
```

---

## License

MIT