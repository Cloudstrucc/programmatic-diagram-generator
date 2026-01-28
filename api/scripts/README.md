# API Scripts

Helper scripts for setting up, testing, and managing the Diagram API server.

## Setup Scripts

### `setup.sh`
Complete setup script for first-time installation.

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**What it does:**
- Checks Node.js version (18+ required)
- Checks MongoDB connection
- Installs npm dependencies
- Creates .env file from template
- Verifies configuration

### `quickstart.sh`
Quick reference for setup steps.

## JWT Token Generators

### `generate-jwt.js` (Node.js - Recommended)
Full-featured JWT token generator.

```bash
# Generate with defaults
node scripts/generate-jwt.js

# Generate with custom API key and tier
node scripts/generate-jwt.js my-api-key pro

# Save token to file
node scripts/generate-jwt.js > .jwt-token
```

**Features:**
- Custom API key and tier
- 30-day expiration
- Example curl commands included
- Uses jsonwebtoken library

### `generate-token-now.js` (Simple)
Quick token generator with minimal output.

```bash
node scripts/generate-token-now.js
```

### `quick-generator.sh` (Bash - No dependencies)
Pure bash JWT generator (no Node.js dependencies needed).

```bash
chmod +x scripts/quick-generator.sh
./scripts/quick-generator.sh [api-key] [tier]

# Examples
./scripts/quick-generator.sh
./scripts/quick-generator.sh my-key pro
```

### `test-token.js` (Legacy)
Simple token generator for testing.

```bash
node scripts/test-token.js
```

## Testing Scripts

### `test-api.sh`
Comprehensive API test suite.

```bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

**Tests:**
1. Health check
2. Get templates
3. Generate diagram
4. Check status
5. Usage statistics

**Prerequisites:**
- Server running on port 3000
- `.jwt-token` file in API root directory
- `jq` installed for JSON parsing

## Usage Examples

### Complete Setup
```bash
# 1. Run setup
./scripts/setup.sh

# 2. Edit environment
nano .env

# 3. Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 4. Generate token
node scripts/generate-jwt.js > .jwt-token

# 5. Start server
npm start

# 6. Test API
./scripts/test-api.sh
```

### Quick Token Generation
```bash
# Generate and save
node scripts/generate-jwt.js > .jwt-token

# Use in curl
curl http://localhost:3000/api/diagram/templates \
  -H "Authorization: Bearer $(cat .jwt-token)"
```

### Switching Tiers
```bash
# Free tier (default)
node scripts/generate-jwt.js test-key free > .jwt-token

# Pro tier
node scripts/generate-jwt.js my-key pro > .jwt-token

# Enterprise tier
node scripts/generate-jwt.js enterprise-key enterprise > .jwt-token
```

## Directory Structure

```
scripts/
├── README.md                  # This file
├── setup.sh                   # Complete setup script
├── quickstart.sh              # Quick reference
├── test-api.sh                # API test suite
├── generate-jwt.js            # Full-featured token generator (recommended)
├── generate-token-now.js      # Simple token generator
├── quick-generator.sh         # Bash token generator (no deps)
└── test-token.js              # Legacy token generator
```

## Troubleshooting

### "jq: command not found"
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

### "MongoDB connection failed"
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### "Invalid token"
```bash
# Generate fresh token
node scripts/generate-jwt.js > .jwt-token

# Verify JWT_SECRET matches server
echo $JWT_SECRET
```
