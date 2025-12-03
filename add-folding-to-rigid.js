const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dimensionId = 'cmipr60y0000rwya0ec7gijhw'; // rigid-box 精裝紙盒
  const tagId = 'cmihzr33j001owyosclk1fyaq'; // 摺疊盒 foldable-box
  
  // 檢查是否已存在
  const existing = await prisma.dimensionTagMapping.findFirst({
    where: {
      dimensionId: dimensionId,
      tagId: tagId
    }
  });
  
  if (existing) {
    console.log('摺疊盒 已經存在於精裝紙盒維度中！');
    return;
  }
  
  // 創建新的映射
  const result = await prisma.dimensionTagMapping.create({
    data: {
      dimensionId: dimensionId,
      tagId: tagId
    }
  });
  
  console.log('成功添加摺疊盒到精裝紙盒維度！');
  console.log('新建的 DimensionTagMapping ID:', result.id);
  
  // 驗證結果
  const dimension = await prisma.filterDimension.findUnique({
    where: { id: dimensionId },
    include: {
      tags: {
        include: { tag: true }
      }
    }
  });
  
  console.log('\n精裝紙盒維度現在包含的 Tags:');
  dimension.tags.forEach(t => {
    console.log(`  - ${t.tag.name_zh || t.tag.name_en}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
