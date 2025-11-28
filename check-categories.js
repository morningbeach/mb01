const { PrismaClient } = require('@prisma/client');

async function checkCategories() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== 檢查分類資料 ===');
    
    // 檢查總數
    const totalCount = await prisma.categoryNode.count();
    console.log(`總分類數量: ${totalCount}`);
    
    // 檢查第一層分類
    const firstLevelCount = await prisma.categoryNode.count({
      where: { depth: 1 }
    });
    console.log(`第一層分類數量: ${firstLevelCount}`);
    
    // 檢查啟用的第一層分類
    const activeFirstLevel = await prisma.categoryNode.count({
      where: { 
        depth: 1, 
        isActive: true,
        isHidden: false
      }
    });
    console.log(`啟用且顯示的第一層分類: ${activeFirstLevel}`);
    
    // 取得實際的第一層分類資料
    const categories = await prisma.categoryNode.findMany({
      where: {
        depth: 1,
        isActive: true,
        isHidden: false,
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        name_zh: true,
        name_en: true,
        slug: true,
        isActive: true,
        isHidden: true,
        depth: true,
        order: true
      }
    });
    
    console.log('\n=== 第一層分類詳細資料 ===');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name_zh} (${cat.name_en})`);
      console.log(`   - ID: ${cat.id}`);
      console.log(`   - Slug: ${cat.slug}`);
      console.log(`   - 深度: ${cat.depth}`);
      console.log(`   - 順序: ${cat.order}`);
      console.log(`   - 啟用: ${cat.isActive}`);
      console.log(`   - 隱藏: ${cat.isHidden}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('檢查失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();