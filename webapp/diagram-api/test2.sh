# Save it
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlLZXkiOiJ0ZXN0LWtleSIsInRpZXIiOiJmcmVlIiwiaWF0IjoxNzY5MzQyODUwLCJleHAiOjE3NzE5MzQ4NTB9.6m-f8tPBXplNP6Nmtk5Lnbzgx3Urj5AqQEAK1fIiI2s" > .jwt-token

# Test templates
curl http://localhost:3000/api/diagram/templates \
  -H "Authorization: Bearer $(cat .jwt-token)"

# Generate a diagram
curl -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat .jwt-token)" \
  -d '{
    "prompt": "3-tier web application with load balancer, web servers, and database",
    "diagramType": "drawio",
    "templateType": "aws"
  }'

# Check usage
curl http://localhost:3000/api/diagram/usage \
  -H "Authorization: Bearer $(cat .jwt-token)"