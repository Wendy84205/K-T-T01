const mysql = require('mysql2/promise');

async function testConnection() {
  const config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'cybersecure_db'
  };

  console.log('🔌 Testing MySQL Connection...\n');
  console.log('Config:', JSON.stringify(config, null, 2));

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connection successful!');
    
    // Test query
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log(`📊 MySQL Version: ${rows[0].version}`);
    
    // Check user table
    const [users] = await connection.execute(
      'SELECT id, username, email, password_hash, is_active FROM users WHERE username = ?',
      ['admin']
    );
    
    console.log(`\n👤 User count: ${users.length}`);
    if (users.length > 0) {
      const user = users[0];
      console.log('User details:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Active: ${user.is_active}`);
      console.log(`  Hash length: ${user.password_hash?.length || 0}`);
      console.log(`  Hash prefix: ${user.password_hash?.substring(0, 30) || 'None'}...`);
    }
    
    await connection.end();
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('Error code:', error.code);
    console.log('Error number:', error.errno);
  }
}

testConnection();
