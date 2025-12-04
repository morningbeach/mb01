const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const GIFT_WHITELIST = [
    'drinkware', 'gift-bags', 'stationery', 'tech-accessories',
    'card-holders', 'apparel-accessories', 'keychains-accessories',
    'home-living', 'fragrance', 'outdoor-sports', 'toys-games', 'office-business'
  ];
  
  const whitelistTags = await prisma.tag.findMany({
    where: { slug: { in: GIFT_WHITELIST } },
    include: {
      ProductTag: {
        select: { productId: true }
      }
    }
  });
  
  console.log('白名單標籤產品統計:');
  let total = 0;
  for (const tag of whitelistTags) {
    console.log(tag.slug, ':', tag.ProductTag.length);
    total += tag.ProductTag.length;
  }
  console.log('總計:', total);
  
  // 查找有禮品維度標籤的產品數量
  const giftDimTags = await prisma.dimensionTagMapping.findMany({
    where: { dimension: { category: 'gift' } },
    include: {
      tag: {
        include: {
          ProductTag: {
            include: {
              product: {
                select: { id: true, status: true, version: true }
              }
            }
          }
        }
      }
    }
  });
  
  console.log('\n\n禮品維度下的標籤:');
  const allProductIds = new Set();
  for (const mapping of giftDimTags) {
    const activeProducts = mapping.tag.ProductTag.filter(
      pt => pt.product.status === 'ACTIVE' && pt.product.version === 2
    );
    if (activeProducts.length > 0) {
      console.log(mapping.tag.slug, ':', activeProducts.length);
      activeProducts.forEach(pt => allProductIds.add(pt.product.id));
    }
  }
  console.log('獨立產品總數:', allProductIds.size);
}

main().catch(console.error).finally(() => prisma.$disconnect());
