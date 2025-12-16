const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function backupResearch() {
  const prisma = new PrismaClient();
  const backup = {};
  
  const tables = [
    'researchSession',
    'researchSource', 
    'researchModule',
    'researchConversation',
    'conversationMessage',
    'researchArticle',
    'researchLog',
    'moduleSourceRelation'
  ];
  
  console.log('📦 研究系統備份開始...');
  
  for (const table of tables) {
    try {
      backup[table] = await prisma[table].findMany();
      console.log(`✅ ${table}: ${backup[table].length} 筆`);
    } catch (e) {
      console.log(`⚠️  ${table}: 跳過 (${e.message})`);
    }
  }
  
  const today = new Date().toISOString().split('T')[0];
  const dir = path.join(__dirname, '..', 'db_backups', today);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const file = path.join(dir, 'research-backup.json');
  fs.writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`\n📁 備份完成: ${file}`);
  
  await prisma.$disconnect();
}

backupResearch().catch(console.error);
