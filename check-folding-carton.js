const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 找 folding-carton 相關的 tag
  const foldingTags = await prisma.tag.findMany({
    where: {
      OR: [
        { slug: { contains: 'folding-carton' } },
        { name_zh: { contains: '一般紙盒' } },
        { name_zh: { contains: '成型紙盒' } },
      ]
    }
  });
  
  console.log('=== 一般紙盒相關 Tags ===');
  foldingTags.forEach(t => {
    console.log(`${t.id} | ${t.slug} | ${t.name_zh}`);
  });
  
  // 找出 folding-carton 維度的 ID
  const foldingDim = await prisma.filterDimension.findFirst({
    where: { slug: 'folding-carton' }
  });
  
  if (foldingDim) {
    console.log('\n=== folding-carton 維度 ===');
    console.log(`ID: ${foldingDim.id}`);
    console.log(`Name: ${foldingDim.name_zh}`);
    
    // 找出已經被分類到盒形的 tag IDs
    const mappedTags = await prisma.dimensionTagMapping.findMany({
      where: { dimensionId: foldingDim.id },
      include: { tag: true }
    });
    
    const mappedTagIds = mappedTags.map(m => m.tagId);
    console.log(`\n已分類的盒形 Tags (${mappedTags.length}個):`);
    mappedTags.forEach(m => {
      console.log(`  - ${m.tag.slug} | ${m.tag.name_zh}`);
    });
    
    // 找出有 folding-carton tag 但沒有被分類到任何盒形的產品數量
    // 首先找到 folding-carton 主 tag
    const mainTag = foldingTags.find(t => t.slug === 'folding-carton');
    if (mainTag) {
      console.log(`\n主 Tag: ${mainTag.slug} (${mainTag.id})`);
      
      // 有 folding-carton tag 的產品
      const productsWithMain = await prisma.product.findMany({
        where: {
          tags: {
            some: { tagId: mainTag.id }
          }
        },
        include: {
          tags: { include: { tag: true } }
        }
      });
      
      console.log(`\n有 folding-carton tag 的產品: ${productsWithMain.length} 個`);
      
      // 檢查這些產品中有多少沒有任何盒形 tag
      let uncategorized = 0;
      const uncategorizedProducts = [];
      
      for (const p of productsWithMain) {
        const productTagIds = p.tags.map(t => t.tagId);
        const hasBoxType = productTagIds.some(id => mappedTagIds.includes(id));
        if (!hasBoxType) {
          uncategorized++;
          uncategorizedProducts.push(p);
        }
      }
      
      console.log(`沒有盒形分類的產品: ${uncategorized} 個`);
      if (uncategorizedProducts.length > 0 && uncategorizedProducts.length <= 20) {
        console.log('\n未分類產品列表:');
        uncategorizedProducts.forEach(p => {
          console.log(`  - ${p.slug} | ${p.name_zh || p.name_en}`);
        });
      }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
