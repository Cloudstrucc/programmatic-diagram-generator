#!/bin/bash
# Quick JWT Token Generator (no dependencies)
# Uses HS256 algorithm

# Configuration
API_KEY="${1:-test-key}"
TIER="${2:-free}"
SECRET="${JWT_SECRET:-your-super-secret-jwt-key-change-this-in-production}"

# Get current timestamp
IAT=$(date +%s)
EXP=$((IAT + 2592000))  # 30 days

# Create JWT payload
HEADER='{"alg":"HS256","typ":"JWT"}'
PAYLOAD="{\"apiKey\":\"$API_KEY\",\"tier\":\"$TIER\",\"iat\":$IAT,\"exp\":$EXP}"

# Base64 encode
base64_encode() {
    echo -n "$1" | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n'
}

HEADER_B64=$(base64_encode "$HEADER")
PAYLOAD_B64=$(base64_encode "$PAYLOAD")

# Create signature
SIGNATURE=$(echo -n "${HEADER_B64}.${PAYLOAD_B64}" | openssl dgst -sha256 -hmac "$SECRET" -binary | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')

# Combine
TOKEN="${HEADER_B64}.${PAYLOAD_B64}.${SIGNATURE}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  JWT Token Generated                                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "API Key: $API_KEY"
echo "Tier: $TIER"
echo "Expires: $(date -r $EXP '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "TOKEN:"
echo "$TOKEN"
echo ""
echo "USAGE:"
echo "curl http://localhost:3000/api/diagram/templates \\"
echo "  -H \"Authorization: Bearer $TOKEN\""
echo ""
echo "SAVE TO FILE:"
echo "echo \"$TOKEN\" > .jwt-token"
echo ""