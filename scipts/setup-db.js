// scripts/setup-db.js
const { execSync } = require('child_process');

console.log('Setting up D1 database...');

try {
  // Create D1 database if it doesn't exist
  execSync('wrangler d1 create traffic-lights-dev', { stdio: 'inherit' });
} catch (error) {
  console.log('Database might already exist, continuing...');
}

// Execute the schema
console.log('Applying schema...');
execSync('wrangler d1 execute traffic-lights-dev --file=./schema.sql', { stdio: 'inherit' });

console.log('Database setup complete!');