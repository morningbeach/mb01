const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 查詢 bag 類別的所有 tag IDs
  const bagTags = await prisma.dimensionTagMapping.findMany({
    where: { dimension: { category: 'bag' } },
    include: { tag: true, dimension: true }
  });
  
  console.log('Bag 類別標籤數量:', bagTags.length);
  
  // 查詢有這些標籤的產品中，名稱含有 "盒" 或 "禮" 的
  const tagIds = bagTags.map(t => t.tagId);
  const products = await prisma.product.findMany({
    where: {
      ProductTag: { some: { tagId: { in: tagIds } } },
      OR: [
        { name_zh: { contains: '盒' } },
        { name_zh: { contains: '禮' } }
      ]
    },
    include: {
      ProductTag: { include: { Tag: true } }
    },
    take: 5
  });
  
  console.log('含盒/禮的產品:', products.length);
  products.forEach(p => {
    const tags = p.ProductTag.map(pt => pt.Tag.name_zh).join(', ');
    console.log(p.name_zh, '|', tags);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
