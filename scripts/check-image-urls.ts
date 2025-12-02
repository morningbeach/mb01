import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 檢查 v2 產品的實際圖片 URL
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE', version: 2 },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      name_zh: true,
      coverImage: true,
      images: true,
      gallery: true,
    }
  });

  console.log('V2 產品圖片 URL:\n');
  products.forEach(p => {
    console.log(`${p.name_zh}:`);
    console.log(`  coverImage: ${p.coverImage || '(空)'}`);
    console.log(`  images: ${JSON.stringify(p.images)?.substring(0, 100) || '(空)'}`);
    console.log(`  gallery: ${JSON.stringify(p.gallery)?.substring(0, 100) || '(空)'}`);
    console.log('');
  });

  await prisma.$disconnect();
}

main();
