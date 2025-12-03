const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  // 查看現有的 print-packaging 維度和標籤
  const dims = await prisma.filterDimension.findMany({
    where: { category: 'print-packaging' },
    include: {
      tagMappings: {
        include: { tag: true },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  });
  
  console.log('=== print-packaging 維度 ===\n');
  dims.forEach(d => {
    console.log(`${d.slug} | ${d.name_zh} (${d.name_en})`);
    d.tagMappings.forEach(m => {
      console.log(`  - ${m.tag.slug} | ${m.tag.name_zh || m.tag.name}`);
    });
    console.log('');
  });
  
  await prisma.$disconnect();
}

main();
