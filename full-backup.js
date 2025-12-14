// full-backup.js - 完整備份腳本（程式碼 + 資料庫）
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function backupDatabase() {
  const date = new Date().toISOString().split('T')[0];
  const backupDir = path.join(__dirname, 'db_backups', date);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('='.repeat(60));
  console.log('📦 MB01 完整備份');
  console.log('日期:', date);
  console.log('='.repeat(60));

  // 1. 備份所有資料表
  const tables = [
    'Product',
    'Tag',
    'Dimension', 
    'DimensionValue',
    'Image',
    'SiteSetting',
    'BlogPost',
    'Case',
    'ContactButton',
    'AdminSession',
    'VirtualFolder',
    'AiUsageLog',
  ];

  const backup = {
    backupDate: new Date().toISOString(),
    version: '1.0',
    tables: {}
  };

  for (const table of tables) {
    try {
      const tableName = table.charAt(0).toLowerCase() + table.slice(1);
      const data = await prisma[tableName].findMany();
      backup.tables[table] = {
        count: data.length,
        data: data
      };
      console.log(`✅ ${table}: ${data.length} 筆`);
    } catch (error) {
      console.log(`⚠️  ${table}: 跳過 (${error.message})`);
    }
  }

  // 2. 備份關聯表
  try {
    // Product-Tag 關聯
    const productTags = await prisma.$queryRaw`
      SELECT * FROM "_ProductToTag"
    `;
    backup.tables['_ProductToTag'] = {
      count: productTags.length,
      data: productTags
    };
    console.log(`✅ _ProductToTag: ${productTags.length} 筆`);
  } catch (e) {
    console.log('⚠️  _ProductToTag: 跳過');
  }

  try {
    // Product-DimensionValue 關聯
    const productDimValues = await prisma.$queryRaw`
      SELECT * FROM "_DimensionValueToProduct"
    `;
    backup.tables['_DimensionValueToProduct'] = {
      count: productDimValues.length,
      data: productDimValues
    };
    console.log(`✅ _DimensionValueToProduct: ${productDimValues.length} 筆`);
  } catch (e) {
    console.log('⚠️  _DimensionValueToProduct: 跳過');
  }

  // 3. 寫入備份檔案
  const backupFile = path.join(backupDir, 'database-backup.json');
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  console.log(`\n📁 資料庫備份已儲存: ${backupFile}`);

  // 4. 統計摘要
  const stats = {
    totalProducts: backup.tables.Product?.count || 0,
    totalTags: backup.tables.Tag?.count || 0,
    totalDimensions: backup.tables.Dimension?.count || 0,
    totalDimensionValues: backup.tables.DimensionValue?.count || 0,
    totalImages: backup.tables.Image?.count || 0,
    totalBlogPosts: backup.tables.BlogPost?.count || 0,
    totalCases: backup.tables.Case?.count || 0,
  };

  const statsFile = path.join(backupDir, 'backup-stats.json');
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));

  console.log('\n📊 備份統計:');
  console.log(`   - 產品: ${stats.totalProducts}`);
  console.log(`   - 標籤: ${stats.totalTags}`);
  console.log(`   - 維度: ${stats.totalDimensions}`);
  console.log(`   - 維度值: ${stats.totalDimensionValues}`);
  console.log(`   - 圖片: ${stats.totalImages}`);
  console.log(`   - 部落格: ${stats.totalBlogPosts}`);
  console.log(`   - 案例: ${stats.totalCases}`);

  return backupDir;
}

async function main() {
  try {
    const backupDir = await backupDatabase();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 備份完成!');
    console.log('📂 備份位置:', backupDir);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ 備份失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
