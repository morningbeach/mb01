const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  // 檢查所有 bag 類別的維度
  const dims = await prisma.filterDimension.findMany({
    where: { category: 'bag' },
    include: {
      tagMappings: {
        include: { tag: true }
      }
    },
    orderBy: { order: 'asc' }
  });
  
  console.log('=== bag 類別的維度 ===\n');
  console.log(`總共 ${dims.length} 個維度\n`);
  
  dims.forEach(dim => {
    console.log(`${dim.slug} | ${dim.name_zh} | order: ${dim.order}`);
    console.log(`  標籤數: ${dim.tagMappings.length}`);
    if (dim.tagMappings.length <= 10) {
      dim.tagMappings.forEach(m => {
        console.log(`    - ${m.tag.slug} | ${m.tag.name_zh}`);
      });
    }
    console.log('');
  });
  
  // 檢查 API 會返回什麼
  console.log('\n=== 檢查各維度的產品計數 ===\n');
  for (const dim of dims) {
    for (const mapping of dim.tagMappings.slice(0, 3)) {
      const count = await prisma.productTag.count({
        where: { tagId: mapping.tag.id }
      });
      console.log(`${dim.name_zh} > ${mapping.tag.name_zh}: ${count} 個產品`);
    }
  }
  
  await prisma.$disconnect();
}

main();
