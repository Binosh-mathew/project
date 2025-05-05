require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL;
const DEVELOPER_PASSWORD = process.env.DEVELOPER_PASSWORD;

// Configure axios with timeout and error handling
axios.defaults.timeout = 5000; // 5 seconds timeout
axios.defaults.validateStatus = false; // Don't throw error on non-2xx status

async function testDevAuth() {
  console.log('🔍 Testing Developer Authentication');
  console.log('==================================');
  
  // 1. Check environment variables
  console.log('\n1. Checking environment variables:');
  console.log('API URL:', BASE_URL);
  console.log('Developer Email:', DEVELOPER_EMAIL);
  console.log('Developer Password:', DEVELOPER_PASSWORD ? '✅ Set' : '❌ Not set');
  console.log('JWT Secret:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
  
  // 2. Test basic connectivity
  console.log('\n2. Testing basic server connectivity:');
  
  // Test direct ping
  try {
    console.log('\nTesting direct ping...');
    const pingResponse = await axios.get(`${BASE_URL}/ping`, {
      timeout: 2000 // 2 seconds timeout for ping
    });
    console.log('Status Code:', pingResponse.status);
    console.log('✅ Ping successful');
    console.log('Response:', pingResponse.data);
  } catch (error) {
    console.error('❌ Ping failed');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }

  // Test health endpoint
  try {
    console.log('\nTesting health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('Status Code:', healthResponse.status);
    console.log('✅ Health check successful');
    console.log('Response:', healthResponse.data);
  } catch (error) {
    console.error('❌ Health check failed');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    return;
  }
  
  // 3. Test authentication endpoint
  console.log('\n3. Testing authentication endpoint:');
  try {
    const authUrl = `${BASE_URL}/api/auth/developer/login`;
    console.log('Making request to:', authUrl);
    console.log('With payload:', {
      email: DEVELOPER_EMAIL,
      password: DEVELOPER_PASSWORD
    });
    
    const response = await axios.post(authUrl, {
      email: DEVELOPER_EMAIL,
      password: DEVELOPER_PASSWORD
    });
    
    console.log('Status Code:', response.status);
    console.log('✅ Authentication successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // 4. Test protected route
    if (response.data.token) {
      console.log('\n4. Testing protected route access:');
      try {
        const protectedResponse = await axios.get(`${BASE_URL}/api/developer/system`, {
          headers: { Authorization: `Bearer ${response.data.token}` }
        });
        console.log('Status Code:', protectedResponse.status);
        console.log('✅ Protected route access successful');
        console.log('Response:', JSON.stringify(protectedResponse.data, null, 2));
      } catch (error) {
        console.error('❌ Protected route access failed');
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        if (error.code) console.error('Error code:', error.code);
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Response:', error.response.data);
        }
      }
    }
  } catch (error) {
    console.error('❌ Authentication failed');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
console.log('Starting tests...');
testDevAuth().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
}); 