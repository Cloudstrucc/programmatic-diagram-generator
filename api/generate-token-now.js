#!/usr/bin/env node
import jwt from 'jsonwebtoken';

// This matches the default in config.js
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

const token = jwt.sign(
  {
    apiKey: 'test-key',
    tier: 'free',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) // 30 days
  },
  JWT_SECRET
);

console.log('\n✅ NEW JWT TOKEN:\n');
console.log(token);
console.log('\n📋 SAVE IT:\n');
console.log(`echo "${token}" > .jwt-token`);
console.log('\n🧪 TEST IT:\n');
console.log(`curl http://localhost:3000/api/diagram/templates -H "Authorization: Bearer ${token}"`);
console.log('\n');