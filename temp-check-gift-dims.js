const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const dims = await prisma.filterDimension.findMany({
    where: { category: 'gift', is_active: true },
    include: {
      tagMappings: {
        include: { tag: true },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  });

  console.log('禮品維度數量:', dims.length);
  console.log('');
  
  for (const dim of dims) {
    console.log('維度:', dim.name_zh, '/', dim.name_en, '(', dim.slug, ')');
    console.log('標籤數:', dim.tagMappings.length);
    
    dim.tagMappings.slice(0, 5).forEach(m => {
      console.log('  -', m.tag.name_zh || '無中文', '/', m.tag.name_en || '無英文', '(', m.tag.slug, ')');
    });
    
    if (dim.tagMappings.length > 5) {
      console.log('  ... 還有', dim.tagMappings.length - 5, '個標籤');
    }
    console.log('');
  }
  
  await prisma.$disconnect();
})();
