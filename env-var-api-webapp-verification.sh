# Check API
echo "Checking API..."
az webapp config appsettings list \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  --query "[?name=='SERVICE_ACCOUNT_KEY'].value" -o tsv

# Check Webapp
echo "Checking Webapp..."
az webapp config appsettings list \
  --name webapp-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  --query "[?name=='SERVICE_ACCOUNT_KEY'].value" -o tsv

# Both should output the same key