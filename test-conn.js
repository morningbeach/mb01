const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing connection...');
  const count = await prisma.product.count();
  console.log('Product count:', count);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
