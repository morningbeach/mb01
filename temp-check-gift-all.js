const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 取得所有 gift-type 的品項標籤
  const giftTypeDim = await prisma.filterDimension.findFirst({
    where: { slug: 'gift-type' },
    include: {
      tagMappings: {
        include: { tag: true }
      }
    }
  });

  if (!giftTypeDim) {
    console.log('找不到 gift-type 維度');
    return;
  }

  console.log('=== 各品項的產品數量 ===\n');

  for (const mapping of giftTypeDim.tagMappings) {
    const tag = mapping.tag;
    const count = await prisma.product.count({
      where: {
        version: 2,
        status: 'ACTIVE',
        ProductTag: { some: { tagId: tag.id } }
      }
    });
    console.log(`${tag.name_zh} (${tag.slug}): ${count} 個產品`);
  }

  // 查看 gift 類別的所有標籤
  console.log('\n\n=== Gift 類別所有維度的標籤總數 ===\n');
  
  const giftDims = await prisma.filterDimension.findMany({
    where: { category: 'gift', is_active: true },
    include: {
      tagMappings: {
        include: { tag: true }
      }
    }
  });

  for (const dim of giftDims) {
    console.log(`\n【${dim.name_zh}】${dim.slug} - ${dim.tagMappings.length} 個標籤`);
    
    // 計算每個標籤有多少產品
    for (const mapping of dim.tagMappings.slice(0, 5)) {
      const tag = mapping.tag;
      const count = await prisma.product.count({
        where: {
          version: 2,
          status: 'ACTIVE',
          ProductTag: { some: { tagId: tag.id } }
        }
      });
      if (count > 0) {
        console.log(`  - ${tag.name_zh}: ${count} 個產品`);
      }
    }
  }

  // 看看禮品類別的產品到底有什麼標籤
  console.log('\n\n=== 查看 Gift 類別下實際有產品的標籤 ===\n');
  
  // 取得所有 gift 維度的 tag IDs
  const allGiftTagIds = giftDims.flatMap(d => d.tagMappings.map(m => m.tagId));
  
  // 找有這些標籤的產品
  const giftProducts = await prisma.product.findMany({
    where: {
      version: 2,
      status: 'ACTIVE',
      ProductTag: { some: { tagId: { in: allGiftTagIds } } }
    },
    include: {
      ProductTag: { include: { Tag: true } }
    },
    take: 10
  });

  console.log(`找到 ${giftProducts.length} 個禮品類產品`);
  
  giftProducts.slice(0, 3).forEach(p => {
    console.log(`\n【${p.name_zh}】`);
    console.log('  標籤:', p.ProductTag.map(pt => pt.Tag.name_zh).join(', '));
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
