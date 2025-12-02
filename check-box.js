const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 獲取所有 bag 類別的 tag IDs
  const bagTagMappings = await prisma.dimensionTagMapping.findMany({
    where: { dimension: { category: 'bag' } },
    select: { tagId: true }
  });
  const bagTagIds = bagTagMappings.map(m => m.tagId);
  
  // 查詢名稱含「盒」的產品，看它們有哪些 bag 標籤
  const products = await prisma.product.findMany({
    where: {
      name_zh: { contains: '盒' },
      ProductTag: { some: { tagId: { in: bagTagIds } } }
    },
    include: {
      ProductTag: {
        where: { tagId: { in: bagTagIds } },
        include: { Tag: true }
      }
    },
    take: 10
  });
  
  console.log('仍有 bag 標籤的盒子產品:');
  products.forEach(p => {
    const tags = p.ProductTag.map(pt => pt.Tag.name_zh).join(', ');
    console.log(p.name_zh, '|', tags);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
