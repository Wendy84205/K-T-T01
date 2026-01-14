const bcrypt = require('bcrypt');

async function testBcrypt() {
  console.log('🧪 Testing Bcrypt Configuration\n');
  
  console.log('1. Testing library version and availability:');
  console.log('   bcrypt available:', typeof bcrypt !== 'undefined');
  console.log('   bcrypt.compare available:', typeof bcrypt.compare === 'function');
  console.log('   bcrypt.hash available:', typeof bcrypt.hash === 'function');
  
  console.log('\n2. Testing password "Admin@123456":');
  const password = 'Admin@123456';
  console.log('   Password:', password);
  console.log('   Length:', password.length);
  console.log('   Char codes:', Array.from(password).map(c => c.charCodeAt(0)).join(','));
  
  console.log('\n3. Testing with hash from database:');
  const dbHash = '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';
  console.log('   DB Hash:', dbHash);
  console.log('   Hash prefix:', dbHash.substring(0, 7));
  console.log('   Expected: $2b$12$ or $2a$12$');
  
  try {
    const result = await bcrypt.compare(password, dbHash);
    console.log('   Compare result:', result);
    console.log('   ✅ Bcrypt.compare works');
  } catch (error) {
    console.log('   ❌ Bcrypt.compare error:', error.message);
  }
  
  console.log('\n4. Creating new hash for comparison:');
  try {
    const newHash = await bcrypt.hash(password, 12);
    console.log('   New hash:', newHash);
    console.log('   New hash prefix:', newHash.substring(0, 7));
    
    const compareNew = await bcrypt.compare(password, newHash);
    console.log('   Compare with new hash:', compareNew);
  } catch (error) {
    console.log('   ❌ Hash creation error:', error.message);
  }
  
  console.log('\n5. Testing $2a$ vs $2b$ prefix:');
  const hash2a = dbHash.replace('$2b$', '$2a$');
  console.log('   Modified hash:', hash2a);
  try {
    const result2a = await bcrypt.compare(password, hash2a);
    console.log('   Compare with $2a$:', result2a);
  } catch (error) {
    console.log('   Error with $2a$:', error.message);
  }
}

testBcrypt().catch(console.error);
