const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 找 general-paper-box tag
  const mainTag = await prisma.tag.findFirst({
    where: { slug: 'general-paper-box' }
  });
  
  if (!mainTag) {
    console.log('找不到 general-paper-box tag');
    return;
  }
  
  console.log(`主 Tag: ${mainTag.slug} | ${mainTag.name_zh} (${mainTag.id})`);
  
  // folding-carton 維度
  const foldingDim = await prisma.filterDimension.findFirst({
    where: { slug: 'folding-carton' }
  });
  
  // 已分類的盒形 tag IDs
  const mappedTags = await prisma.dimensionTagMapping.findMany({
    where: { dimensionId: foldingDim.id },
    include: { tag: true }
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
      ProductTag: { include: { Tag: true } }
    }
  });
  
  console.log(`\n有 general-paper-box tag 的產品: ${productsWithMain.length} 個`);
  
  // 檢查這些產品中有多少沒有任何盒形 tag
  const uncategorizedProducts = [];
  
  for (const p of productsWithMain) {
    const productTagIds = p.ProductTag.map(t => t.tagId);
    const hasBoxType = productTagIds.some(id => mappedTagIds.includes(id));
    if (!hasBoxType) {
      uncategorizedProducts.push(p);
    }
  }
  
  console.log(`沒有盒形分類的產品: ${uncategorizedProducts.length} 個`);
  
  if (uncategorizedProducts.length > 0) {
    console.log('\n未分類產品列表:');
    uncategorizedProducts.forEach(p => {
      const tags = p.ProductTag.map(t => t.Tag.name_zh || t.Tag.slug).join(', ');
      console.log(`  - ${p.slug}`);
      console.log(`    Tags: ${tags}`);
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
