const { PrismaClient } = require('@prisma/client');

async function testCatalogQuery() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== 測試 Catalog-tree 頁面查詢 ===');
    
    // 完全模擬 catalog-tree 頁面的查詢
    const visibleCategories = await prisma.categoryNode.findMany({
      where: {
        depth: 1,
        isActive: true,
        isHidden: false,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        children: {
          where: {
            isActive: true,
          },
        },
      },
    });
    
    console.log(`查詢結果總數: ${visibleCategories.length}`);
    
    // 檢查每個分類的基本資訊
    visibleCategories.forEach((cat, index) => {
      console.log(`\n${index + 1}. ${cat.name_zh}`);
      console.log(`   - slug: ${cat.slug}`);
      console.log(`   - coverImage: ${cat.coverImage}`);
      console.log(`   - heroImage: ${cat.heroImage}`);
      console.log(`   - 子分類數: ${cat.children.length}`);
    });
    
    // 檢查資料是否符合前端需求
    console.log('\n=== 前端相容性檢查 ===');
    const hasValidData = visibleCategories.length > 0 && 
                        visibleCategories.every(cat => 
                          cat.name_zh && 
                          cat.name_en && 
                          cat.slug
                        );
    
    console.log(`資料有效性: ${hasValidData ? '✓ 符合' : '✗ 不符合'}`);
    
  } catch (error) {
    console.error('查詢失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCatalogQuery();