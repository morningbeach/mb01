const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // 更新「更換 Logo」提示詞
  await prisma.aiPromptTemplate.updateMany({
    where: { name_zh: '更換 Logo' },
    data: { prompt: '請確保所有LOGO都有被替換掉，將包裝的LOGO替換為 {input}' }
  });
  console.log('✓ 更新「更換 Logo」提示詞');

  // 新增「改變設計風格」範本
  const exists = await prisma.aiPromptTemplate.findFirst({
    where: { name_zh: '改變設計風格' }
  });
  
  if (!exists) {
    await prisma.aiPromptTemplate.create({
      data: {
        name_zh: '改變設計風格',
        name_en: 'Change Design Style',
        prompt: '只保留袋形，其他依據 {input} 風格重新設計。注意：不要修改袋形，只做平面設計的風格調整',
        order: 7
      }
    });
    console.log('✓ 新增「改變設計風格」範本');
  } else {
    console.log('「改變設計風格」範本已存在');
  }

  // 顯示所有範本
  const all = await prisma.aiPromptTemplate.findMany({ orderBy: { order: 'asc' } });
  console.log('\n目前所有範本:');
  all.forEach(t => {
    console.log(`  ${t.order}. ${t.name_zh}: ${t.prompt}`);
  });

  await prisma.$disconnect();
}

run();
