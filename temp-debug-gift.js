const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GIFT_WHITELIST_SLUGS = [
  'drinkware', 'gift-bags', 'stationery', 'tech-accessories',
  'card-holders', 'apparel-accessories', 'keychains-accessories',
  'home-living', 'fragrance', 'outdoor-sports', 'toys-games', 'office-business'
];

async function main() {
  // 檢查每個白名單標籤
  for (const slug of GIFT_WHITELIST_SLUGS) {
    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        ProductTag: {
          include: {
            Product: {
              select: { id: true, status: true, version: true, name_zh: true }
            }
          }
        }
      }
    });
    
    if (tag) {
      const activeV2Products = tag.ProductTag.filter(
        pt => pt.Product.status === 'ACTIVE' && pt.Product.version === 2
      );
      console.log(`${slug}: 總 ${tag.ProductTag.length}, ACTIVE v2: ${activeV2Products.length}`);
      if (activeV2Products.length > 0 && activeV2Products.length <= 3) {
        activeV2Products.forEach(pt => console.log('  -', pt.Product.name_zh));
      }
    } else {
      console.log(`${slug}: 標籤不存在`);
    }
  }

  // 檢查有多少禮品產品
  console.log('\n\n--- 直接查詢禮品維度下的所有標籤對應的產品 ---');
  
  const giftDimensions = await prisma.filterDimension.findMany({
    where: { category: 'gift' },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  });
  
  const allGiftTagIds = [];
  for (const dim of giftDimensions) {
    console.log(`\n維度: ${dim.slug} (${dim.name})`);
    for (const mapping of dim.tags) {
      allGiftTagIds.push(mapping.tagId);
      const count = await prisma.productTag.count({
        where: {
          tagId: mapping.tagId,
          Product: { status: 'ACTIVE', version: 2 }
        }
      });
      if (count > 0) {
        console.log(`  ${mapping.tag.slug}: ${count} 個產品`);
      }
    }
  }
  
  // 用所有禮品標籤查詢
  console.log('\n\n--- 用所有禮品維度標籤查詢 ---');
  const total = await prisma.product.count({
    where: {
      status: 'ACTIVE',
      version: 2,
      ProductTag: {
        some: {
          tagId: { in: allGiftTagIds }
        }
      }
    }
  });
  console.log('總產品數:', total);
}

main().catch(console.error).finally(() => prisma.$disconnect());
