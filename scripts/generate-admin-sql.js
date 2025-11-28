const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const email = process.argv[2] || 'morningbeachtw@gmail.com';
const password = process.argv[3] || 'qwrr3543';

function randomId() {
  // simple unique id similar to cuid-ish string
  return 'id_' + Date.now().toString(36) + crypto.randomBytes(4).toString('hex');
}

(async () => {
  const hash = await bcrypt.hash(password, 10);
  const id = randomId();
  const createdAt = new Date().toISOString();
  const sql = `-- SQL to create AdminUser (run in your Postgres environment)
INSERT INTO \"AdminUser\" (id, email, name, password, role, \"createdAt\", \"updatedAt\") VALUES
  ('${id}', '${email}', 'Admin', '${hash}', 'admin', '${createdAt}', '${createdAt}');

-- If your AdminUser table name is lowercase, use:
-- INSERT INTO adminuser (...) or INSERT INTO admin_user (...)
`;
  console.log(sql);
})();
