const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const u = await prisma.adminUser.findUnique({ where: { email: 'morningbeachtw@gmail.com' } });
    console.log('Found admin user:', u);
  } catch (e) {
    console.error('Verify failed:', e.message || e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
