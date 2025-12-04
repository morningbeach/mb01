const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 查看 gift-type 維度下的標籤（分類）
  const giftType = await prisma.filterDimension.findUnique({
    where: { slug: 'gift-type' },
    include: {
      tagMappings: {
        include: { tag: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  console.log('=== gift-type 維度下的分類標籤 ===\n');
  
  if (giftType) {
    for (const mapping of giftType.tagMappings) {
      const categoryTag = mapping.tag;
      console.log(`分類: ${categoryTag.name_zh} (${categoryTag.slug})`);
      
      // 查看這個分類標籤關聯的產品
      const products = await prisma.product.findMany({
        where: {
          tags: {
            some: {
              tag: {
                slug: categoryTag.slug,
              },
            },
          },
        },
        take: 5,
      });
      
      if (products.length > 0) {
        console.log(`  產品數量: ${products.length}+`);
        products.forEach(p => console.log(`    - ${p.name_zh} (${p.slug})`));
      } else {
        console.log('  尚無產品');
      }
      console.log('');
    }
  }

  // 查看有沒有子標籤（如：馬克杯、保溫杯等）
  console.log('\n=== 檢查是否有具體商品標籤（如馬克杯） ===\n');
  const specificTags = await prisma.tag.findMany({
    where: {
      slug: {
        in: ['ceramic-mug', 'insulated-tumbler', 'gift-tote-bag', 'notebook'],
      },
    },
  });
  
  console.log('具體商品標籤:');
  specificTags.forEach(t => console.log(`  - ${t.name_zh} (${t.slug})`));
}

main().finally(() => prisma.$disconnect());
