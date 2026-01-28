const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    apiKey: 'test-key',
    tier: 'free',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 2592000
  },
  'your-super-secret-jwt-key-change-this-in-production'
);

console.log(token);
