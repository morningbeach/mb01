const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const [,, email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: node create-admin-user.js <email> <password>');
  process.exit(1);
}

async function run() {
  const prisma = new PrismaClient();
  try {
    const hash = bcrypt.hashSync(password, 10);
    const user = await prisma.adminUser.upsert({
      where: { email },
      update: { password: hash, role: 'admin' },
      create: { email, password: hash, role: 'admin', name: 'Admin' },
    });
    console.log('Upserted admin user:', { email: user.email, id: user.id, role: user.role });
  } catch (err) {
    console.error('Failed to create admin user:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
