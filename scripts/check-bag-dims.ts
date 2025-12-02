import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const dims = await prisma.filterDimension.findMany({
    where: { category: 'bag' },
    include: { tagMappings: { include: { tag: true } } },
    orderBy: { order: 'asc' }
  });
  
  console.log('提袋維度數量:', dims.length);
  dims.forEach(d => {
    console.log('\n' + d.name_zh + ' (' + d.slug + '): ' + d.tagMappings.length + '個標籤');
    d.tagMappings.forEach(m => console.log('  - ' + m.tag.name_zh));
  });
  
  await prisma.$disconnect();
}
main();
