# Replace your-rg with your resource group name
az webapp config appsettings set \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  --settings SERVICE_ACCOUNT_KEY="$SERVICE_KEY"

# Verify it was set
az webapp config appsettings list \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  | grep SERVICE_ACCOUNT_KEY