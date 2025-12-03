const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    // 檢查資料庫是否有 pg_basebackup 或自動備份
    console.log('=== 檢查 PostgreSQL 還原可能性 ===\n');

    // 1. 檢查是否啟用 PITR
    const walSettings = await prisma.$queryRawUnsafe(`
      SELECT name, setting, short_desc 
      FROM pg_settings 
      WHERE name IN ('archive_mode', 'archive_command', 'restore_command', 'recovery_target_time', 'wal_level', 'max_wal_senders')
    `);
    console.log('WAL 相關設定:');
    walSettings.forEach(s => console.log(`  ${s.name}: ${s.setting}`));

    // 2. 檢查是否有還原點
    const restorePoints = await prisma.$queryRawUnsafe(`
      SELECT name, lsn, time FROM pg_catalog.pg_stat_recovery_prefetch LIMIT 5
    `).catch(() => null);
    if (restorePoints) {
      console.log('\n還原點:', restorePoints);
    }

    // 3. 檢查最近的 WAL 檔案
    const walFiles = await prisma.$queryRawUnsafe(`
      SELECT pg_walfile_name(pg_current_wal_lsn()) as current_wal,
             pg_current_wal_lsn() as current_lsn
    `);
    console.log('\n當前 WAL 位置:', walFiles);

    // 4. 檢查是否有其他 schema 可能有備份
    const schemas = await prisma.$queryRawUnsafe(`
      SELECT schema_name FROM information_schema.schemata
    `);
    console.log('\n所有 Schema:', schemas.map(s => s.schema_name));

    // 5. 檢查是否有 _prisma_migrations 表（可能有歷史記錄）
    const migrations = await prisma.$queryRawUnsafe(`
      SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 10
    `).catch(() => []);
    if (migrations.length) {
      console.log('\n最近的 Prisma migrations:');
      migrations.forEach(m => console.log(`  ${m.migration_name} - ${m.finished_at}`));
    }

    // 6. 嘗試檢查是否有表格快照或歷史資料
    const tables = await prisma.$queryRawUnsafe(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename
    `);
    console.log('\n所有使用者表格:');
    tables.forEach(t => console.log(`  ${t.schemaname}.${t.tablename}`));

    // 7. 檢查伺服器上是否有備份目錄
    const dataDir = await prisma.$queryRawUnsafe(`
      SELECT setting as data_directory FROM pg_settings WHERE name = 'data_directory'
    `);
    console.log('\n資料目錄:', dataDir[0]?.data_directory);

  } catch (error) {
    console.error('錯誤:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
