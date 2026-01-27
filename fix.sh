# Get MongoDB connection string
MONGODB_CONNECTION_STRING=$(az cosmosdb keys list \
  --name cloudstrucc-mongodb \
  --resource-group cloudstrucc-rg \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" -o tsv)

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name cloudstruccacr --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name cloudstruccacr --query "passwords[0].value" -o tsv)

# Generate secrets
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Set API environment variables (all at once)
az webapp config appsettings set \
  --resource-group cloudstrucc-rg \
  --name api-cloudstrucc-unique \
  --settings \
    "NODE_ENV=production" \
    "ANTHROPIC_API_KEY=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" \
    "JWT_SECRET=$JWT_SECRET" \
    "MONGODB_URI=$MONGODB_CONNECTION_STRING" \
    "WEBSITES_PORT=3000" \
    "DOCKER_REGISTRY_SERVER_URL=https://cloudstruccacr.azurecr.io" \
    "DOCKER_REGISTRY_SERVER_USERNAME=$ACR_USERNAME" \
    "DOCKER_REGISTRY_SERVER_PASSWORD=$ACR_PASSWORD"

# Set Webapp environment variables (all at once)
az webapp config appsettings set \
  --resource-group cloudstrucc-rg \
  --name webapp-cloudstrucc-unique \
  --settings \
    "NODE_ENV=production" \
    "API_URL=https://api-cloudstrucc-unique.azurewebsites.net" \
    "API_JWT_SECRET=$JWT_SECRET" \
    "MONGODB_URI=${MONGODB_CONNECTION_STRING}/diagram-generator-web" \
    "SESSION_SECRET=$SESSION_SECRET" \
    "WEBSITES_PORT=3001" \
    "DOCKER_REGISTRY_SERVER_URL=https://cloudstruccacr.azurecr.io" \
    "DOCKER_REGISTRY_SERVER_USERNAME=$ACR_USERNAME" \
    "DOCKER_REGISTRY_SERVER_PASSWORD=$ACR_PASSWORD"

# Restart both
az webapp restart --resource-group cloudstrucc-rg --name api-cloudstrucc-unique
az webapp restart --resource-group cloudstrucc-rg --name webapp-cloudstrucc-unique