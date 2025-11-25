// scripts/check-translation-status.js
// 檢查產品翻譯狀態
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { version: 2 },
    select: {
      id: true,
      name: true,
      name_en: true,
      name_zh: true,
      shortDesc_en: true,
      shortDesc_zh: true,
      description_en: true,
      description_zh: true,
    },
  });

  console.log('\n📊 產品翻譯狀態檢查\n');
  console.log(`總共 ${products.length} 個產品\n`);

  let hasEnglish = 0;
  let hasChinese = 0;
  let needsTranslation = [];

  products.forEach(p => {
    const hasEn = p.name_en || p.shortDesc_en || p.description_en;
    const hasZh = p.name_zh || p.shortDesc_zh || p.description_zh;

    if (hasEn) hasEnglish++;
    if (hasZh) hasChinese++;

    if (hasEn && !hasZh) {
      needsTranslation.push(p);
    }

    const status = hasZh ? '✅' : '⚠️ ';
    console.log(`${status} ${p.name}`);
    if (hasEn && !hasZh) {
      console.log(`   → 有英文但缺中文翻譯`);
    }
  });

  console.log('\n📈 統計：');
  console.log(`   - 有英文內容：${hasEnglish} 個`);
  console.log(`   - 有中文內容：${hasChinese} 個`);
  console.log(`   - 需要翻譯：${needsTranslation.length} 個`);

  if (needsTranslation.length > 0) {
    console.log('\n💡 建議：執行以下命令自動翻譯：');
    console.log('   node scripts/translate-products.js');
  } else {
    console.log('\n🎉 所有產品都已有多語系內容！');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
