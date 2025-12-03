const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  // 將產品導航改為指向 packaging-explorer
  const result = await prisma.sitePage.update({
    where: { slug: 'products' },
    data: { slug: 'packaging-explorer' }
  });
  
  console.log('已更新產品頁面導航:', result.slug);
  
  await prisma.$disconnect();
}

main();
