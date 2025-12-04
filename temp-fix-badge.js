const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 找徽章標籤
  const tag = await prisma.tag.findFirst({
    where: { name_zh: '徽章' }
  });
  
  // 找 gift-apparel 維度
  const dim = await prisma.filterDimension.findFirst({
    where: { slug: 'gift-apparel' }
  });
  
  console.log('Tag:', tag ? `${tag.id} - ${tag.slug}` : 'NOT FOUND');
  console.log('Dim:', dim ? `${dim.id} - ${dim.slug}` : 'NOT FOUND');
  
  if (tag && dim) {
    // 檢查是否已有 mapping
    const existing = await prisma.dimensionTagMapping.findFirst({
      where: { tagId: tag.id, dimensionId: dim.id }
    });
    
    if (existing) {
      console.log('Mapping already exists!');
    } else {
      // 取得最大 order
      const maxOrder = await prisma.dimensionTagMapping.findFirst({
        where: { dimensionId: dim.id },
        orderBy: { order: 'desc' }
      });
      
      const newOrder = (maxOrder?.order ?? -1) + 1;
      
      // 建立 mapping
      const mapping = await prisma.dimensionTagMapping.create({
        data: {
          tagId: tag.id,
          dimensionId: dim.id,
          order: newOrder
        }
      });
      console.log('Created mapping:', mapping);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
