const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // 搜尋飛機盒相關 tag
  const tags = await prisma.tag.findMany({
    where: {
      OR: [
        { name_zh: { contains: '飛機' } },
        { slug: { contains: 'airplane' } },
        { slug: { contains: 'mailer' } },
        { slug: { contains: 'corrugated' } },
      ]
    }
  });
  
  console.log('找到的 tags:');
  console.log(JSON.stringify(tags, null, 2));
  
  // 同時查看 folding-carton 維度下有哪些 tags
  const foldingCartonDim = await prisma.dimension.findFirst({
    where: { slug: 'folding-carton' },
    include: {
      tags: true
    }
  });
  
  console.log('\n\nfolding-carton 維度下的 tags:');
  if (foldingCartonDim) {
    foldingCartonDim.tags.forEach(t => {
      console.log(`  - ${t.slug}: ${t.name_zh}`);
    });
  }
  
  await prisma.$disconnect();
}

run();
