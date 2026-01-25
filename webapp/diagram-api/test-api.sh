#!/bin/bash

echo "🧪 Testing Diagram API..."
echo ""

echo "1️⃣ Health Check:"
curl -s http://localhost:3000/health | jq .
echo ""

echo "2️⃣ Get Templates:"
curl -s http://localhost:3000/api/diagram/templates \
  -H "Authorization: Bearer $(cat .jwt-token)" | jq .
echo ""

echo "3️⃣ Generate Diagram:"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/diagram/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat .jwt-token)" \
  -d '{
    "prompt": "Simple web app with database",
    "diagramType": "drawio",
    "templateType": "aws"
  }')
echo $RESPONSE | jq .
REQUEST_ID=$(echo $RESPONSE | jq -r '.requestId')
echo ""

echo "4️⃣ Check Status:"
sleep 2
curl -s http://localhost:3000/api/diagram/status/$REQUEST_ID \
  -H "Authorization: Bearer $(cat .jwt-token)" | jq .
echo ""

echo "5️⃣ Usage Stats:"
curl -s http://localhost:3000/api/diagram/usage \
  -H "Authorization: Bearer $(cat .jwt-token)" | jq .
echo ""

echo "✅ Tests complete!"
