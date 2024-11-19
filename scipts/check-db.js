// scripts/check-db.js
const { execSync } = require('child_process');

console.log('Checking D1 database status...');

try {
  // List all D1 databases
  console.log('\nListing all D1 databases:');
  console.log(execSync('npx wrangler d1 list').toString());

  // Check traffic lights table content
  console.log('\nChecking traffic_lights table content:');
  console.log(execSync('npx wrangler d1 execute traffic-lights-dev --command "SELECT * FROM traffic_lights;"').toString());
} catch (error) {
  console.error('Error checking database:', error.message);
}