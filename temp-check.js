const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 查詢 gift-home 維度及其所有標籤
  const dim = await prisma.filterDimension.findFirst({
    where: { slug: 'gift-home' },
    include: {
      tagMappings: {
        include: { tag: true },
        orderBy: { order: 'asc' }
      }
    }
  });
  
  if (dim) {
    console.log('gift-home 維度:', dim.name_zh);
    console.log('包含的標籤:');
    dim.tagMappings.forEach((m, i) => {
      console.log('  ' + (i+1) + '. ' + m.tag.name_zh + ' (' + m.tag.slug + ') - order: ' + m.order);
    });
  } else {
    console.log('找不到 gift-home 維度');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
