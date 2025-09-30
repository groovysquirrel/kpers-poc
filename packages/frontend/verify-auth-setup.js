/**
 * Authentication Setup Verification Script
 * 
 * Run this script to verify your authentication configuration is correct:
 * node verify-auth-setup.js
 */

// Check environment variables
console.log('🔍 Checking Authentication Configuration...\n');

const envVars = {
  'VITE_REGION': process.env.VITE_REGION,
  'VITE_API_URL': process.env.VITE_API_URL,
  'VITE_USER_POOL_ID': process.env.VITE_USER_POOL_ID,
  'VITE_USER_POOL_CLIENT_ID': process.env.VITE_USER_POOL_CLIENT_ID,
  'VITE_IDENTITY_POOL_ID': process.env.VITE_IDENTITY_POOL_ID,
};

let allSet = true;

console.log('📋 Environment Variables:');
console.log('─'.repeat(60));

for (const [key, value] of Object.entries(envVars)) {
  const status = value ? '✅' : '❌';
  const displayValue = value || 'NOT SET';
  console.log(`${status} ${key}: ${displayValue}`);
  if (!value) allSet = false;
}

console.log('─'.repeat(60));
console.log('');

if (!allSet) {
  console.log('❌ ERROR: Some environment variables are not set!\n');
  console.log('To fix this:');
  console.log('1. Run: sst env list');
  console.log('2. Copy the output values to your .env.local file');
  console.log('3. Restart your dev server\n');
  console.log('Example .env.local file:');
  console.log('─'.repeat(60));
  console.log('VITE_REGION=us-east-1');
  console.log('VITE_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com');
  console.log('VITE_USER_POOL_ID=us-east-1_xxxxx');
  console.log('VITE_USER_POOL_CLIENT_ID=xxxxx');
  console.log('VITE_IDENTITY_POOL_ID=us-east-1:xxxxx-xxxxx-xxxxx');
  console.log('─'.repeat(60));
  process.exit(1);
}

console.log('✅ All environment variables are set!\n');

// Validate format
console.log('🔍 Validating Format:');
console.log('─'.repeat(60));

const userPoolId = envVars.VITE_USER_POOL_ID;
const identityPoolId = envVars.VITE_IDENTITY_POOL_ID;
const apiUrl = envVars.VITE_API_URL;

const userPoolPattern = /^[a-z]+-[a-z]+-\d+_[a-zA-Z0-9]+$/;
const identityPoolPattern = /^[a-z]+-[a-z]+-\d+:[a-f0-9-]+$/;
const apiUrlPattern = /^https:\/\/.+\.execute-api\.[a-z]+-[a-z]+-\d+\.amazonaws\.com$/;

if (userPoolPattern.test(userPoolId)) {
  console.log('✅ User Pool ID format is valid');
} else {
  console.log('⚠️  User Pool ID format looks incorrect');
  console.log(`   Expected: us-east-1_abc123, Got: ${userPoolId}`);
}

if (identityPoolPattern.test(identityPoolId)) {
  console.log('✅ Identity Pool ID format is valid');
} else {
  console.log('⚠️  Identity Pool ID format looks incorrect');
  console.log(`   Expected: us-east-1:abc-123-def, Got: ${identityPoolId}`);
}

if (apiUrlPattern.test(apiUrl)) {
  console.log('✅ API URL format is valid');
} else {
  console.log('⚠️  API URL format looks incorrect');
  console.log(`   Expected: https://xxxxx.execute-api.us-east-1.amazonaws.com`);
  console.log(`   Got: ${apiUrl}`);
}

console.log('─'.repeat(60));
console.log('');

console.log('📝 Next Steps:');
console.log('─'.repeat(60));
console.log('1. Ensure you have a test user in Cognito User Pool');
console.log('   See: src/api/AUTHENTICATION.md for instructions');
console.log('');
console.log('2. Start the frontend dev server:');
console.log('   npm run dev');
console.log('');
console.log('3. Navigate to /login and sign in');
console.log('');
console.log('4. After login, check browser console:');
console.log('   Auth.currentSession() - should return session object');
console.log('');
console.log('5. Navigate to /managers to test API calls');
console.log('─'.repeat(60));
console.log('');
console.log('✨ Setup verification complete!');

