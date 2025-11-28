// scripts/migrate-tags-bilingual.js
// 將現有的 Tag 資料遷移到雙語欄位
// name -> name_zh, subtitle -> name_en

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function migrateTagsBilingual() {
  console.log("🏷️  開始遷移 Tag 雙語欄位...\n");

  // 取得所有 v2 tags
  const tags = await prisma.tag.findMany({
    where: { version: 2 },
  });

  console.log(`📦 找到 ${tags.length} 個 V2 Tags\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const tag of tags) {
    try {
      // 如果已經有 name_zh 和 name_en，跳過
      if (tag.name_zh && tag.name_en) {
        console.log(`⏭️  跳過: ${tag.name} (已有雙語資料)`);
        skipCount++;
        continue;
      }

      // 遷移邏輯:
      // - name_zh: 使用 name (中文名稱)
      // - name_en: 使用 subtitle (英文名稱)
      const updateData = {};
      
      if (!tag.name_zh && tag.name) {
        updateData.name_zh = tag.name;
      }
      
      if (!tag.name_en && tag.subtitle) {
        updateData.name_en = tag.subtitle;
      }

      if (Object.keys(updateData).length === 0) {
        console.log(`⚠️  無法遷移: ${tag.name} (缺少來源資料)`);
        skipCount++;
        continue;
      }

      await prisma.tag.update({
        where: { id: tag.id },
        data: updateData,
      });

      console.log(`✅ 已遷移: ${tag.name}`);
      console.log(`   name_zh: ${updateData.name_zh || tag.name_zh || "(已存在)"}`);
      console.log(`   name_en: ${updateData.name_en || tag.name_en || "(已存在)"}`);
      successCount++;
    } catch (error) {
      console.error(`❌ 遷移失敗: ${tag.name} - ${error.message}`);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 遷移統計:");
  console.log(`   成功: ${successCount} 個`);
  console.log(`   跳過: ${skipCount} 個`);
  console.log(`   失敗: ${errorCount} 個`);
  console.log("=".repeat(50));
}

migrateTagsBilingual()
  .catch((error) => {
    console.error("❌ 遷移失敗:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
