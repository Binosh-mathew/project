const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/ping',
  method: 'GET'
};

console.log('Attempting to connect to server...');
const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response received:');
    console.log(data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end(); 