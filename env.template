# Azure Diagram Generator - Environment Configuration
# Copy this file to .env and fill in your values

# =============================================================================
# ANTHROPIC API (for AI-powered diagram generation)
# =============================================================================
# Get your API key at: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Model to use (default: claude-sonnet-4-5-20250929)
# Options (best to fastest):
#   claude-opus-4-20250514      - Most intelligent, best for complex diagrams
#   claude-sonnet-4-5-20250929  - Newer Sonnet, good balance (DEFAULT)
#   claude-sonnet-4-20250514    - Good balance of speed/quality
#   claude-haiku-3-5-20250929   - Fastest, cheapest
CLAUDE_MODEL=claude-opus-4-20250514

# =============================================================================
# KROKI API (for diagram rendering)
# =============================================================================
# Use localhost if running Docker: docker run -d -p 8000:8000 yuzutech/kroki

# =============================================================================
# GITHUB CONFIGURATION
# =============================================================================
# Personal Access Token with 'repo' scope
# Create at: https://github.com/settings/tokens
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Repository details
GITHUB_OWNER=your-username
GITHUB_REPO=diagrams
GITHUB_BRANCH=main
GITHUB_FOLDER=images

# Git user for commits
GITHUB_USER_NAME=Your Name
GITHUB_USER_EMAIL=your.email@example.com

# =============================================================================
# AZURE DEVOPS CONFIGURATION
# =============================================================================
# Personal Access Token with 'Code (Read & Write)' scope
# Create at: https://dev.azure.com/{org}/_usersSettings/tokens
AZDO_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Organization and project
AZDO_ORG=your-org
AZDO_PROJECT=your-project
AZDO_REPO=diagrams
AZDO_BRANCH=main
AZDO_FOLDER=images

# Git user for commits
AZDO_USER_NAME=Your Name
AZDO_USER_EMAIL=your.email@example.com

# =============================================================================
# OUTPUT OPTIONS
# =============================================================================
# Local output directory (for --target local)
LOCAL_OUTPUT_DIR=./output

# Commit message prefix
COMMIT_MESSAGE_PREFIX=docs(diagrams): update architecture diagrams

# Local Kroki (for c4/plain styles)
KROKI_LOCAL_URL=http://localhost:8000

# Public Kroki (for azure/aws styles) 
KROKI_PUBLIC_URL=https://kroki.io
