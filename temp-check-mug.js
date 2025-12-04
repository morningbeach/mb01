const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 找馬克杯標籤
  const mugTags = await prisma.tag.findMany({
    where: {
      OR: [
        { name_zh: { contains: '馬克杯' } },
        { slug: { contains: 'mug' } },
      ]
    }
  });
  
  console.log('馬克杯相關標籤:');
  for (const tag of mugTags) {
    console.log(`  - ${tag.name_zh} (${tag.slug}) ID: ${tag.id}`);
    
    // 查詢該標籤關聯的產品
    const productTags = await prisma.productTag.findMany({
      where: { tagId: tag.id },
      include: {
        Product: {
          select: { id: true, name_zh: true, status: true, version: true }
        }
      }
    });
    
    console.log(`    關聯產品數: ${productTags.length}`);
    productTags.forEach(pt => {
      console.log(`      - ${pt.Product.name_zh} (status: ${pt.Product.status}, version: ${pt.Product.version})`);
    });
  }
  
  // 檢查馬克杯標籤是否有關聯到維度
  console.log('\n馬克杯標籤的維度關聯:');
  for (const tag of mugTags) {
    const mappings = await prisma.dimensionTagMapping.findMany({
      where: { tagId: tag.id },
      include: { dimension: true }
    });
    
    if (mappings.length > 0) {
      console.log(`  ${tag.name_zh}:`);
      mappings.forEach(m => {
        console.log(`    - ${m.dimension.name_zh} (${m.dimension.slug})`);
      });
    } else {
      console.log(`  ${tag.name_zh}: 沒有關聯到任何維度!`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
