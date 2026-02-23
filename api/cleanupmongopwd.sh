# Get the raw connection string from Cosmos DB
RAW_CONN=$(az cosmosdb keys list \
  --name cloudstrucc-mongodb \
  --resource-group cloudstrucc-rg \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" -o tsv)

# URL-encode the password (the part between : and @ after the username)
ENCODED_CONN=$(python3 -c "
import re, urllib.parse
cs = '''$RAW_CONN'''
match = re.match(r'(mongodb://[^:]+:)([^@]+)(@.+)', cs)
if match:
    print(match.group(1) + urllib.parse.quote_plus(match.group(2)) + match.group(3))
else:
    print(cs)
")

# Update the API app setting
az webapp config appsettings set \
  --resource-group cloudstrucc-rg \
  --name api-cloudstrucc-unique \
  --settings MONGODB_URI="$ENCODED_CONN" \
  --output none

# Do the same for the webapp (with /diagram-generator-web DB name)
az webapp config appsettings set \
  --resource-group cloudstrucc-rg \
  --name webapp-cloudstrucc-unique \
  --settings MONGODB_URI="${ENCODED_CONN}/diagram-generator-web" \
  --output none

# Restart both
az webapp restart --resource-group cloudstrucc-rg --name api-cloudstrucc-unique
az webapp restart --resource-group cloudstrucc-rg --name webapp-cloudstrucc-unique