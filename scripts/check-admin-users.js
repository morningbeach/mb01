const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.adminUser.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  });
  
  console.log('所有管理員帳號:');
  users.forEach(u => {
    console.log(`  - ${u.email} | Role: ${u.role} | Name: ${u.name || 'N/A'}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
