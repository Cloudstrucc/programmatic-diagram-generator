# Restart to pull new image
az webapp restart \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg

# Wait a few seconds for restart
sleep 10

# Check if it's running
az webapp show \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg \
  --query "state" -o tsv
# Should output: Running

# Watch logs in real-time
az webapp log tail \
  --name api-cloudstrucc-unique \
  --resource-group cloudstrucc-rg

# You should see:
# - Container starting
# - MongoDB connected
# - Server running on port 3000