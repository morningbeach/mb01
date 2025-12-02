import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 檢查首頁產品是否有 coverImage
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: {
      name_zh: true,
      coverImage: true,
      version: true,
    }
  });

  console.log('首頁產品圖片檢查:\n');
  products.forEach(p => {
    console.log(`${p.name_zh} (v${p.version}): ${p.coverImage ? '✓ ' + p.coverImage.substring(0, 50) + '...' : '✗ 無圖'}`);
  });

  await prisma.$disconnect();
}

main();
