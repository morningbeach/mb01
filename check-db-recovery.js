const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    // 檢查 PostgreSQL 設定
    const settings = await prisma.$queryRawUnsafe(`
      SELECT name, setting FROM pg_settings 
      WHERE name IN ('archive_mode', 'wal_level', 'log_statement', 'track_commit_timestamp')
    `);
    console.log('PostgreSQL 設定:');
    console.log(settings);

    // 檢查是否有 pg_stat_statements
    try {
      const stats = await prisma.$queryRawUnsafe(`SELECT * FROM pg_stat_statements LIMIT 5`);
      console.log('\n最近的 SQL 語句:', stats);
    } catch (e) {
      console.log('\npg_stat_statements 擴充功能未啟用');
    }

    // 檢查最近的活動
    const activity = await prisma.$queryRawUnsafe(`
      SELECT datname, usename, application_name, state, query_start, query
      FROM pg_stat_activity 
      WHERE datname = 'postgres'
      ORDER BY query_start DESC NULLS LAST
      LIMIT 10
    `);
    console.log('\n最近的資料庫活動:');
    console.log(activity);

  } finally {
    await prisma.$disconnect();
  }
}

main();
