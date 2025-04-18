// Create scripts directory
const fs = require('fs');

if (!fs.existsSync('scripts')) {
  console.log('Creating scripts directory');
  fs.mkdirSync('scripts', { recursive: true });
}

console.log('Scripts directory created successfully!');