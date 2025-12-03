const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('=== 深入檢查還原可能性 ===\n');

    // 1. 檢查所有 schema
    const schemas = await prisma.$queryRawUnsafe(`
      SELECT schema_name FROM information_schema.schemata ORDER BY schema_name
    `);
    console.log('所有 Schema:', schemas.map(s => s.schema_name).join(', '));

    // 2. 檢查是否有備份相關表格
    const allTables = await prisma.$queryRawUnsafe(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename
    `);
    console.log('\n所有使用者表格:');
    allTables.forEach(t => console.log(`  ${t.schemaname}.${t.tablename}`));

    // 3. 檢查是否有 storage schema（Supabase 可能有備份）
    const storageCheck = await prisma.$queryRawUnsafe(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname = 'storage'
    `).catch(() => []);
    if (storageCheck.length) {
      console.log('\n Storage schema 表格:');
      storageCheck.forEach(t => console.log(`  ${t.tablename}`));
    }

    // 4. 檢查 auth schema
    const authCheck = await prisma.$queryRawUnsafe(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname = 'auth'
    `).catch(() => []);
    if (authCheck.length) {
      console.log('\n Auth schema 表格:');
      authCheck.forEach(t => console.log(`  ${t.tablename}`));
    }

    // 5. 檢查是否有 extensions
    const extensions = await prisma.$queryRawUnsafe(`
      SELECT extname, extversion FROM pg_extension
    `);
    console.log('\n已安裝的擴充功能:');
    extensions.forEach(e => console.log(`  ${e.extname} v${e.extversion}`));

    // 6. 檢查是否是 Supabase 託管
    const supabaseCheck = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_admin') as is_supabase
    `);
    console.log('\n是否為 Supabase:', supabaseCheck[0].is_supabase);

    // 7. 如果是 Supabase，檢查 dashboard 連結
    if (supabaseCheck[0].is_supabase) {
      console.log('\n⚠️  這是 Supabase 託管的資料庫！');
      console.log('   Supabase Pro 方案每天都有自動備份！');
      console.log('   請登入 Supabase Dashboard 檢查備份：');
      console.log('   https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/settings/backups');
      console.log('\n   或使用 Supabase CLI 還原：');
      console.log('   supabase db restore --target-timestamp "2025-12-03T07:00:00Z"');
    }

    // 8. 檢查最近的 DDL 操作
    const recentDDL = await prisma.$queryRawUnsafe(`
      SELECT query, calls, total_exec_time 
      FROM pg_stat_statements 
      WHERE query ILIKE '%DROP%' OR query ILIKE '%TRUNCATE%' OR query ILIKE '%force-reset%'
      ORDER BY total_exec_time DESC
      LIMIT 10
    `).catch(() => []);
    if (recentDDL.length) {
      console.log('\n最近的 DDL 操作（DROP/TRUNCATE）:');
      recentDDL.forEach(q => console.log(`  ${q.query.substring(0, 100)}...`));
    }

  } catch (error) {
    console.error('錯誤:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
