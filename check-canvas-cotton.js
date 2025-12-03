// 檢查 canvas 和 cotton 標籤
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  // 查詢 canvas 和 cotton 標籤
  const tags = await prisma.tag.findMany({
    where: { 
      slug: { in: ['canvas', 'cotton'] }
    },
    include: {
      ProductTag: {
        take: 10,
        include: {
          Product: { select: { id: true, name: true } }
        }
      },
      _count: { select: { ProductTag: true } }
    }
  });

  console.log('=== canvas 和 cotton 標籤查詢結果 ===\n');
  
  if (tags.length === 0) {
    console.log('❌ 找不到 canvas 或 cotton 標籤！');
  } else {
    tags.forEach(tag => {
      console.log(`📌 ${tag.name_zh || tag.name} (${tag.slug})`);
      console.log(`   ID: ${tag.id}`);
      console.log(`   關聯產品數: ${tag._count.ProductTag}`);
      if (tag.ProductTag.length > 0) {
        console.log('   產品範例:');
        tag.ProductTag.forEach(pt => {
          console.log(`     - ${pt.Product.name}`);
        });
      }
      console.log('');
    });
  }

  // 也查一下 DimensionTagMapping 中是否有這兩個標籤
  console.log('=== 檢查 DimensionTagMapping 中的關聯 ===\n');
  
  const mappings = await prisma.dimensionTagMapping.findMany({
    where: {
      tag: { slug: { in: ['canvas', 'cotton'] } }
    },
    include: {
      tag: true,
      dimension: true
    }
  });

  if (mappings.length === 0) {
    console.log('❌ canvas 和 cotton 標籤未被關聯到任何 FilterDimension！');
  } else {
    mappings.forEach(m => {
      console.log(`✅ ${m.tag.name_zh || m.tag.name} → ${m.dimension.name_zh} (${m.dimension.slug})`);
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);
