// scripts/seed-ai-prompts.js
// 初始化 AI 提示詞範本
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultPrompts = [
  {
    name_zh: '更換 Logo',
    name_en: 'Change Logo',
    prompt: '將包裝上的 logo 替換為 {input}',
    order: 1,
  },
  {
    name_zh: '更換顏色',
    name_en: 'Change Color',
    prompt: '將包裝的主色調改為 {input} 色系',
    order: 2,
  },
  {
    name_zh: '節慶風格',
    name_en: 'Holiday Style',
    prompt: '將包裝設計成 {input} 節慶風格',
    order: 3,
  },
  {
    name_zh: '添加圖案',
    name_en: 'Add Pattern',
    prompt: '在包裝上添加 {input} 圖案裝飾',
    order: 4,
  },
  {
    name_zh: '材質變化',
    name_en: 'Material Change',
    prompt: '將包裝材質視覺效果改為 {input}',
    order: 5,
  },
  {
    name_zh: '品牌客製',
    name_en: 'Brand Customization',
    prompt: '為這個包裝加入 {input} 品牌元素',
    order: 6,
  },
];

async function main() {
  console.log('開始初始化 AI 提示詞範本...');
  
  // 檢查是否已有範本
  const existingCount = await prisma.aiPromptTemplate.count();
  
  if (existingCount > 0) {
    console.log(`已有 ${existingCount} 個範本，跳過初始化`);
    return;
  }
  
  // 建立範本
  for (const prompt of defaultPrompts) {
    await prisma.aiPromptTemplate.create({
      data: prompt,
    });
    console.log(`✓ 建立範本: ${prompt.name_zh}`);
  }
  
  console.log(`\n✅ 完成！共建立 ${defaultPrompts.length} 個範本`);
}

main()
  .catch((e) => {
    console.error('初始化失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
