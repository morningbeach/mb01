const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== 為一般紙盒新增「未分類」選項 ===\n');
  
  // 1. 建立或找到「未分類」tag
  let uncategorizedTag = await prisma.tag.findFirst({
    where: { slug: 'folding-carton-uncategorized' }
  });
  
  if (!uncategorizedTag) {
    console.log('建立新的「未分類」tag...');
    uncategorizedTag = await prisma.tag.create({
      data: {
        id: `tag-uncategorized-${Date.now()}`,
        slug: 'folding-carton-uncategorized',
        name_en: 'Uncategorized',
        name_zh: '未分類',
      }
    });
    console.log(`✓ 建立完成: ${uncategorizedTag.id}`);
  } else {
    console.log(`「未分類」tag 已存在: ${uncategorizedTag.id}`);
  }
  
  // 2. 找到 folding-carton 維度
  const foldingDim = await prisma.filterDimension.findFirst({
    where: { slug: 'folding-carton' }
  });
  
  if (!foldingDim) {
    console.log('找不到 folding-carton 維度！');
    return;
  }
  console.log(`folding-carton 維度 ID: ${foldingDim.id}`);
  
  // 3. 將「未分類」tag 加入維度（如果還沒加）
  const existingMapping = await prisma.dimensionTagMapping.findFirst({
    where: {
      dimensionId: foldingDim.id,
      tagId: uncategorizedTag.id
    }
  });
  
  if (!existingMapping) {
    console.log('將「未分類」tag 加入 folding-carton 維度...');
    await prisma.dimensionTagMapping.create({
      data: {
        dimensionId: foldingDim.id,
        tagId: uncategorizedTag.id
      }
    });
    console.log('✓ 加入完成');
  } else {
    console.log('「未分類」tag 已經在維度中');
  }
  
  // 4. 找出有 general-paper-box tag 但沒有盒形分類的產品
  const mainTag = await prisma.tag.findFirst({
    where: { slug: 'general-paper-box' }
  });
  
  if (!mainTag) {
    console.log('找不到 general-paper-box tag！');
    return;
  }
  
  // 已分類的盒形 tag IDs（包含新加的「未分類」）
  const mappedTags = await prisma.dimensionTagMapping.findMany({
    where: { dimensionId: foldingDim.id }
  });
  const mappedTagIds = mappedTags.map(m => m.tagId);
  
  // 有 general-paper-box tag 的產品
  const productsWithMain = await prisma.product.findMany({
    where: {
      ProductTag: {
        some: { tagId: mainTag.id }
      }
    },
    include: {
      ProductTag: true
    }
  });
  
  // 找出沒有任何盒形 tag 的產品（排除「未分類」本身）
  const boxTypeTagIds = mappedTagIds.filter(id => id !== uncategorizedTag.id);
  const uncategorizedProducts = productsWithMain.filter(p => {
    const productTagIds = p.ProductTag.map(t => t.tagId);
    return !productTagIds.some(id => boxTypeTagIds.includes(id));
  });
  
  console.log(`\n找到 ${uncategorizedProducts.length} 個未分類產品`);
  
  // 5. 為這些產品加上「未分類」tag
  let addedCount = 0;
  for (const product of uncategorizedProducts) {
    // 檢查是否已經有這個 tag
    const hasTag = product.ProductTag.some(t => t.tagId === uncategorizedTag.id);
    if (!hasTag) {
      await prisma.productTag.create({
        data: {
          productId: product.id,
          tagId: uncategorizedTag.id
        }
      });
      addedCount++;
    }
  }
  
  console.log(`✓ 為 ${addedCount} 個產品加上「未分類」tag`);
  
  // 驗證結果
  const finalCount = await prisma.productTag.count({
    where: { tagId: uncategorizedTag.id }
  });
  console.log(`\n「未分類」tag 現在有 ${finalCount} 個產品`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
