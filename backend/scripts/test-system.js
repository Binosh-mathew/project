require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Store = require('../models/Store');
const Order = require('../models/Order');
const runSystemCheck = require('../utils/systemCheck');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL;
const DEVELOPER_PASSWORD = process.env.DEVELOPER_PASSWORD;

let developerToken = '';

async function getDeveloperToken() {
  console.log('\n🔑 Getting Developer Token...');
  console.log('Using credentials:');
  console.log('Email:', DEVELOPER_EMAIL);
  console.log('Password:', DEVELOPER_PASSWORD);
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/developer/login`, {
      email: DEVELOPER_EMAIL,
      password: DEVELOPER_PASSWORD
    });
    console.log('✅ Developer authentication successful');
    return response.data.token;
  } catch (error) {
    console.error('❌ Developer authentication failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

async function testHealthEndpoint() {
  console.log('\n🔍 Testing Health Endpoint...');
  try {
    console.log('Making request to:', `${BASE_URL}/health`);
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed');
    console.log('Status:', response.data.status);
    console.log('Details:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Health check failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

async function testSystemCheck() {
  console.log('\n🔍 Running System Check...');
  try {
    const results = await runSystemCheck();
    console.log('✅ System check passed');
    console.log('System Status:', JSON.stringify(results, null, 2));
    return true;
  } catch (error) {
    console.error('❌ System check failed');
    console.error('Error:', error.message);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
    return false;
  }
}

async function testDatabaseOperations() {
  console.log('\n🔍 Testing Database Operations...');
  try {
    // Test database connection
    const dbState = mongoose.connection.readyState;
    console.log('Database Connection State:', dbState === 1 ? '✅ Connected' : '❌ Disconnected');

    // Create test store
    console.log('\nCreating test store...');
    const testStore = await Store.create({
      name: 'Test Store',
      location: 'Test Location',
      status: 'active',
      operatingHours: {
        open: '09:00',
        close: '17:00'
      }
    });
    console.log('✅ Store creation successful');
    console.log('Store ID:', testStore._id);

    // Create test order
    console.log('\nCreating test order...');
    const testOrder = await Order.create({
      storeId: testStore._id,
      totalAmount: 100,
      status: 'completed'
    });
    console.log('✅ Order creation successful');
    console.log('Order ID:', testOrder._id);

    // Verify store updates
    const updatedStore = await Store.findById(testStore._id);
    console.log('\nVerifying store updates...');
    console.log('Total Orders:', updatedStore.totalOrders);
    console.log('Monthly Revenue:', updatedStore.monthlyRevenue);

    // Cleanup
    console.log('\nCleaning up test data...');
    await Order.findByIdAndDelete(testOrder._id);
    await Store.findByIdAndDelete(testStore._id);
    console.log('✅ Cleanup successful');

    return true;
  } catch (error) {
    console.error('❌ Database operations test failed');
    console.error('Error:', error.message);
    return false;
  }
}

async function testDeveloperEndpoints() {
  console.log('\n🔍 Testing Developer Endpoints...');
  try {
    // Test system overview
    console.log('\nTesting system overview endpoint...');
    const overviewResponse = await axios.get(`${BASE_URL}/api/developer/system`, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    console.log('✅ System overview endpoint working');
    console.log('Overview:', JSON.stringify(overviewResponse.data, null, 2));

    // Test storage status
    console.log('\nTesting storage status endpoint...');
    const storageResponse = await axios.get(`${BASE_URL}/api/developer/storage`, {
      headers: { Authorization: `Bearer ${developerToken}` }
    });
    console.log('✅ Storage status endpoint working');
    console.log('Storage:', JSON.stringify(storageResponse.data, null, 2));

    return true;
  } catch (error) {
    console.error('❌ Developer endpoints test failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

async function testMaintenanceMode() {
  console.log('\n🔍 Testing Maintenance Mode...');
  try {
    // Enable maintenance mode
    const enableResponse = await axios.post(
      `${BASE_URL}/api/developer/maintenance`,
      { enable: true },
      { headers: { Authorization: `Bearer ${developerToken}` }}
    );
    console.log('✅ Maintenance mode enabled:', enableResponse.data.data.modifiedCount, 'stores affected');

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Disable maintenance mode
    const disableResponse = await axios.post(
      `${BASE_URL}/api/developer/maintenance`,
      { enable: false },
      { headers: { Authorization: `Bearer ${developerToken}` }}
    );
    console.log('✅ Maintenance mode disabled:', disableResponse.data.data.modifiedCount, 'stores affected');

    return true;
  } catch (error) {
    console.error('❌ Maintenance mode test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting System Tests...');
  console.log('==========================');

  try {
    // Get developer token first
    developerToken = await getDeveloperToken();

    // Run all tests
    const results = {
      health: await testHealthEndpoint(),
      system: await testSystemCheck(),
      database: await testDatabaseOperations(),
      developer: await testDeveloperEndpoints(),
      maintenance: await testMaintenanceMode()
    };

    console.log('\n==========================');
    console.log('📋 Test Summary:');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}`);
    });

    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r).length;
    
    if (passedTests === totalTests) {
      console.log('\n🎉 All tests passed successfully!');
      process.exit(0);
    } else {
      console.log(`\n⚠️ ${passedTests}/${totalTests} tests passed. Check logs above for details.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests(); 