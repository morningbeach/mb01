const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GIFT_WHITELIST_SLUGS = [
  'drinkware', 'gift-bags', 'stationery', 'tech-accessories',
  'card-holders', 'apparel-accessories', 'keychains-accessories',
  'home-living', 'fragrance', 'outdoor-sports', 'toys-games', 'office-business'
];

async function main() {
  // 取得白名單 tag IDs
  const tags = await prisma.tag.findMany({
    where: { slug: { in: GIFT_WHITELIST_SLUGS } },
    select: { id: true },
  });
  const giftWhitelistIds = tags.map(t => t.id);
  console.log('白名單 Tag IDs 數量:', giftWhitelistIds.length);

  // 模擬 API 查詢
  const where = {
    status: 'ACTIVE',
    version: 2,
    ProductTag: {
      some: {
        tagId: { in: giftWhitelistIds },
      },
    },
  };

  const products = await prisma.product.findMany({
    where,
    select: { id: true, name_zh: true },
    take: 50,
  });

  console.log('符合條件的產品數量:', products.length);
  console.log('產品範例:');
  products.slice(0, 5).forEach(p => console.log('-', p.name_zh || p.id));

  // 取得總數
  const total = await prisma.product.count({ where });
  console.log('總產品數:', total);
}

main().catch(console.error).finally(() => prisma.$disconnect());
