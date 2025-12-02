import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 更新 Products 頁面，指向新的 packaging-explorer
  const result = await prisma.sitePage.update({
    where: { slug: 'products' },
    data: { slug: 'packaging-explorer' }
  });

  console.log('已更新 Products 導航:', result.slug);

  await prisma.$disconnect();
}

main();
