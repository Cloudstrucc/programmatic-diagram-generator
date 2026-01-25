# Extract the archive
tar -xzf diagram-api-with-drawio.tar.gz
cd diagram-api

# Already have it running? Just restart
npm restart

# Test templates
curl http://localhost:3000/api/diagram/templates -H "X-API-Key: test-key"

# Run examples
node client-example-drawio.js