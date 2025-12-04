const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. 查看 gift-type 維度（品項）下的標籤及產品數量
  console.log('=== gift-type 維度（品項）===\n');
  
  const giftType = await prisma.filterDimension.findUnique({
    where: { slug: 'gift-type' },
    include: {
      tagMappings: {
        include: {
          tag: {
            include: { ProductTag: true }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  console.log('維度:', giftType?.name_zh, '(' + giftType?.slug + ')');
  console.log('');
  
  let totalProducts = 0;
  for (const m of giftType?.tagMappings || []) {
    const count = m.tag.ProductTag.length;
    totalProducts += count;
    console.log(`  ${m.tag.name_zh} (${m.tag.slug}): ${count} 個產品`);
  }
  console.log(`\n  總計: ${totalProducts} 個產品有品項標籤`);

  // 2. 比較：bag-style 維度
  console.log('\n\n=== bag-style 維度（提袋品項）===\n');
  
  const bagStyle = await prisma.filterDimension.findUnique({
    where: { slug: 'bag-style' },
    include: {
      tagMappings: {
        include: {
          tag: {
            include: { ProductTag: true }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  console.log('維度:', bagStyle?.name_zh, '(' + bagStyle?.slug + ')');
  console.log('');
  
  let bagTotal = 0;
  for (const m of bagStyle?.tagMappings || []) {
    const count = m.tag.ProductTag.length;
    bagTotal += count;
    console.log(`  ${m.tag.name_zh} (${m.tag.slug}): ${count} 個產品`);
  }
  console.log(`\n  總計: ${bagTotal} 個產品有品項標籤`);

  // 3. 比較：box-structure 維度（包裝盒品項）
  console.log('\n\n=== box-structure 維度（包裝盒品項）===\n');
  
  const boxStructure = await prisma.filterDimension.findUnique({
    where: { slug: 'box-structure' },
    include: {
      tagMappings: {
        include: {
          tag: {
            include: { ProductTag: true }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  console.log('維度:', boxStructure?.name_zh, '(' + boxStructure?.slug + ')');
  console.log('');
  
  let boxTotal = 0;
  for (const m of boxStructure?.tagMappings || []) {
    const count = m.tag.ProductTag.length;
    boxTotal += count;
    console.log(`  ${m.tag.name_zh} (${m.tag.slug}): ${count} 個產品`);
  }
  console.log(`\n  總計: ${boxTotal} 個產品有品項標籤`);

  await prisma.$disconnect();
}

main().catch(console.error);
