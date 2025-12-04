const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 查看 bag 類別的維度
  const dims = await prisma.filterDimension.findMany({
    where: { category: 'bag' },
    include: {
      tagMappings: {
        include: {
          tag: true
        },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  });

  console.log('=== Bag 類別維度 ===\n');
  for (const dim of dims) {
    console.log(`📁 ${dim.name_zh} (${dim.slug})`);
    console.log(`   標籤數量: ${dim.tagMappings.length}`);
    for (const mapping of dim.tagMappings.slice(0, 10)) {
      console.log(`   - ${mapping.tag.name_zh || mapping.tag.name} (${mapping.tag.slug})`);
    }
    if (dim.tagMappings.length > 10) {
      console.log(`   ... 還有 ${dim.tagMappings.length - 10} 個標籤`);
    }
    console.log('');
  }

  // 查看材質相關的標籤
  console.log('\n=== 紙袋相關標籤 ===');
  const paperTags = await prisma.tag.findMany({
    where: {
      OR: [
        { slug: { contains: 'paper' } },
        { name_zh: { contains: '紙' } },
        { name: { contains: 'paper' } },
      ]
    }
  });
  
  for (const tag of paperTags) {
    console.log(`- ${tag.name_zh || tag.name} (${tag.slug})`);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
