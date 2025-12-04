const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 建立 dimension-tag mapping
  const mapping = await prisma.dimensionTagMapping.create({
    data: {
      dimensionId: 'cmiqki25m002xwy4wyaudjp1l', // gift-home
      tagId: 'tag-miqvjlzf-rglq5vpv',           // 衛生紙盒
      order: 999,
    }
  });
  console.log('成功建立關聯:', mapping);
  
  // 驗證
  const verify = await prisma.dimensionTagMapping.findFirst({
    where: { tagId: 'tag-miqvjlzf-rglq5vpv' },
    include: { dimension: true, tag: true }
  });
  console.log('驗證結果:', JSON.stringify(verify, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
