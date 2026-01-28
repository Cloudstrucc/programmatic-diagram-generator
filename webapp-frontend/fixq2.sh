# Generate new secret
NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Update webapp
echo "API_JWT_SECRET=$NEW_SECRET" >> .env

# Update API
az webapp config appsettings set \
  --resource-group cloudstrucc-rg \
  --name api-cloudstrucc-unique \
  --settings API_JWT_SECRET="$NEW_SECRET"

az webapp restart --resource-group cloudstrucc-rg --name api-cloudstrucc-unique