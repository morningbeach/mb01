const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 查看 gift 類別下所有維度
  const dims = await prisma.filterDimension.findMany({
    where: { category: 'gift', is_active: true },
    include: { 
      tagMappings: { 
        include: { tag: true },
        take: 10
      } 
    },
    orderBy: { order: 'asc' }
  });
  
  console.log('=== Gift 維度結構 ===\n');
  dims.forEach(d => {
    console.log(`【${d.name_zh}】slug: ${d.slug}`);
    d.tagMappings.forEach(t => {
      console.log(`  - ${t.tag.name_zh} (${t.tag.slug})`);
    });
    console.log('');
  });

  // 查看 drinkware 這個 tag 是否有子標籤或關聯
  console.log('\n=== 檢查 drinkware tag ===');
  const drinkwareTag = await prisma.tag.findFirst({
    where: { slug: 'drinkware' }
  });
  console.log('drinkware tag:', drinkwareTag);

  // 查看有沒有 parentId 欄位或子標籤結構
  const tagFields = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'Tag'
  `;
  console.log('\nTag 表欄位:', tagFields);
}

main().catch(console.error).finally(() => prisma.$disconnect());
