const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function exportPageContent() {
  try {
    console.log('📖 正在導出頁面內容...');
    
    const pages = await prisma.sitePage.findMany({
      orderBy: { order: 'asc' }
    });
    
    console.log(`找到 ${pages.length} 個頁面`);
    
    for (const page of pages) {
      console.log('\n' + '='.repeat(60));
      console.log(`頁面: ${page.slug} (${page.type})`);
      console.log('='.repeat(60));
      
      console.log('\n【基本資訊】');
      console.log(`- 中文標題: ${page.title_zh || 'N/A'}`);
      console.log(`- 英文標題: ${page.title_en || 'N/A'}`);
      console.log(`- 中文描述: ${page.desc_zh || 'N/A'}`);
      console.log(`- 英文描述: ${page.desc_en || 'N/A'}`);
      console.log(`- 是否啟用: ${page.isEnabled}`);
      
      if (page.pageData) {
        console.log('\n【頁面內容 (pageData)】');
        console.log(JSON.stringify(page.pageData, null, 2));
      } else {
        console.log('\n【頁面內容】: 無');
      }
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportPageContent();