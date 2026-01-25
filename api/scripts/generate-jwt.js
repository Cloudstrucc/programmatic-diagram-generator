#!/usr/bin/env node
/**
 * JWT Token Generator for Diagram API
 * 
 * Generates JWT tokens for testing the diagram API server
 * 
 * Usage:
 *   node generate-jwt.js
 *   node generate-jwt.js <api-key>
 *   node generate-jwt.js <api-key> <tier>
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Your JWT secret (should match server.js)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Get API key and tier from command line or use defaults
const apiKey = process.argv[2] || 'test-key';
const tier = process.argv[3] || 'free';

// Token payload
const payload = {
  apiKey: apiKey,
  tier: tier,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) // 30 days
};

// Generate token
const token = jwt.sign(payload, JWT_SECRET);

console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  JWT Token Generated                                       ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
console.log('API Key:', apiKey);
console.log('Tier:', tier);
console.log('Expires:', new Date(payload.exp * 1000).toISOString());
console.log('');
console.log('TOKEN:');
console.log(token);
console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Usage Examples                                            ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
console.log('# Get templates');
console.log(`curl http://localhost:3000/api/diagram/templates \\`);
console.log(`  -H "Authorization: Bearer ${token}"`);
console.log('');
console.log('# Generate diagram');
console.log('curl -X POST http://localhost:3000/api/diagram/generate \\');
console.log('  -H "Content-Type: application/json" \\');
console.log(`  -H "Authorization: Bearer ${token}" \\`);
console.log('  -d \'{"prompt":"web app","diagramType":"drawio","templateType":"aws"}\'');
console.log('');
console.log('# Check usage');
console.log(`curl http://localhost:3000/api/diagram/usage \\`);
console.log(`  -H "Authorization: Bearer ${token}"`);
console.log('');
console.log('# Save token to file for easy reuse');
console.log(`echo "${token}" > .jwt-token`);
console.log('');
console.log('# Use saved token');
console.log('curl http://localhost:3000/api/diagram/templates \\');
console.log('  -H "Authorization: Bearer $(cat .jwt-token)"');
console.log('');