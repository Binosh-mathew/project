const crypto = require('crypto');

// Generate secure random secrets
const secrets = {
  JWT_SECRET: crypto.randomBytes(64).toString('hex'),
  JWT_REFRESH_SECRET: crypto.randomBytes(64).toString('hex'),
  CSRF_SECRET: crypto.randomBytes(32).toString('hex'),
  SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
  COOKIE_SECRET: crypto.randomBytes(32).toString('hex')
};

// Print the secrets in .env format
console.log('# Generated Secrets - Copy these to your .env file\n');
Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

// Print instructions
console.log('\nInstructions:');
console.log('1. Copy the above values into your .env file');
console.log('2. Keep these secrets secure and never share them');
console.log('3. Use different secrets for different environments (development, production)'); 