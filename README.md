# Azure Architecture Diagram Generator v2.0

Generate professional Azure/M365 architecture diagrams with real Microsoft icons and automatically publish to GitHub or Azure DevOps Git repositories.

## Features

- 🎨 **Professional Diagrams** - Uses PlantUML with official Azure icons via Kroki API
- 🐙 **GitHub Integration** - Auto-push to public/private GitHub repos
- 🔷 **Azure DevOps Integration** - Auto-push to Azure DevOps Git repos  
- 📁 **Local Export** - Save to local filesystem
- 🔗 **URL Generation** - Get raw URLs for Markdown embedding
- 🔄 **CI/CD Ready** - Run in pipelines for automated diagram updates

## Quick Start

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.template .env
# Edit .env with your tokens and settings

# Generate diagrams locally
node generate-diagram.js --target local

# Generate and push to GitHub
node generate-diagram.js --target github

# Generate and push to Azure DevOps
node generate-diagram.js --target devops

# Push to all targets
node generate-diagram.js --target all
```

## Configuration

### Environment Variables (.env)

```bash
# Kroki API (diagram rendering)
KROKI_URL=https://kroki.io

# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxx          # PAT with 'repo' scope
GITHUB_OWNER=your-username
GITHUB_REPO=diagrams
GITHUB_BRANCH=main
GITHUB_FOLDER=images

# Azure DevOps
AZDO_TOKEN=xxxxxxxxxxxxxxxx            # PAT with 'Code (Read & Write)'
AZDO_ORG=your-org
AZDO_PROJECT=your-project
AZDO_REPO=diagrams
AZDO_BRANCH=main
AZDO_FOLDER=images
```

### Creating Access Tokens

**GitHub Personal Access Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: `repo` (full control of private repositories)
4. Copy token to `GITHUB_TOKEN`

**Azure DevOps Personal Access Token:**
1. Go to https://dev.azure.com/{org}/_usersSettings/tokens
2. Click "New Token"
3. Select scope: `Code` → `Read & Write`
4. Copy token to `AZDO_TOKEN`

## Usage

### Command Line Options

```bash
node generate-diagram.js [options]

Options:
  -t, --target <target>   Output target: local, github, devops, all (default: local)
  -d, --diagrams <list>   Comma-separated diagram names or "all" (default: all)
  --dry-run               Generate but don't push to remote
  -v, --verbose           Show detailed output
```

### Examples

```bash
# Generate only CMK diagram locally
node generate-diagram.js --diagrams cmk --target local

# Generate all diagrams and push to GitHub (dry run)
node generate-diagram.js --target github --dry-run --verbose

# Generate M365 and Teams diagrams, push everywhere
node generate-diagram.js --diagrams m365,teams --target all
```

## Available Diagrams

| Name | Description |
|------|-------------|
| `cmk` | M365 & Power Platform Customer Managed Keys architecture |
| `m365` | LCE M365 Security Architecture (Protected B / NATO) |
| `teams` | Teams Premium Meeting Security with sensitivity labels |

## Using Generated URLs in Markdown

After running the generator, you'll get URLs like:

**GitHub:**
```markdown
![CMK Architecture](https://raw.githubusercontent.com/your-username/diagrams/main/images/cmk_architecture.png)
```

**Azure DevOps:**
```markdown
![CMK Architecture](https://dev.azure.com/your-org/your-project/_git/diagrams?path=/images/cmk_architecture.png&version=GBmain)
```

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
  - group: diagram-secrets  # Contains GITHUB_TOKEN or AZDO_TOKEN

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'

  - script: |
      cd docs/diagrams
      npm ci
    displayName: 'Install dependencies'

  - script: |
      cd docs/diagrams
      node generate-diagram.js --target github --verbose
    displayName: 'Generate and push diagrams'
    env:
      GITHUB_TOKEN: $(GITHUB_TOKEN)
      GITHUB_OWNER: $(GITHUB_OWNER)
      GITHUB_REPO: diagrams
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
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd docs/diagrams
          npm ci
          
      - name: Generate diagrams
        run: |
          cd docs/diagrams
          node generate-diagram.js --target github
        env:
          GITHUB_TOKEN: ${{ secrets.DIAGRAM_PAT }}
          GITHUB_OWNER: ${{ github.repository_owner }}
          GITHUB_REPO: diagrams
```

## Adding Custom Diagrams

Edit `generate-diagram.js` and add to the `diagrams` object:

```javascript
const diagrams = {
  // ... existing diagrams ...
  
  myDiagram: {
    name: 'my_custom_diagram',
    title: 'My Custom Architecture',
    puml: `
@startuml
!define AzurePuml https://raw.githubusercontent.com/plantuml-stdlib/Azure-PlantUML/master/dist
!include AzurePuml/AzureCommon.puml
!include AzurePuml/Security/AzureKeyVault.puml

title My Custom Diagram

AzureKeyVault(kv, "Key Vault", "")

@enduml
`
  }
};
```

### Available Azure Icons

Full list: https://github.com/plantuml-stdlib/Azure-PlantUML

Common includes:
```plantuml
!include AzurePuml/Security/AzureKeyVault.puml
!include AzurePuml/Security/AzureSentinel.puml
!include AzurePuml/Identity/AzureActiveDirectory.puml
!include AzurePuml/Identity/AzureManagedIdentity.puml
!include AzurePuml/Analytics/AzureLogAnalyticsWorkspace.puml
!include AzurePuml/DevOps/AzureDevOps.puml
!include AzurePuml/DevOps/AzurePipelines.puml
!include AzurePuml/Compute/AzureFunction.puml
!include AzurePuml/Storage/AzureBlobStorage.puml
!include AzurePuml/Networking/AzureVirtualNetwork.puml
!include AzurePuml/Networking/AzureFirewall.puml
!include AzurePuml/Databases/AzureCosmosDb.puml
!include AzurePuml/Integration/AzureLogicApps.puml
```

## Self-Hosted Kroki (Air-Gapped Environments)

For environments without internet access:

```bash
# Run Kroki locally via Docker
docker run -d -p 8000:8000 yuzutech/kroki

# Update .env
KROKI_URL=http://localhost:8000
```

## Troubleshooting

**"GitHub configuration missing"**
- Ensure `GITHUB_TOKEN` and `GITHUB_OWNER` are set in `.env`
- Check token has `repo` scope

**"Azure DevOps configuration missing"**
- Ensure `AZDO_TOKEN`, `AZDO_ORG`, and `AZDO_PROJECT` are set
- Check token has `Code (Read & Write)` scope

**"Kroki API error"**
- Check internet connectivity
- Try self-hosted Kroki with Docker
- Verify PlantUML syntax is valid

**"Repository not found"**
- Ensure the repository exists
- Check branch name is correct
- Verify token has access to the repository

## License

MIT