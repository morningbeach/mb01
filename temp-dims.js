const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 查詢禮品維度標籤關聯的產品數
  const mappings = await prisma.dimensionTagMapping.findMany({
    where: { dimension: { category: 'gift' } },
    include: {
      tag: {
        include: { ProductTag: true }
      }
    }
  });
  
  let productIds = new Set();
  mappings.forEach(m => m.tag.ProductTag.forEach(pt => productIds.add(pt.productId)));
  console.log('禮品維度標籤關聯的產品數:', productIds.size);
  
  // 查詢 GIFT 類別產品總數
  const giftCount = await prisma.product.count({
    where: { status: 'ACTIVE', version: 2, category: { in: ['GIFT', 'GIFT_BOX', 'GIFT_SET'] } }
  });
  console.log('GIFT 類別產品總數:', giftCount);
  
  await prisma.$disconnect();
}

main().catch(console.error);
