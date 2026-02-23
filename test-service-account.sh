# Get the service key
SERVICE_KEY=$(az webapp config appsettings list \
  --name api-cloudstrucc-unique \
  --resource-group your-rg \
  --query "[?name=='SERVICE_ACCOUNT_KEY'].value" -o tsv)

# Test with valid service key
curl -X POST https://api-cloudstrucc-unique.azurewebsites.net/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "X-Service-Key: $SERVICE_KEY" \
  -d '{
    "prompt": "test diagram",
    "diagramType": "python",
    "format": "graphviz",
    "style": "azure",
    "quality": "simple"
  }'

# Expected response:
# {"success":true,"requestId":"req_...","position":1,...}