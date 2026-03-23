const bcrypt = require('bcrypt');
const { createConnection } = require('mysql2/promise');

async function run() {
  const conn = await createConnection({
    host: 'mysql', port: 3306,
    user: 'root', password: 'password',
    database: 'cybersecure_db'
  });
  console.log('DB connected');

  const accounts = [
    { identifier: 'admin@cybersecure.local', field: 'email', password: 'Admin@123456' },
    { identifier: 'nguyen.van.a', field: 'username', password: 'Password123!' },
    { identifier: 'nguyen.van.b', field: 'username', password: 'Password123!' },
  ];

  for (const acc of accounts) {
    const hash = await bcrypt.hash(acc.password, 10);
    const sql = `UPDATE users SET password_hash=?, is_locked=0, failed_login_attempts=0, account_locked_until=NULL WHERE ${acc.field}=?`;
    const [result] = await conn.execute(sql, [hash, acc.identifier]);
    console.log('Reset', acc.identifier, '→ rows:', result.affectedRows);
  }

  // Unlock all locked accounts
  await conn.execute('UPDATE users SET is_locked=0, failed_login_attempts=0, account_locked_until=NULL WHERE is_locked=1');
  console.log('Unlocked all locked accounts');

  // Verify
  const [rows] = await conn.execute('SELECT username, email, is_locked, failed_login_attempts, LEFT(password_hash,7) as hash_pfx FROM users');
  rows.forEach(r => console.log(`  ${r.username} | locked:${r.is_locked} | fails:${r.failed_login_attempts} | pfx:${r.hash_pfx}`));

  await conn.end();
  console.log('DONE');
}

run().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
