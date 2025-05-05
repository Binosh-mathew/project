const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const mongoose = require('mongoose');
const Store = require('../models/Store');
const Order = require('../models/Order');
const User = require('../models/User');
const Admin = require('../models/Admin');

const checkDatabaseConnection = async () => {
  try {
    const state = mongoose.connection.readyState;
    if (state !== 1) {
      throw new Error('Database not connected');
    }
    console.log('✅ Database connection verified');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

const checkCollections = async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const requiredCollections = ['users', 'admins', 'stores', 'orders'];
    const missingCollections = requiredCollections.filter(
      col => !collections.find(c => c.name === col)
    );

    if (missingCollections.length > 0) {
      throw new Error(`Missing collections: ${missingCollections.join(', ')}`);
    }
    console.log('✅ All required collections exist');
    return true;
  } catch (error) {
    console.error('❌ Collection check failed:', error.message);
    return false;
  }
};

const checkEnvironmentVariables = () => {
  const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_EXPIRE',
    'DEVELOPER_EMAIL',
    'DEVELOPER_PASSWORD'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
};

const checkModelIndexes = async () => {
  try {
    const models = [
      { model: User, name: 'User' },
      { model: Admin, name: 'Admin' },
      { model: Store, name: 'Store' },
      { model: Order, name: 'Order' }
    ];

    for (const { model, name } of models) {
      const indexes = await model.listIndexes();
      console.log(`✅ ${name} indexes verified:`, indexes.length);
    }
    return true;
  } catch (error) {
    console.error('❌ Index verification failed:', error.message);
    return false;
  }
};

async function checkDiskSpace() {
  try {
    let command;
    if (process.platform === 'win32') {
      command = 'wmic logicaldisk get size,freespace,caption';
    } else {
      command = 'df -h /';
    }

    const { stdout } = await execAsync(command);
    let storage = { free: 0, total: 0, usedPercentage: 0 };

    if (process.platform === 'win32') {
      const lines = stdout.trim().split('\n').slice(1);
      for (const line of lines) {
        const [caption, freeSpace, size] = line.trim().split(/\s+/);
        if (caption === 'C:') {
          storage.total = Math.floor(parseInt(size) / (1024 * 1024 * 1024)); // Convert to GB
          storage.free = Math.floor(parseInt(freeSpace) / (1024 * 1024 * 1024));
          storage.usedPercentage = ((storage.total - storage.free) / storage.total) * 100;
          break;
        }
      }
    } else {
      const line = stdout.trim().split('\n')[1];
      const [, size, used, available] = line.trim().split(/\s+/);
      storage.total = parseInt(size.replace('G', ''));
      storage.used = parseInt(used.replace('G', ''));
      storage.free = parseInt(available.replace('G', ''));
      storage.usedPercentage = (storage.used / storage.total) * 100;
    }

    if (storage.free < 1) { // Less than 1GB free
      throw new Error('Critical: Disk space is extremely low');
    }
    
    if (storage.usedPercentage > 90) {
      throw new Error('Warning: Disk usage is above 90%');
    }
    
    return storage;
  } catch (error) {
    throw new Error(`Disk check failed: ${error.message}`);
  }
}

async function checkMemory() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedPercentage = ((totalMem - freeMem) / totalMem) * 100;
  
  const result = {
    total: Math.floor(totalMem / (1024 * 1024 * 1024)), // Convert to GB
    free: Math.floor(freeMem / (1024 * 1024 * 1024)),
    usedPercentage: usedPercentage
  };
  
  if (freeMem < 512 * 1024 * 1024) { // Less than 512MB free
    throw new Error('Critical: System memory is extremely low');
  }
  
  if (usedPercentage > 90) {
    throw new Error('Warning: Memory usage is above 90%');
  }
  
  return result;
}

async function checkDatabase() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database is not connected');
  }
  
  try {
    await mongoose.connection.db.admin().ping();
    const stats = await mongoose.connection.db.stats();
    return {
      status: true,
      size: Math.floor(stats.dataSize / (1024 * 1024)), // Size in MB
      collections: stats.collections,
      indexes: stats.indexes
    };
  } catch (error) {
    throw new Error('Database check failed: ' + error.message);
  }
}

async function runSystemCheck() {
  const results = {
    timestamp: new Date(),
    disk: null,
    memory: null,
    database: null,
    collections: null,
    errors: []
  };
  
  try {
    results.disk = await checkDiskSpace();
  } catch (error) {
    results.errors.push({ component: 'disk', message: error.message });
  }
  
  try {
    results.memory = await checkMemory();
  } catch (error) {
    results.errors.push({ component: 'memory', message: error.message });
  }
  
  try {
    results.database = await checkDatabase();
  } catch (error) {
    results.errors.push({ component: 'database', message: error.message });
  }
  
  try {
    results.collections = await checkCollections();
  } catch (error) {
    results.errors.push({ component: 'collections', message: error.message });
  }
  
  if (results.errors.length > 0) {
    const error = new Error('System check failed');
    error.details = results;
    throw error;
  }
  
  return results;
}

module.exports = runSystemCheck; 