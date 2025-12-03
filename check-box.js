const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  // 查找摺疊盒相關的 Tag
  const foldTags = await prisma.tag.findMany({
    where: {
      OR: [
        { slug: { contains: 'fold' } },
        { name: { contains: '摺疊' } },
        { name_zh: { contains: '摺疊' } },
        { slug: { contains: 'collapsible' } },
      ]
    }
  });
  
  console.log('=== 摺疊相關的 Tag ===');
  foldTags.forEach(t => console.log(`${t.id} | ${t.slug} | ${t.name_zh || t.name}`));
  
  // 同時查找精裝紙盒的維度 ID
  const rigidBoxDim = await prisma.filterDimension.findFirst({
    where: { slug: 'rigid-box' }
  });
  console.log('\n精裝紙盒維度:', rigidBoxDim?.id);
  
  await prisma.$disconnect();
}

main();
