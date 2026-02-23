#!/bin/bash

# 1. Get MongoDB URI (replace with the output from above command)
MONGO_URI="mongodb://cloudstrucc-mongodb:REDACTED==@cloudstrucc-mongodb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@cloudstrucc-mongodb@"

# 2. Generate secrets
SERVICE_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

echo "Service Key: $SERVICE_KEY"
echo "JWT Secret: $JWT_SECRET"

# 3. Set API settings
az webapp config appsettings set \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  --settings \
    "MONGODB_URI=$MONGO_URI" \
    "JWT_SECRET=$JWT_SECRET" \
    "SERVICE_ACCOUNT_KEY=$SERVICE_KEY" \
    "NODE_ENV=production" \
    "WEBSITES_PORT=3000"

# 4. Set Webapp settings
az webapp config appsettings set \
  --name webapp-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  --settings \
    "MONGODB_URI=$MONGO_URI" \
    "SERVICE_ACCOUNT_KEY=$SERVICE_KEY" \
    "SESSION_SECRET=$SESSION_SECRET" \
    "API_URL=https://api-cloudstrucc-unique.azurewebsites.net" \
    "NODE_ENV=production" \
    "WEBSITES_PORT=3001"

echo "Settings configured!"