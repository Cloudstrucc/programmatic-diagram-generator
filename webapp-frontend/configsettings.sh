# Set the webapp name (use the actual name from above)
WEBAPP_NAME="webapp-cloudstrucc-unique"  # Or whatever it is

# Get the service account key from API
SERVICE_KEY=$(az webapp config appsettings list \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  --query "[?name=='SERVICE_ACCOUNT_KEY'].value" -o tsv)

echo "Service key: ${SERVICE_KEY:0:20}..."

# Now set ALL the required webapp environment variables
az webapp config appsettings set \
  --name $WEBAPP_NAME \
  --resource-group cloudstrucc-rg \
  --settings \
    SERVICE_ACCOUNT_KEY="$SERVICE_KEY" \
    API_URL="https://api-cloudstrucc-unique.azurewebsites.net" \
    MONGODB_URI="mongodb://cloudstrucc-mongodb:REDACTED==@cloudstrucc-mongodb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@cloudstrucc-mongodb@" \
    SESSION_SECRET="$(openssl rand -hex 32)" \
    NODE_ENV="production" \
    WEBSITES_PORT="3001"    # 1. Set variables
WEBAPP_NAME="webapp-cloudstrucc-unique"  # ⚠️ Replace with actual name
MONGO_URI="your-mongodb-connection-string"  # ⚠️ Replace with your MongoDB URI

# 2. Get service key from API
SERVICE_KEY=$(az webapp config appsettings list \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  --query "[?name=='SERVICE_ACCOUNT_KEY'].value" -o tsv)

# 3. Generate session secret
SESSION_SECRET=$(openssl rand -hex 32)

# 4. Set all settings at once
az webapp config appsettings set \
  --name $WEBAPP_NAME \
  --resource-group cloudstrucc-rg \
  --settings \
    SERVICE_ACCOUNT_KEY="$SERVICE_KEY" \
    API_URL="https://api-cloudstrucc-unique.azurewebsites.net" \
    MONGODB_URI="$MONGO_URI" \
    SESSION_SECRET="$SESSION_SECRET" \
    NODE_ENV="production" \
    WEBSITES_PORT="3001"

# 5. Verify settings were saved
az webapp config appsettings list \
  --name $WEBAPP_NAME \
  --resource-group cloudstrucc-rg \
  --query "[].{Name:name, HasValue:value != null}" -o table