require('dotenv').config();
const axios = require('axios');
const http = require('http');

const API_URL = 'http://localhost:8080';
const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL;
const DEVELOPER_PASSWORD = process.env.DEVELOPER_PASSWORD;

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

// Helper function to make HTTP requests
function makeRequest(path, method, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: `/api/auth/${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testDeveloperAuth() {
  console.log('Testing Developer Authentication');
  console.log('===============================');
  console.log('Using credentials:');
  console.log('Email:', DEVELOPER_EMAIL);
  console.log('Password:', DEVELOPER_PASSWORD);
  console.log('API URL:', API_URL);
  
  try {
    console.log('\nAttempting login...');
    const response = await axios.post(`${API_URL}/api/auth/developer/login`, {
      email: DEVELOPER_EMAIL,
      password: DEVELOPER_PASSWORD
    });
    
    console.log('\n✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Test protected route
    console.log('\nTesting protected route...');
    const systemResponse = await axios.get(`${API_URL}/api/developer/system`, {
      headers: { Authorization: `Bearer ${response.data.token}` }
    });
    
    console.log('\n✅ Protected route access successful!');
    console.log('System Data:', JSON.stringify(systemResponse.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
  }
}

async function runTests() {
  console.log('Starting authentication tests...');
  console.log('API URL:', API_URL);
  console.log('Test user:', testUser);
  
  try {
    // Test registration
    console.log('\nTesting registration...');
    const registerResponse = await makeRequest('register', 'POST', testUser);
    console.log('Registration response:', registerResponse);
    
    if (registerResponse.statusCode === 201) {
      console.log('✅ Registration successful');
    } else {
      console.log('❌ Registration failed');
    }

    // Test login with correct credentials
    console.log('\nTesting login with correct credentials...');
    const loginResponse = await makeRequest('login', 'POST', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login response:', loginResponse);
    
    if (loginResponse.statusCode === 200) {
      console.log('✅ Login successful');
    } else {
      console.log('❌ Login failed');
    }

    // Test login with incorrect password
    console.log('\nTesting login with incorrect password...');
    const failedLoginResponse = await makeRequest('login', 'POST', {
      email: testUser.email,
      password: 'wrongpassword'
    });
    console.log('Failed login response:', failedLoginResponse);
    
    if (failedLoginResponse.statusCode === 401) {
      console.log('✅ Invalid credentials properly rejected');
    } else {
      console.log('❌ Invalid credentials test failed');
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testDeveloperAuth();
runTests(); 