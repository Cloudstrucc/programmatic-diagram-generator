#!/bin/bash
###############################################################################
# CloudStrucc Diagram Generator - Azure Deployment Script (Docker Version)
# Usage: ./deploy-docker.sh [init|update|logs|restart|build]
###############################################################################

#------------------------------------------------------------------------------
# CONFIGURATION - EDIT THESE VARIABLES
#------------------------------------------------------------------------------

# Azure Configuration
SUBSCRIPTION_ID="7719c366-5f64-439a-a6c6-65067d5a97e4"
ACR_NAME="cloudstruccacr123APIapp"
RESOURCE_GROUP="cloudstrucc-rg"
LOCATION="eastus"
APP_SERVICE_PLAN="cloudstrucc-plan"
APP_SERVICE_SKU="B1"  # B1, B2, B3, S1, S2, S3, P1V2, P2V2, P3V2

# Container Registry
ACR_NAME="cloudstruccacr"  # Must be globally unique, lowercase, no hyphens
ACR_SKU="Basic"  # Basic, Standard, Premium

# App Names (must be globally unique)
API_APP_NAME="api-cloudstrucc-unique"
WEBAPP_APP_NAME="webapp-cloudstrucc-unique"

# Database Configuration
MONGODB_NAME="cloudstrucc-mongodb"
MONGODB_SKU="serverless"  # serverless or provisioned

# Custom Domains (leave empty if not using custom domains)
API_CUSTOM_DOMAIN="api.cloudstrucc.com"
WEBAPP_CUSTOM_DOMAIN="app.cloudstrucc.com"

# Environment Variables - CHANGE THESE!
ANTHROPIC_API_KEY="sk-ant-your-key-here"
JWT_SECRET="$(openssl rand -base64 32)"
SESSION_SECRET="$(openssl rand -base64 32)"

# Local Repository Path
REPO_PATH="$HOME/repos/programmatic-diagram-generator"

# Docker Image Tags
API_IMAGE_TAG="latest"
WEBAPP_IMAGE_TAG="latest"

#------------------------------------------------------------------------------
# DO NOT EDIT BELOW THIS LINE
#------------------------------------------------------------------------------

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() { echo -e "${BLUE}ℹ ${NC}$1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }

#------------------------------------------------------------------------------
# Check Prerequisites
#------------------------------------------------------------------------------
check_prerequisites() {
    info "Checking prerequisites..."
    
    # Check Azure CLI
    if ! command -v az &> /dev/null; then
        error "Azure CLI not found. Install with: brew install azure-cli"
    fi
    success "Azure CLI found"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker not found. Install from: https://www.docker.com/products/docker-desktop"
    fi
    success "Docker found"
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        error "Docker is not running. Start Docker Desktop."
    fi
    success "Docker is running"
    
    # Check if logged in
    if ! az account show &> /dev/null; then
        error "Not logged in to Azure. Run: az login"
    fi
    success "Logged in to Azure"
    
    # Set subscription
    az account set --subscription "$SUBSCRIPTION_ID" || error "Failed to set subscription"
    success "Subscription set: $SUBSCRIPTION_ID"
    
    # Check repository
    if [ ! -d "$REPO_PATH" ]; then
        error "Repository not found at: $REPO_PATH"
    fi
    success "Repository found"
}

#------------------------------------------------------------------------------
# Create Container Registry
#------------------------------------------------------------------------------
create_container_registry() {
    info "Creating Azure Container Registry: $ACR_NAME"
    
    # Check if ACR exists
    if az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        success "Container Registry already exists"
        return
    fi
    
    az acr create \
        --name "$ACR_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --sku "$ACR_SKU" \
        --admin-enabled true \
        --output none
    
    success "Container Registry created"
}

#------------------------------------------------------------------------------
# Build and Push Docker Images
#------------------------------------------------------------------------------
build_and_push_images() {
    info "Building and pushing Docker images..."
    
    # Login to ACR
    info "Logging in to Azure Container Registry..."
    az acr login --name "$ACR_NAME" || error "Failed to login to ACR"
    success "Logged in to ACR"
    
    ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query loginServer -o tsv)
    
    # Build and push API image
    info "Building API Docker image..."
    cd "$REPO_PATH/api" || error "API directory not found"
    
    docker build -t "$ACR_LOGIN_SERVER/api:$API_IMAGE_TAG" -f Dockerfile . || error "Failed to build API image"
    success "API image built"
    
    info "Pushing API image to registry..."
    docker push "$ACR_LOGIN_SERVER/api:$API_IMAGE_TAG" || error "Failed to push API image"
    success "API image pushed"
    
    # Build and push Webapp image
    info "Building Webapp Docker image..."
    cd "$REPO_PATH/webapp-frontend" || error "Webapp directory not found"
    
    docker build -t "$ACR_LOGIN_SERVER/webapp:$WEBAPP_IMAGE_TAG" -f Dockerfile . || error "Failed to build Webapp image"
    success "Webapp image built"
    
    info "Pushing Webapp image to registry..."
    docker push "$ACR_LOGIN_SERVER/webapp:$WEBAPP_IMAGE_TAG" || error "Failed to push Webapp image"
    success "Webapp image pushed"
    
    cd "$REPO_PATH"
}

#------------------------------------------------------------------------------
# Initialize Azure Resources
#------------------------------------------------------------------------------
init_azure_resources() {
    info "Creating Azure resources..."
    
    # Create Resource Group
    info "Creating resource group: $RESOURCE_GROUP"
    az group create \
        --name "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --output none
    success "Resource group created"
    
    # Create Container Registry
    create_container_registry
    
    # Create App Service Plan
    info "Creating App Service Plan: $APP_SERVICE_PLAN"
    az appservice plan create \
        --name "$APP_SERVICE_PLAN" \
        --resource-group "$RESOURCE_GROUP" \
        --is-linux \
        --sku "$APP_SERVICE_SKU" \
        --output none
    success "App Service Plan created"
    
    # Create MongoDB (Cosmos DB)
    info "Creating MongoDB (Cosmos DB): $MONGODB_NAME (this takes 5-10 minutes)"
    az cosmosdb create \
        --name "$MONGODB_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --kind MongoDB \
        --server-version 4.2 \
        --default-consistency-level Session \
        --locations regionName="$LOCATION" \
        --output none
    success "MongoDB created"
    
    # Get ACR credentials
    ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --query username -o tsv)
    ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query "passwords[0].value" -o tsv)
    ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query loginServer -o tsv)
    
    # Create API App with container
    info "Creating API App Service: $API_APP_NAME"
    az webapp create \
        --resource-group "$RESOURCE_GROUP" \
        --plan "$APP_SERVICE_PLAN" \
        --name "$API_APP_NAME" \
        --deployment-container-image-name "$ACR_LOGIN_SERVER/api:$API_IMAGE_TAG" \
        --docker-registry-server-user "$ACR_USERNAME" \
        --docker-registry-server-password "$ACR_PASSWORD" \
        --output none
    success "API App Service created"
    
    # Create Webapp App with container
    info "Creating Webapp App Service: $WEBAPP_APP_NAME"
    az webapp create \
        --resource-group "$RESOURCE_GROUP" \
        --plan "$APP_SERVICE_PLAN" \
        --name "$WEBAPP_APP_NAME" \
        --deployment-container-image-name "$ACR_LOGIN_SERVER/webapp:$WEBAPP_IMAGE_TAG" \
        --docker-registry-server-user "$ACR_USERNAME" \
        --docker-registry-server-password "$ACR_PASSWORD" \
        --output none
    success "Webapp App Service created"
    
    success "All Azure resources created!"
}

#------------------------------------------------------------------------------
# Configure Environment Variables
#------------------------------------------------------------------------------
configure_environment() {
    info "Configuring environment variables..."
    
    # Get MongoDB connection string
    info "Retrieving MongoDB connection string..."
    MONGODB_CONNECTION_STRING=$(az cosmosdb keys list \
        --name "$MONGODB_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --type connection-strings \
        --query "connectionStrings[0].connectionString" -o tsv)
    
    if [ -z "$MONGODB_CONNECTION_STRING" ]; then
        error "Failed to retrieve MongoDB connection string"
    fi
    success "MongoDB connection string retrieved"
    
    ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query loginServer -o tsv)
    
    # Configure API environment
    info "Setting API environment variables..."
    az webapp config appsettings set \
        --resource-group "$RESOURCE_GROUP" \
        --name "$API_APP_NAME" \
        --settings \
            NODE_ENV=production \
            ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
            JWT_SECRET="$JWT_SECRET" \
            MONGODB_URI="$MONGODB_CONNECTION_STRING" \
            WEBSITES_PORT=3000 \
            DOCKER_REGISTRY_SERVER_URL="https://$ACR_LOGIN_SERVER" \
        --output none
    success "API environment configured"
    
    # Configure Webapp environment
    info "Setting Webapp environment variables..."
    WEBAPP_MONGODB_URI="${MONGODB_CONNECTION_STRING}/diagram-generator-web"
    API_URL="https://${API_APP_NAME}.azurewebsites.net"
    
    if [ -n "$API_CUSTOM_DOMAIN" ]; then
        API_URL="https://${API_CUSTOM_DOMAIN}"
    fi
    
    az webapp config appsettings set \
        --resource-group "$RESOURCE_GROUP" \
        --name "$WEBAPP_APP_NAME" \
        --settings \
            NODE_ENV=production \
            API_URL="$API_URL" \
            API_JWT_SECRET="$JWT_SECRET" \
            MONGODB_URI="$WEBAPP_MONGODB_URI" \
            SESSION_SECRET="$SESSION_SECRET" \
            WEBSITES_PORT=3001 \
            DOCKER_REGISTRY_SERVER_URL="https://$ACR_LOGIN_SERVER" \
        --output none
    success "Webapp environment configured"
    
    # Enable continuous deployment from ACR
    az webapp deployment container config \
        --name "$API_APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --enable-cd true \
        --output none
    
    az webapp deployment container config \
        --name "$WEBAPP_APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --enable-cd true \
        --output none
    
    success "Continuous deployment enabled"
}

#------------------------------------------------------------------------------
# Configure Custom Domains
#------------------------------------------------------------------------------
configure_domains() {
    if [ -z "$API_CUSTOM_DOMAIN" ] && [ -z "$WEBAPP_CUSTOM_DOMAIN" ]; then
        warning "No custom domains configured. Skipping domain setup."
        return
    fi
    
    info "Configuring custom domains..."
    
    # Get domain verification ID
    VERIFICATION_ID=$(az webapp show \
        --resource-group "$RESOURCE_GROUP" \
        --name "$WEBAPP_APP_NAME" \
        --query customDomainVerificationId -o tsv)
    
    echo ""
    warning "===================================================================="
    warning "MANUAL STEP REQUIRED: Configure DNS Records"
    warning "===================================================================="
    echo ""
    echo "Add these DNS records in your domain registrar:"
    echo ""
    
    if [ -n "$API_CUSTOM_DOMAIN" ]; then
        echo "For API ($API_CUSTOM_DOMAIN):"
        echo "  Type: CNAME"
        echo "  Name: api (or appropriate subdomain)"
        echo "  Value: ${API_APP_NAME}.azurewebsites.net"
        echo "  TTL: 3600"
        echo ""
    fi
    
    if [ -n "$WEBAPP_CUSTOM_DOMAIN" ]; then
        echo "For Webapp ($WEBAPP_CUSTOM_DOMAIN):"
        echo "  Type: CNAME"
        echo "  Name: app (or @ for root)"
        echo "  Value: ${WEBAPP_APP_NAME}.azurewebsites.net"
        echo "  TTL: 3600"
        echo ""
        echo "Domain Verification TXT Record:"
        echo "  Type: TXT"
        echo "  Name: asuid.app (or asuid)"
        echo "  Value: $VERIFICATION_ID"
        echo "  TTL: 3600"
        echo ""
    fi
    
    echo -n "Press Enter after DNS records are added to continue..."
    read
    
    # Add custom domains
    if [ -n "$API_CUSTOM_DOMAIN" ]; then
        info "Adding custom domain to API: $API_CUSTOM_DOMAIN"
        az webapp config hostname add \
            --resource-group "$RESOURCE_GROUP" \
            --webapp-name "$API_APP_NAME" \
            --hostname "$API_CUSTOM_DOMAIN" \
            --output none || warning "Failed to add API custom domain. Verify DNS is propagated."
    fi
    
    if [ -n "$WEBAPP_CUSTOM_DOMAIN" ]; then
        info "Adding custom domain to Webapp: $WEBAPP_CUSTOM_DOMAIN"
        az webapp config hostname add \
            --resource-group "$RESOURCE_GROUP" \
            --webapp-name "$WEBAPP_APP_NAME" \
            --hostname "$WEBAPP_CUSTOM_DOMAIN" \
            --output none || warning "Failed to add Webapp custom domain. Verify DNS is propagated."
    fi
    
    # Enable SSL
    info "Enabling SSL certificates (this may take a few minutes)..."
    
    if [ -n "$API_CUSTOM_DOMAIN" ]; then
        az webapp config ssl bind \
            --resource-group "$RESOURCE_GROUP" \
            --name "$API_APP_NAME" \
            --certificate-thumbprint auto \
            --ssl-type SNI \
            --output none || warning "SSL binding failed for API. Try manually in portal."
    fi
    
    if [ -n "$WEBAPP_CUSTOM_DOMAIN" ]; then
        az webapp config ssl bind \
            --resource-group "$RESOURCE_GROUP" \
            --name "$WEBAPP_APP_NAME" \
            --certificate-thumbprint auto \
            --ssl-type SNI \
            --output none || warning "SSL binding failed for Webapp. Try manually in portal."
    fi
    
    # Enforce HTTPS
    az webapp update \
        --resource-group "$RESOURCE_GROUP" \
        --name "$API_APP_NAME" \
        --https-only true \
        --output none
    
    az webapp update \
        --resource-group "$RESOURCE_GROUP" \
        --name "$WEBAPP_APP_NAME" \
        --https-only true \
        --output none
    
    success "Custom domains configured!"
}

#------------------------------------------------------------------------------
# Update Deployment
#------------------------------------------------------------------------------
update_deployment() {
    info "Updating deployment..."
    build_and_push_images
    
    # Restart apps to pull new images
    info "Restarting applications..."
    az webapp restart \
        --resource-group "$RESOURCE_GROUP" \
        --name "$API_APP_NAME" \
        --output none
    
    az webapp restart \
        --resource-group "$RESOURCE_GROUP" \
        --name "$WEBAPP_APP_NAME" \
        --output none
    
    success "Deployment updated!"
}

#------------------------------------------------------------------------------
# Show URLs
#------------------------------------------------------------------------------
show_urls() {
    echo ""
    success "===================================================================="
    success "DEPLOYMENT COMPLETE!"
    success "===================================================================="
    echo ""
    echo "Your applications are deployed at:"
    echo ""
    echo "API:"
    echo "  Default: https://${API_APP_NAME}.azurewebsites.net"
    if [ -n "$API_CUSTOM_DOMAIN" ]; then
        echo "  Custom:  https://${API_CUSTOM_DOMAIN}"
    fi
    echo ""
    echo "Webapp:"
    echo "  Default: https://${WEBAPP_APP_NAME}.azurewebsites.net"
    if [ -n "$WEBAPP_CUSTOM_DOMAIN" ]; then
        echo "  Custom:  https://${WEBAPP_CUSTOM_DOMAIN}"
    fi
    echo ""
    echo "Test your deployment:"
    echo "  curl https://${API_APP_NAME}.azurewebsites.net/health"
    echo ""
    echo "View logs:"
    echo "  ./deploy-docker.sh logs"
    echo ""
    echo "Update deployment:"
    echo "  ./deploy-docker.sh update"
    echo ""
}

#------------------------------------------------------------------------------
# View Logs
#------------------------------------------------------------------------------
view_logs() {
    echo "Select app to view logs:"
    echo "  1) API"
    echo "  2) Webapp"
    read -p "Choice: " choice
    
    case $choice in
        1)
            info "Streaming API logs (Ctrl+C to exit)..."
            az webapp log tail \
                --resource-group "$RESOURCE_GROUP" \
                --name "$API_APP_NAME"
            ;;
        2)
            info "Streaming Webapp logs (Ctrl+C to exit)..."
            az webapp log tail \
                --resource-group "$RESOURCE_GROUP" \
                --name "$WEBAPP_APP_NAME"
            ;;
        *)
            error "Invalid choice"
            ;;
    esac
}

#------------------------------------------------------------------------------
# Restart Apps
#------------------------------------------------------------------------------
restart_apps() {
    info "Restarting applications..."
    
    az webapp restart \
        --resource-group "$RESOURCE_GROUP" \
        --name "$API_APP_NAME" \
        --output none
    
    az webapp restart \
        --resource-group "$RESOURCE_GROUP" \
        --name "$WEBAPP_APP_NAME" \
        --output none
    
    success "Apps restarted"
}

#------------------------------------------------------------------------------
# Main Script
#------------------------------------------------------------------------------
main() {
    echo ""
    echo "======================================================================"
    echo "  CloudStrucc Diagram Generator - Azure Deployment (Docker)"
    echo "======================================================================"
    echo ""
    
    case "${1:-init}" in
        init)
            check_prerequisites
            build_and_push_images
            init_azure_resources
            configure_environment
            configure_domains
            show_urls
            ;;
        
        update)
            check_prerequisites
            update_deployment
            show_urls
            ;;
        
        build)
            check_prerequisites
            build_and_push_images
            ;;
        
        logs)
            view_logs
            ;;
        
        restart)
            restart_apps
            ;;
        
        *)
            echo "Usage: $0 [init|update|build|logs|restart]"
            echo ""
            echo "Commands:"
            echo "  init    - Initial deployment (creates all resources)"
            echo "  update  - Update containers (rebuild & redeploy)"
            echo "  build   - Build and push Docker images only"
            echo "  logs    - View application logs"
            echo "  restart - Restart applications"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
