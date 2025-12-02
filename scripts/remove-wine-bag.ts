import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 找到 wine-bag 標籤
  const wineTag = await prisma.tag.findFirst({
    where: { slug: 'wine-bag' }
  });

  if (!wineTag) {
    console.log('找不到 wine-bag 標籤');
    return;
  }

  // 找到這些禮品盒產品
  const products = await prisma.product.findMany({
    where: {
      name_zh: { in: ['紅色手提禮盒', '秋夜六角禮品盒', '精緻禮品套裝'] }
    },
    select: { id: true, name_zh: true }
  });

  console.log('移除 wine-bag 標籤:\n');

  for (const prod of products) {
    const result = await prisma.productTag.deleteMany({
      where: {
        productId: prod.id,
        tagId: wineTag.id
      }
    });
    console.log(`${prod.name_zh}: ${result.count > 0 ? '✓ 已移除' : '未找到'}`);
  }

  await prisma.$disconnect();
}

main();
