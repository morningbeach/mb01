// 檢查並清理資料庫連線
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // 檢查連線數
    const connections = await prisma.$queryRawUnsafe(`
      SELECT count(*)::int as count 
      FROM pg_stat_activity 
      WHERE datname = 'postgres'
    `);
    console.log('目前連線數:', connections[0].count);
    
    // 終止閒置連線 (除了當前這個)
    const terminated = await prisma.$queryRawUnsafe(`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE datname = 'postgres' 
      AND state = 'idle' 
      AND pid <> pg_backend_pid()
    `);
    console.log('已終止閒置連線數:', terminated.length);
    
    // 再次檢查
    const after = await prisma.$queryRawUnsafe(`
      SELECT count(*)::int as count 
      FROM pg_stat_activity 
      WHERE datname = 'postgres'
    `);
    console.log('清理後連線數:', after[0].count);
    
  } catch (error) {
    console.error('錯誤:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
