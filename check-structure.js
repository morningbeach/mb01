const { PrismaClient } = require('@prisma/client');

async function checkCategoriesStructure() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== 檢查分類資料結構 ===');
    
    // 模擬 catalog-tree 頁面的查詢
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
    
    console.log('查詢結果數量:', visibleCategories.length);
    console.log('\n=== 詳細資料結構 ===');
    
    visibleCategories.forEach((category, index) => {
      console.log(`\n${index + 1}. 分類: ${category.name_zh}`);
      console.log('   完整資料:');
      console.log(JSON.stringify(category, null, 2));
    });
    
  } catch (error) {
    console.error('檢查失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategoriesStructure();