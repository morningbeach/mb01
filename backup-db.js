const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function backup() {
  console.log('開始資料庫備份...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = 'db_backups';
  
  // 確保目錄存在
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  try {
    // 備份各個表
    console.log('正在讀取 products...');
    const products = await prisma.product.findMany({ 
      include: { ProductTag: { include: { Tag: true } } } 
    });
    
    console.log('正在讀取 tags...');
    const tags = await prisma.tag.findMany();
    
    console.log('正在讀取 filterDimensions...');
    const filterDimensions = await prisma.filterDimension.findMany();
    
    console.log('正在讀取 dimensionTagMappings...');
    const dimensionTagMappings = await prisma.dimensionTagMapping.findMany();
    
    console.log('正在讀取 categoryNodes...');
    const categoryNodes = await prisma.categoryNode.findMany();
    
    console.log('正在讀取 productTags...');
    const productTags = await prisma.productTag.findMany();
    
    const tables = {
      products,
      tags,
      filterDimensions,
      dimensionTagMappings,
      categoryNodes,
      productTags,
    };
    
    const filename = `${backupDir}/db_backup_${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(tables, null, 2));
    
    console.log('\n✅ 備份完成:', filename);
    console.log('統計:');
    console.log('  - Products:', products.length);
    console.log('  - Tags:', tags.length);
    console.log('  - FilterDimensions:', filterDimensions.length);
    console.log('  - DimensionTagMappings:', dimensionTagMappings.length);
    console.log('  - CategoryNodes:', categoryNodes.length);
    console.log('  - ProductTags:', productTags.length);
  } catch (e) {
    console.error('❌ 備份失敗:', e.message);
  }
  
  await prisma.$disconnect();
}

backup();
