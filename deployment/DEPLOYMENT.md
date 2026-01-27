# CloudStrucc Diagram Generator - Azure Deployment Guide

Complete guide for deploying CloudStrucc to Azure using Docker containers with custom domains and SSL.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Deployment Steps](#detailed-deployment-steps)
5. [Environment Configuration](#environment-configuration)
6. [Custom Domain Setup](#custom-domain-setup)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring & Logs](#monitoring--logs)
9. [Updates & Maintenance](#updates--maintenance)
10. [Cost Optimization](#cost-optimization)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Azure Cloud                          │
│                                                          │
│  ┌────────────────────┐      ┌────────────────────┐   │
│  │   Webapp Container │      │   API Container    │   │
│  │   (Node.js + HBS)  │─────▶│  (Node.js+Python)  │   │
│  │   Port: 3001       │      │   Port: 3000       │   │
│  └────────────────────┘      └────────────────────┘   │
│           │                            │                │
│           │                            │                │
│  ┌────────▼────────────────────────────▼─────────┐    │
│  │     Azure Cosmos DB (MongoDB API)             │    │
│  │     - diagram-generator (API data)            │    │
│  │     - diagram-generator-web (Webapp data)     │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────────────────────────────────────┐     │
│  │   Azure Container Registry (ACR)             │     │
│  │   - cloudstruccacr.azurecr.io/api:latest     │     │
│  │   - cloudstruccacr.azurecr.io/webapp:latest  │     │
│  └──────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

### Required Software

- **Azure CLI** (v2.50+): `brew install azure-cli`
- **Docker Desktop**: https://www.docker.com/products/docker-desktop
- **Git**: For repository management
- **Azure Subscription**: Active with Owner or Contributor permissions

### Required Services

- **Anthropic API Key**: Get from https://console.anthropic.com
- **Custom Domain** (optional): For production deployments
- **DNS Access**: To configure CNAME records

### Verify Prerequisites

```bash
# Check Azure CLI
az version
az login

# Check Docker
docker --version
docker info

# Check Docker Buildx (for multi-platform builds)
docker buildx version
```

## Quick Start

### 1. Prepare Repository

```bash
cd ~/repos/programmatic-diagram-generator

# Copy Dockerfiles
cp ~/Downloads/api-Dockerfile api/Dockerfile
cp ~/Downloads/webapp-Dockerfile webapp-frontend/Dockerfile
cp ~/Downloads/.dockerignore api/.dockerignore
cp ~/Downloads/.dockerignore webapp-frontend/.dockerignore

# Copy deployment script
cp ~/Downloads/deploy-docker-FIXED.sh deployment/.deploy-docker.sh
chmod +x deployment/.deploy-docker.sh
```

### 2. Configure Deployment

```bash
# Edit configuration
nano deployment/.deploy-docker.sh
```

**Critical Settings (lines 11-30):**

```bash
SUBSCRIPTION_ID="7719c366-5f64-439a-a6c6-65067d5a97e4"
RESOURCE_GROUP="cloudstrucc-rg"
LOCATION="canadacentral"
ACR_NAME="cloudstruccacr"  # Lowercase, no hyphens!

API_APP_NAME="api-cloudstrucc-unique"
WEBAPP_APP_NAME="webapp-cloudstrucc-unique"
MONGODB_NAME="cloudstrucc-mongodb"

ANTHROPIC_API_KEY="sk-ant-your-actual-key"

# Optional custom domains
API_CUSTOM_DOMAIN="api.cloudstrucc.com"
WEBAPP_CUSTOM_DOMAIN="app.cloudstrucc.com"
```

### 3. Register Azure Providers (One-time)

```bash
# Register required providers
az provider register --namespace Microsoft.DocumentDB
az provider register --namespace Microsoft.ContainerRegistry
az provider register --namespace Microsoft.Web

# Verify registration (wait 2-3 minutes)
az provider show --namespace Microsoft.DocumentDB --query "registrationState"
az provider show --namespace Microsoft.ContainerRegistry --query "registrationState"
```

Should all return: `"Registered"`

### 4. Enable Docker Buildx

```bash
# Create multi-platform builder
docker buildx create --use --name multiplatform-builder

# Verify
docker buildx ls
# Should show: multiplatform-builder * (active)
```

### 5. Deploy

```bash
# From repository root
bash deployment/.deploy-docker.sh init
```

**Deployment Timeline:**
- Resource creation: 10-15 minutes
- Docker image builds: 5-10 minutes
- Container deployment: 3-5 minutes
- **Total: 20-30 minutes**

## Detailed Deployment Steps

### Phase 1: Build Docker Images for AMD64

Azure App Services run on AMD64 (Intel/AMD) processors, not ARM64 (Apple Silicon). You must build images for the correct platform:

```bash
# Login to ACR
az acr login --name cloudstruccacr

# Build API for AMD64
cd ~/repos/programmatic-diagram-generator/api
docker buildx build --platform linux/amd64 \
  -t cloudstruccacr.azurecr.io/api:latest \
  --push .

# Build Webapp for AMD64
cd ../webapp-frontend
docker buildx build --platform linux/amd64 \
  -t cloudstruccacr.azurecr.io/webapp:latest \
  --push .

# Verify images in registry
az acr repository list --name cloudstruccacr --output table
```

**Expected Output:**
```
Result
--------
api
webapp
```

### Phase 2: Configure Environment Variables

Environment variables MUST be set via Azure Portal due to Azure CLI bugs with special characters.

#### API Environment Variables

1. Go to: Azure Portal → App Services → **api-cloudstrucc-unique**
2. Click: **Configuration** → **Application settings**
3. Add these settings:

```bash
NODE_ENV = production
ANTHROPIC_API_KEY = sk-ant-your-key
JWT_SECRET = [openssl rand -base64 32]
MONGODB_URI = [cosmos DB connection string]
WEBSITES_PORT = 3000
DOCKER_REGISTRY_SERVER_URL = https://cloudstruccacr.azurecr.io
DOCKER_REGISTRY_SERVER_USERNAME = cloudstruccacr
DOCKER_REGISTRY_SERVER_PASSWORD = [from ACR credentials]
```

#### Webapp Environment Variables

1. Go to: Azure Portal → App Services → **webapp-cloudstrucc-unique**
2. Click: **Configuration** → **Application settings**
3. Add these settings:

```bash
NODE_ENV = production
API_URL = https://api-cloudstrucc-unique.azurewebsites.net
API_JWT_SECRET = [same as API JWT_SECRET]
MONGODB_URI = [cosmos DB connection string]/diagram-generator-web
SESSION_SECRET = [openssl rand -base64 32]
WEBSITES_PORT = 3001
DOCKER_REGISTRY_SERVER_URL = https://cloudstruccacr.azurecr.io
DOCKER_REGISTRY_SERVER_USERNAME = cloudstruccacr
DOCKER_REGISTRY_SERVER_PASSWORD = [from ACR credentials]
```

**Get Values:**

```bash
# MongoDB Connection String
az cosmosdb keys list \
  --name cloudstrucc-mongodb \
  --resource-group cloudstrucc-rg \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" -o tsv

# ACR Password
az acr credential show \
  --name cloudstruccacr \
  --query "passwords[0].value" -o tsv

# Generate Secrets
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # SESSION_SECRET
```

**Important:** JWT_SECRET must match between API and Webapp!

### Phase 3: Configure Container Registry

#### Option 1: Azure Portal (Recommended)

1. **API App:**
   - Go to: **api-cloudstrucc-unique** → **Deployment Center**
   - Source: **Container Registry**
   - Registry: **Azure Container Registry**
   - Registry name: **cloudstruccacr**
   - Image: **api**
   - Tag: **latest**
   - Authentication: **Admin Credentials**
   - Click **Save**

2. **Webapp App:**
   - Go to: **webapp-cloudstrucc-unique** → **Deployment Center**
   - Source: **Container Registry**
   - Registry: **Azure Container Registry**
   - Registry name: **cloudstruccacr**
   - Image: **webapp**
   - Tag: **latest**
   - Authentication: **Admin Credentials**
   - Click **Save**

#### Option 2: Azure CLI

```bash
# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name cloudstruccacr --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name cloudstruccacr --query "passwords[0].value" -o tsv)

# Configure API
az webapp config container set \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  --docker-custom-image-name cloudstruccacr.azurecr.io/api:latest \
  --docker-registry-server-url https://cloudstruccacr.azurecr.io \
  --docker-registry-server-user "$ACR_USERNAME" \
  --docker-registry-server-password "$ACR_PASSWORD"

# Configure Webapp
az webapp config container set \
  --name webapp-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  --docker-custom-image-name cloudstruccacr.azurecr.io/webapp:latest \
  --docker-registry-server-url https://cloudstruccacr.azurecr.io \
  --docker-registry-server-user "$ACR_USERNAME" \
  --docker-registry-server-password "$ACR_PASSWORD"
```

### Phase 4: Restart and Verify

```bash
# Restart both apps
az webapp restart --resource-group cloudstrucc-rg --name api-cloudstrucc-unique
az webapp restart --resource-group cloudstrucc-rg --name webapp-cloudstrucc-unique

# Wait 2-3 minutes for containers to start

# Test API
curl https://api-cloudstrucc-unique.azurewebsites.net/health

# Expected: {"status":"ok","timestamp":"2026-01-27T..."}

# Test Webapp
curl -I https://webapp-cloudstrucc-unique.azurewebsites.net

# Expected: HTTP/1.1 200 OK
```

## Environment Configuration

### Complete Environment Variables Reference

#### API (.env equivalent)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `ANTHROPIC_API_KEY` | Claude API key | `sk-ant-api03-...` |
| `JWT_SECRET` | Token signing secret | `base64-encoded-secret` |
| `MONGODB_URI` | Database connection | `mongodb://...` |
| `WEBSITES_PORT` | Container port | `3000` |
| `DOCKER_REGISTRY_SERVER_URL` | ACR URL | `https://cloudstruccacr.azurecr.io` |
| `DOCKER_REGISTRY_SERVER_USERNAME` | ACR username | `cloudstruccacr` |
| `DOCKER_REGISTRY_SERVER_PASSWORD` | ACR password | `YmCTXLn...` |

#### Webapp (.env equivalent)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `API_URL` | API endpoint | `https://api-cloudstrucc-unique...` |
| `API_JWT_SECRET` | Must match API | `same-as-api-jwt-secret` |
| `MONGODB_URI` | Webapp database | `mongodb://.../diagram-generator-web` |
| `SESSION_SECRET` | Session signing | `base64-encoded-secret` |
| `WEBSITES_PORT` | Container port | `3001` |
| `DOCKER_REGISTRY_SERVER_URL` | ACR URL | `https://cloudstruccacr.azurecr.io` |
| `DOCKER_REGISTRY_SERVER_USERNAME` | ACR username | `cloudstruccacr` |
| `DOCKER_REGISTRY_SERVER_PASSWORD` | ACR password | `YmCTXLn...` |

## Custom Domain Setup

### DNS Configuration

Add these records in your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare):

**API Domain:**
```
Type: CNAME
Name: api
Value: api-cloudstrucc-unique.azurewebsites.net
TTL: 3600
```

**Webapp Domain:**
```
Type: CNAME
Name: app
Value: webapp-cloudstrucc-unique.azurewebsites.net
TTL: 3600
```

**Domain Verification (required):**
```
Type: TXT
Name: asuid.app (or asuid)
Value: [get from Azure - see below]
TTL: 3600
```

### Get Verification ID

```bash
az webapp show \
  --resource-group cloudstrucc-rg \
  --name webapp-cloudstrucc-unique \
  --query customDomainVerificationId -o tsv
```

### Add Custom Domains in Azure

```bash
# Wait for DNS propagation (5-10 minutes)
# Verify DNS: nslookup api.cloudstrucc.com

# Add API domain
az webapp config hostname add \
  --resource-group cloudstrucc-rg \
  --webapp-name api-cloudstrucc-unique \
  --hostname api.cloudstrucc.com

# Add Webapp domain
az webapp config hostname add \
  --resource-group cloudstrucc-rg \
  --webapp-name webapp-cloudstrucc-unique \
  --hostname app.cloudstrucc.com
```

### Enable SSL Certificates

```bash
# Enable SSL for API
az webapp config ssl bind \
  --resource-group cloudstrucc-rg \
  --name api-cloudstrucc-unique \
  --certificate-thumbprint auto \
  --ssl-type SNI

# Enable SSL for Webapp
az webapp config ssl bind \
  --resource-group cloudstrucc-rg \
  --name webapp-cloudstrucc-unique \
  --certificate-thumbprint auto \
  --ssl-type SNI

# Enforce HTTPS
az webapp update \
  --resource-group cloudstrucc-rg \
  --name api-cloudstrucc-unique \
  --https-only true

az webapp update \
  --resource-group cloudstrucc-rg \
  --name webapp-cloudstrucc-unique \
  --https-only true
```

## Troubleshooting

### Issue: Container Won't Start

**Symptoms:**
- App shows "Application Error"
- Logs show "Container exited with code 1"

**Solutions:**

1. **Check Container Logs:**
```bash
az webapp log tail --resource-group cloudstrucc-rg --name api-cloudstrucc-unique
```

2. **Verify Environment Variables:**
```bash
az webapp config appsettings list \
  --resource-group cloudstrucc-rg \
  --name api-cloudstrucc-unique
```

Look for `null` values - these must be set via Azure Portal.

3. **Check Container Image:**
```bash
# Verify image exists
az acr repository show \
  --name cloudstruccacr \
  --image api:latest

# Check image platform
docker buildx imagetools inspect cloudstruccacr.azurecr.io/api:latest
# Should show: linux/amd64
```

### Issue: Authentication Errors (401/403)

**Symptoms:**
- "unauthorized: authentication required"
- "Image pull failed"

**Solutions:**

1. **Verify ACR Credentials:**
```bash
# Test ACR login
az acr login --name cloudstruccacr

# Get credentials
az acr credential show --name cloudstruccacr
```

2. **Reset ACR Password:**
```bash
# Regenerate password
az acr credential renew \
  --name cloudstruccacr \
  --password-name password

# Get new password
az acr credential show \
  --name cloudstruccacr \
  --query "passwords[0].value" -o tsv

# Update App Service (via Portal or CLI)
```

3. **Set via Azure Portal:**
   - Go to App Service → Configuration
   - Update `DOCKER_REGISTRY_SERVER_PASSWORD`
   - Click Save

### Issue: "no matching manifest for linux/amd64"

**Cause:** Image built for ARM64 (Mac) instead of AMD64 (Azure).

**Solution:**

```bash
# Rebuild for AMD64
cd ~/repos/programmatic-diagram-generator/api
docker buildx build --platform linux/amd64 \
  -t cloudstruccacr.azurecr.io/api:latest \
  --push .

cd ../webapp-frontend
docker buildx build --platform linux/amd64 \
  -t cloudstruccacr.azurecr.io/webapp:latest \
  --push .

# Restart apps
az webapp restart --resource-group cloudstrucc-rg --name api-cloudstrucc-unique
az webapp restart --resource-group cloudstrucc-rg --name webapp-cloudstrucc-unique
```

### Issue: MongoDB Connection Failed

**Symptoms:**
- "MongoServerError: bad auth"
- "Connection refused"

**Solutions:**

1. **Verify Connection String:**
```bash
az cosmosdb keys list \
  --name cloudstrucc-mongodb \
  --resource-group cloudstrucc-rg \
  --type connection-strings
```

2. **Check Firewall:**
```bash
# Enable public network access
az cosmosdb update \
  --resource-group cloudstrucc-rg \
  --name cloudstrucc-mongodb \
  --enable-public-network true

# Or add specific IP ranges
az cosmosdb network-rule add \
  --resource-group cloudstrucc-rg \
  --name cloudstrucc-mongodb \
  --virtual-network myVNet \
  --subnet mySubnet
```

3. **Test Connection:**
```bash
# From local machine
mongosh "mongodb://cloudstrucc-mongodb.mongo.cosmos.azure.com:10255/?ssl=true"
```

### Issue: Environment Variables Show as Null

**Cause:** Azure CLI bug with special characters in values.

**Solution:** Use Azure Portal exclusively for setting environment variables:

1. Go to App Service → Configuration
2. Click "+ New application setting"
3. Enter name and value
4. Click OK
5. Click Save at top

Do NOT use `az webapp config appsettings set` with complex values.

### Issue: Python Dependencies Missing

**Symptoms:**
- "ModuleNotFoundError: No module named 'anthropic'"
- "Command not found: python3.11"

**Cause:** Docker image not built correctly.

**Solution:**

1. **Verify Dockerfile:**
```bash
cat api/Dockerfile
# Should contain:
# RUN apt-get update && apt-get install -y python3.11...
# RUN pip3 install anthropic diagrams...
```

2. **Rebuild Image:**
```bash
cd api
docker buildx build --platform linux/amd64 \
  -t cloudstruccacr.azurecr.io/api:latest \
  --push .
```

3. **Test Locally:**
```bash
docker run -it --rm cloudstruccacr.azurecr.io/api:latest python3.11 -c "import anthropic; print('OK')"
```

### Issue: Passport.js Authentication Not Working

**Symptoms:**
- Can see static pages
- Cannot register or login
- Session errors

**Solutions:**

1. **Check SESSION_SECRET:**
```bash
# Must be set in webapp
az webapp config appsettings list \
  --resource-group cloudstrucc-rg \
  --name webapp-cloudstrucc-unique \
  --query "[?name=='SESSION_SECRET']"
```

2. **Verify MongoDB Connection:**
```bash
# Check webapp MongoDB URI
# Should end with: /diagram-generator-web
```

3. **Check Logs:**
```bash
az webapp log tail \
  --resource-group cloudstrucc-rg \
  --name webapp-cloudstrucc-unique
```

Look for:
- MongoDB connection errors
- Session store errors
- Passport initialization errors

4. **Common Fixes:**
```bash
# Set correct environment variables via Portal:
MONGODB_URI = mongodb://...your-connection.../diagram-generator-web
SESSION_SECRET = [generate new: openssl rand -base64 32]
NODE_ENV = production
```

## Monitoring & Logs

### Real-time Logs

```bash
# API logs
az webapp log tail \
  --resource-group cloudstrucc-rg \
  --name api-cloudstrucc-unique

# Webapp logs
az webapp log tail \
  --resource-group cloudstrucc-rg \
  --name webapp-cloudstrucc-unique
```

### Enable Logging

```bash
# Enable application logging
az webapp log config \
  --resource-group cloudstrucc-rg \
  --name api-cloudstrucc-unique \
  --application-logging filesystem \
  --level information \
  --docker-container-logging filesystem

# Download logs
az webapp log download \
  --resource-group cloudstrucc-rg \
  --name api-cloudstrucc-unique \
  --log-file api-logs.zip
```

### Health Checks

```bash
# API health endpoint
curl https://api-cloudstrucc-unique.azurewebsites.net/health

# Expected response:
# {"status":"ok","timestamp":"2026-01-27T..."}

# Webapp health
curl -I https://webapp-cloudstrucc-unique.azurewebsites.net

# Expected: HTTP/1.1 200 OK
```

### Application Insights (Optional)

```bash
# Create Application Insights
az monitor app-insights component create \
  --app cloudstrucc-insights \
  --location canadacentral \
  --resource-group cloudstrucc-rg \
  --application-type web

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app cloudstrucc-insights \
  --resource-group cloudstrucc-rg \
  --query instrumentationKey -o tsv)

# Add to App Service
az webapp config appsettings set \
  --resource-group cloudstrucc-rg \
  --name api-cloudstrucc-unique \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="$INSTRUMENTATION_KEY"
```

## Updates & Maintenance

### Update Application Code

```bash
# 1. Make code changes locally
git pull
# or edit files

# 2. Rebuild and push images
cd ~/repos/programmatic-diagram-generator

# Build API
cd api
docker buildx build --platform linux/amd64 \
  -t cloudstruccacr.azurecr.io/api:latest \
  --push .

# Build Webapp
cd ../webapp-frontend
docker buildx build --platform linux/amd64 \
  -t cloudstruccacr.azurecr.io/webapp:latest \
  --push .

# 3. Restart apps
az webapp restart --resource-group cloudstrucc-rg --name api-cloudstrucc-unique
az webapp restart --resource-group cloudstrucc-rg --name webapp-cloudstrucc-unique

# 4. Verify
curl https://api-cloudstrucc-unique.azurewebsites.net/health
```

**Or use the deployment script:**

```bash
bash deployment/.deploy-docker.sh update
```

### Update Environment Variables

1. Go to Azure Portal → App Service → Configuration
2. Update the setting
3. Click Save
4. App automatically restarts

### Scale Up/Down

```bash
# Scale to Standard tier (better performance)
az appservice plan update \
  --name cloudstrucc-plan \
  --resource-group cloudstrucc-rg \
  --sku S1

# Scale back to Basic
az appservice plan update \
  --name cloudstrucc-plan \
  --resource-group cloudstrucc-rg \
  --sku B1
```

### Backup & Restore

```bash
# Create storage account for backups
az storage account create \
  --name cloudstruccbackup \
  --resource-group cloudstrucc-rg \
  --location canadacentral \
  --sku Standard_LRS

# Get SAS token
SAS_TOKEN=$(az storage container generate-sas \
  --account-name cloudstruccbackup \
  --name backups \
  --permissions rwdl \
  --expiry 2027-01-01 -o tsv)

# Create backup
az webapp config backup create \
  --resource-group cloudstrucc-rg \
  --webapp-name api-cloudstrucc-unique \
  --backup-name "backup-$(date +%Y%m%d)" \
  --container-url "https://cloudstruccbackup.blob.core.windows.net/backups?$SAS_TOKEN"

# Backup MongoDB
mongoexport --uri="your-cosmos-connection-string" \
  --db diagram-generator \
  --collection diagrams \
  --out backup-diagrams.json
```

## Cost Optimization

### Current Cost Breakdown

| Resource | SKU | Monthly Cost |
|----------|-----|--------------|
| App Service Plan (B1) | Basic | ~$13 |
| Cosmos DB for MongoDB | Serverless | ~$25 |
| Container Registry | Basic | ~$5 |
| SSL Certificates | Managed | Free |
| **Total** | | **~$43/month** |

### Optimization Strategies

#### 1. Use Free Tier for Development

```bash
# Create free tier plan
az appservice plan create \
  --name cloudstrucc-dev-plan \
  --resource-group cloudstrucc-dev-rg \
  --sku F1 \
  --is-linux

# Note: Free tier limitations:
# - 60 CPU minutes/day
# - 1 GB RAM
# - No custom domains
# - No SSL
```

#### 2. Use Shared Cosmos DB

```bash
# Use one Cosmos DB instance for multiple databases
MONGODB_URI=mongodb://cloudstrucc-mongodb.../diagram-generator
WEBAPP_MONGODB_URI=mongodb://cloudstrucc-mongodb.../diagram-generator-web
```

#### 3. Stop/Start Apps During Off-Hours

```bash
# Stop apps (no compute charges)
az webapp stop --name api-cloudstrucc-unique --resource-group cloudstrucc-rg
az webapp stop --name webapp-cloudstrucc-unique --resource-group cloudstrucc-rg

# Start apps
az webapp start --name api-cloudstrucc-unique --resource-group cloudstrucc-rg
az webapp start --name webapp-cloudstrucc-unique --resource-group cloudstrucc-rg
```

#### 4. Use Provisioned Throughput for Cosmos DB

For predictable workloads, provisioned throughput is cheaper than serverless:

```bash
# Switch to provisioned (400 RU/s minimum)
az cosmosdb mongodb database throughput update \
  --account-name cloudstrucc-mongodb \
  --resource-group cloudstrucc-rg \
  --name diagram-generator \
  --throughput 400
```

## Security Best Practices

### 1. Rotate Secrets Regularly

```bash
# Generate new secrets
NEW_JWT_SECRET=$(openssl rand -base64 32)
NEW_SESSION_SECRET=$(openssl rand -base64 32)

# Update in Azure Portal → Configuration
# Update both API and Webapp
```

### 2. Restrict Network Access

```bash
# Enable VNET integration
az webapp vnet-integration add \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  --vnet MyVNet \
  --subnet MySubnet

# Configure Cosmos DB firewall
az cosmosdb network-rule add \
  --resource-group cloudstrucc-rg \
  --name cloudstrucc-mongodb \
  --virtual-network MyVNet \
  --subnet MySubnet
```

### 3. Use Managed Identities

```bash
# Enable managed identity
az webapp identity assign \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg

# Grant ACR access
PRINCIPAL_ID=$(az webapp identity show \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  --query principalId -o tsv)

az role assignment create \
  --assignee $PRINCIPAL_ID \
  --role AcrPull \
  --scope /subscriptions/.../resourceGroups/cloudstrucc-rg/providers/Microsoft.ContainerRegistry/registries/cloudstruccacr
```

### 4. Enable HTTPS Only

```bash
az webapp update \
  --resource-group cloudstrucc-rg \
  --name api-cloudstrucc-unique \
  --https-only true

az webapp update \
  --resource-group cloudstrucc-rg \
  --name webapp-cloudstrucc-unique \
  --https-only true
```

## Support & Resources

### Official Documentation

- **Azure App Service**: https://docs.microsoft.com/azure/app-service/
- **Azure Container Registry**: https://docs.microsoft.com/azure/container-registry/
- **Cosmos DB**: https://docs.microsoft.com/azure/cosmos-db/
- **Docker**: https://docs.docker.com/

### Useful Commands

```bash
# View all resources
az resource list --resource-group cloudstrucc-rg --output table

# Check app status
az webapp show \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  --query state -o tsv

# Restart app
az webapp restart \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg

# Delete everything (careful!)
az group delete --name cloudstrucc-rg --yes --no-wait
```

### Getting Help

1. Check logs first: `az webapp log tail`
2. Review this documentation
3. Check Azure Service Health: https://status.azure.com
4. Contact support: support@cloudstrucc.com

---

**Last Updated:** January 27, 2026  
**Version:** 2.0 (Docker Deployment)  
**Maintained by:** CloudStrucc Inc.