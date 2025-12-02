import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 檢查 v2 產品
  const v2Products = await prisma.product.findMany({
    where: { status: 'ACTIVE', version: 2 },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: {
      name_zh: true,
      coverImage: true,
      version: true,
    }
  });

  console.log('V2 產品 (共', v2Products.length, '個):\n');
  v2Products.forEach(p => {
    console.log(`${p.name_zh}: ${p.coverImage ? '✓ 有圖' : '✗ 無圖'}`);
  });

  // 檢查首頁 section 設定
  console.log('\n\n首頁 PRODUCTS section:');
  const section = await prisma.homeSection.findFirst({
    where: { type: 'PRODUCTS' }
  });
  console.log(JSON.stringify(section, null, 2));

  await prisma.$disconnect();
}

main();
