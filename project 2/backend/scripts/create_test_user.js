const bcrypt = require('bcryptjs');
const { dbRun } = require('../server/config/database');

async function createUser() {
  try {
    const email = process.argv[2] || 'tester@example.com';
    const password = process.argv[3] || 'password';
    const name = process.argv[4] || 'Test User';
    const role = 'analyst';

    const hash = await bcrypt.hash(password, 10);

    const res = await dbRun(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, hash, name, role]
    );

    console.log('Created user:', { id: res.id, email });
  } catch (err) {
    console.error('Error creating user:', err.message);
    process.exit(1);
  }
}

createUser();
