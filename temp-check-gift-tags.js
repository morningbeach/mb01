const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== 禮品 (Gift) 維度與標籤 ===\n');
  
  const dims = await prisma.filterDimension.findMany({
    where: { category: 'gift' },
    include: {
      tagMappings: {
        include: { tag: true },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  });

  if (dims.length === 0) {
    console.log('❌ 沒有找到任何禮品維度！');
  } else {
    for (const dim of dims) {
      console.log(`\n📦 維度: ${dim.name_zh} (${dim.slug})`);
      console.log(`   啟用: ${dim.is_active ? '✅' : '❌'}`);
      console.log(`   標籤數量: ${dim.tagMappings.length}`);
      if (dim.tagMappings.length > 0) {
        console.log('   標籤列表:');
        for (const m of dim.tagMappings) {
          console.log(`     - ${m.tag.name_zh || m.tag.name} (${m.tag.slug})`);
        }
      }
    }
  }

  // 查看是否有相似的標籤存在於其他類別
  console.log('\n\n=== 查詢可能相似的跨類別標籤 ===\n');
  
  const similarTagSlugs = [
    'corporate-gift',
    'gift-bag',
    'gift-box',
    'gift-set',
    'luxury-gift',
    'premium',
    'eco',
    'canvas',
    'cotton'
  ];
  
  for (const slug of similarTagSlugs) {
    const tag = await prisma.tag.findFirst({
      where: { slug },
      include: {
        DimensionTagMapping: {
          include: { dimension: true }
        },
        ProductTag: true
      }
    });
    
    if (tag) {
      const dims = tag.DimensionTagMapping.map(m => `${m.dimension.name_zh}(${m.dimension.category})`);
      console.log(`✅ ${tag.name_zh || tag.name} (${tag.slug})`);
      console.log(`   所屬維度: ${dims.length > 0 ? dims.join(', ') : '無'}`);
      console.log(`   產品數量: ${tag.ProductTag.length}`);
    } else {
      console.log(`❌ ${slug} - 不存在`);
    }
  }

  // 查詢 gift 類別產品上的標籤
  console.log('\n\n=== 禮品類產品上的標籤 (前10個產品) ===\n');
  
  const giftProducts = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      version: 2,
      OR: [
        { category: 'GIFT' },
        { category: 'GIFT_BOX' },
        { category: 'GIFT_SET' }
      ]
    },
    include: {
      ProductTag: {
        include: { Tag: true }
      }
    },
    take: 10
  });

  console.log(`找到 ${giftProducts.length} 個禮品產品`);
  for (const p of giftProducts) {
    console.log(`\n📦 ${p.name_zh || p.name} (${p.category})`);
    if (p.ProductTag.length > 0) {
      console.log(`   標籤: ${p.ProductTag.map(pt => pt.Tag.name_zh || pt.Tag.name).join(', ')}`);
    } else {
      console.log('   標籤: 無');
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
