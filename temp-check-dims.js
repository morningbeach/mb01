const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  console.log('=== 提袋維度 ===\n');
  const bagDims = await prisma.filterDimension.findMany({
    where: { category: 'bag', is_active: true },
    include: {
      tagMappings: {
        include: { tag: true },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  });
  
  bagDims.forEach(d => {
    console.log(d.name_zh + ' (' + d.slug + '): ' + d.tagMappings.length + '個標籤');
    d.tagMappings.slice(0, 5).forEach(m => console.log('  - ' + m.tag.slug + ': ' + m.tag.name_zh));
    if (d.tagMappings.length > 5) console.log('  ... 還有 ' + (d.tagMappings.length - 5) + ' 個');
    console.log('');
  });

  console.log('\n=== 盒子維度 ===\n');
  const boxDims = await prisma.filterDimension.findMany({
    where: { category: 'print-packaging', is_active: true },
    include: {
      tagMappings: {
        include: { tag: true },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  });
  
  boxDims.forEach(d => {
    console.log(d.name_zh + ' (' + d.slug + '): ' + d.tagMappings.length + '個標籤');
    d.tagMappings.slice(0, 5).forEach(m => console.log('  - ' + m.tag.slug + ': ' + m.tag.name_zh));
    if (d.tagMappings.length > 5) console.log('  ... 還有 ' + (d.tagMappings.length - 5) + ' 個');
    console.log('');
  });

  await prisma.$disconnect();
})();
