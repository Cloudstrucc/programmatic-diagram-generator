# Restart to pull new image
az webapp restart \
  --name webapp-cloudstrucc-unique \
  --resource-group cloudstrucc-rg

# Wait for restart
sleep 10

# Check status
az webapp show \
  --name webapp-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  --query "state" -o tsv
# Should output: Running

# Watch logs
az webapp log tail \
  --name webapp-cloudstrucc-unique \
  --resource-group cloudstrucc-rg

# You should see:
# - MongoDB session store connected
# - Server running on port