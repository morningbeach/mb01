const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    // 列出所有資料表
    const tables = await prisma.$queryRawUnsafe(`
      SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename
    `);
    console.log('目前資料庫中的資料表:');
    console.log(tables);

    // 檢查各資料表的資料筆數
    console.log('\n各資料表資料筆數:');
    
    const counts = {};
    for (const t of tables) {
      const name = t.tablename;
      try {
        const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${name}"`);
        counts[name] = Number(result[0].count);
      } catch (e) {
        counts[name] = 'error';
      }
    }
    console.log(counts);

  } finally {
    await prisma.$disconnect();
  }
}

main();
