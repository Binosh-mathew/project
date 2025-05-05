require('dotenv').config();
const runSystemCheck = require('../utils/systemCheck');

async function main() {
  try {
    console.log('Starting system check...');
    await runSystemCheck();
    console.log('System check completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('System check failed:', error);
    process.exit(1);
  }
}

main(); 