const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 查詢所有 gift 維度（包含未啟用的）
  const allDimensions = await prisma.filterDimension.findMany({
    where: { category: 'gift' },
    orderBy: { order: 'asc' },
    include: {
      tagMappings: {
        orderBy: { order: 'asc' },
        include: {
          tag: true
        }
      }
    }
  });
  
  console.log('=== 禮品 (Gift) 所有維度 (包含未啟用) ===\n');
  
  allDimensions.forEach((dim, i) => {
    const tags = dim.tagMappings.map(m => m.tag);
    const status = dim.is_active ? '✅ 啟用' : '❌ 未啟用';
    console.log(`${i + 1}. ${dim.name_zh} (${dim.name_en}) [${status}]`);
    console.log(`   slug: ${dim.slug}`);
    console.log(`   order: ${dim.order}`);
    console.log(`   標籤數量: ${tags.length}`);
    if (tags.length > 0) {
      console.log('   標籤:');
      tags.forEach(tag => {
        console.log(`     - ${tag.name_zh} (${tag.name_en}) [${tag.slug}]`);
      });
    }
    console.log('');
  });
  
  console.log(`\n總共 ${allDimensions.length} 個維度`);
}

main().finally(() => prisma.$disconnect());
