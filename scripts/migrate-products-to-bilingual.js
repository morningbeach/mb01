// scripts/migrate-products-to-bilingual.js
// 將現有產品資料遷移到多語系欄位
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 開始遷移產品資料到多語系欄位...\n');

  // 取得所有產品
  const products = await prisma.product.findMany({
    where: { version: 2 },
  });

  console.log(`找到 ${products.length} 個產品需要遷移\n`);

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    // 檢查是否已經有英文資料
    const hasEnglish = product.name_en || product.shortDesc_en || product.description_en;
    
    if (hasEnglish) {
      console.log(`⏭️  跳過：${product.name}（已有英文資料）`);
      skipped++;
      continue;
    }

    // 將現有資料複製到英文欄位
    const updateData = {
      name_en: product.name,
      shortDesc_en: product.shortDesc,
      description_en: product.description,
      dimensions_en: product.dimensions,
      materials_en: product.materials,
      leadTime_en: product.leadTime,
      packagingInfo_en: product.packagingInfo,
      unit_en: product.unit,
      notesForBuyer_en: product.notesForBuyer,
      originCountry_en: product.originCountry,
      priceHint_en: product.priceHint,
      seoTitle_en: product.seoTitle,
      seoDescription_en: product.seoDescription,
    };

    await prisma.product.update({
      where: { id: product.id },
      data: updateData,
    });

    console.log(`✅ 已遷移：${product.name}`);
    updated++;
  }

  console.log('\n📊 遷移完成！');
  console.log(`   - 已更新：${updated} 個產品`);
  console.log(`   - 已跳過：${skipped} 個產品`);
  console.log('\n💡 下一步：執行 node scripts/translate-products.js 自動翻譯成中文');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ 遷移失敗:', e);
    prisma.$disconnect();
    process.exit(1);
  });
