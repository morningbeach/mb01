const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = path.join(__dirname, '..', 'db_backups');
  const backupFile = path.join(backupDir, `full_backup_${timestamp}.json`);

  // 確保備份目錄存在
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('開始備份資料庫...');
  
  try {
    const backup = {};

    // 備份所有表格
    console.log('備份 Products...');
    backup.products = await prisma.product.findMany();
    
    console.log('備份 Tags...');
    backup.tags = await prisma.tag.findMany();
    
    console.log('備份 ProductTags...');
    backup.productTags = await prisma.productTag.findMany();
    
    console.log('備份 CategoryNodes...');
    backup.categoryNodes = await prisma.categoryNode.findMany();
    
    console.log('備份 BlogPosts...');
    backup.blogPosts = await prisma.blogPost.findMany();
    
    console.log('備份 BlogTags...');
    backup.blogTags = await prisma.blogTag.findMany();
    
    console.log('備份 Pages...');
    backup.pages = await prisma.page.findMany();
    
    console.log('備份 AdminUsers...');
    backup.adminUsers = await prisma.adminUser.findMany();
    
    console.log('備份 FrontCategories...');
    backup.frontCategories = await prisma.frontCategory.findMany();
    
    console.log('備份 FrontCategoryTagGroups...');
    backup.frontCategoryTagGroups = await prisma.frontCategoryTagGroup.findMany();
    
    console.log('備份 GiftSets...');
    backup.giftSets = await prisma.giftSet.findMany();
    
    console.log('備份 GiftSetItems...');
    backup.giftSetItems = await prisma.giftSetItem.findMany();
    
    console.log('備份 ImageAssets...');
    backup.imageAssets = await prisma.imageAsset.findMany();
    
    console.log('備份 HomeSections...');
    backup.homeSections = await prisma.homeSection.findMany();
    
    console.log('備份 Images...');
    backup.images = await prisma.image.findMany();
    
    console.log('備份 Albums...');
    backup.albums = await prisma.album.findMany();
    
    console.log('備份 AlbumImages...');
    backup.albumImages = await prisma.albumImage.findMany();
    
    console.log('備份 ProductImages...');
    backup.productImages = await prisma.productImage.findMany();
    
    console.log('備份 SitePages...');
    backup.sitePages = await prisma.sitePage.findMany();
    
    console.log('備份 CaseProjects...');
    backup.caseProjects = await prisma.caseProject.findMany();
    
    console.log('備份 VirtualFolders...');
    backup.virtualFolders = await prisma.virtualFolder.findMany();
    
    console.log('備份 TrendReports...');
    backup.trendReports = await prisma.trendReport.findMany();

    // 統計
    const stats = {
      timestamp: new Date().toISOString(),
      counts: {}
    };
    
    for (const [key, value] of Object.entries(backup)) {
      stats.counts[key] = value.length;
    }
    
    backup._metadata = stats;

    // 寫入備份文件
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2), 'utf8');
    
    console.log('\n✅ 資料庫備份完成!');
    console.log(`📁 備份檔案: ${backupFile}`);
    console.log('\n📊 備份統計:');
    for (const [key, count] of Object.entries(stats.counts)) {
      console.log(`   ${key}: ${count} 筆`);
    }

  } catch (error) {
    console.error('❌ 備份失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase();
