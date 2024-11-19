// scripts/verify-db.js
const { execSync } = require('child_process');

async function verifyDatabase() {
  console.log('🔍 Verifying D1 Database Setup...\n');

  try {
    // 1. Check if database exists
    console.log('📋 Listing D1 Databases:');
    const databases = execSync('npx wrangler d1 list').toString();
    console.log(databases);

    // 2. Check database schema
    console.log('\n📊 Checking Database Schema:');
    try {
      const schema = execSync('npx wrangler d1 execute traffic-light-demo --command ".schema"').toString();
      console.log(schema);
    } catch (error) {
      console.log('❌ Error getting schema. Database might not be initialized.');
    }

    // 3. Check table data
    console.log('\n📝 Checking Table Data:');
    try {
      const data = execSync('npx wrangler d1 execute traffic-light-demo --command "SELECT * FROM traffic_lights;"').toString();
      console.log(data);
    } catch (error) {
      console.log('❌ Error getting data. Table might not exist.');
    }

    // 4. Check wrangler.toml
    console.log('\n📄 Checking wrangler.toml configuration:');
    const wranglerConfig = require('fs').readFileSync('wrangler.toml', 'utf8');
    console.log(wranglerConfig);

    // 5. Test database connection
    console.log('\n🌐 Testing API Connection:');
    console.log('Starting development server...');
    
    // Note: This will fail if server is already running
    try {
      execSync('npx wrangler pages dev .next --d1=DB=traffic-light-demo &');
      console.log('Waiting for server to start...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('\nTesting endpoints:');
      console.log('\n1. Debug endpoint:');
      execSync('curl http://localhost:8788/api/debug');
      
      console.log('\n2. Traffic endpoint:');
      execSync('curl http://localhost:8788/api/traffic');
    } catch (error) {
      console.log('Note: If server is already running, these tests may fail.');
    }

  } catch (error) {
    console.error('\n❌ Error during verification:', error.message);
  }

  console.log('\n🔧 Troubleshooting Steps:');
  console.log('1. Verify database ID in wrangler.toml matches the output of `wrangler d1 list`');
  console.log('2. Try reinitializing the database:');
  console.log('   npx wrangler d1 execute traffic-light-demo --file=./schema.sql');
  console.log('3. Verify the D1 binding in Cloudflare Pages Dashboard:');
  console.log('   - Go to Pages > Your Project > Settings > Functions > D1 Bindings');
  console.log('4. Try clearing local data:');
  console.log('   rm -rf .wrangler');
  console.log('5. Restart the development server with:');
  console.log('   npx wrangler pages dev .next --d1=DB=traffic-light-demo');
}

verifyDatabase().catch(console.error);