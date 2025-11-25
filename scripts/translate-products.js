// scripts/translate-products.js
// 使用 OpenAI API 自動翻譯產品內容到中文
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 翻譯函數
async function translate(text, context = 'product_name') {
  if (!text || !text.trim()) return '';

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ 請在 .env.local 設定 OPENAI_API_KEY');
    process.exit(1);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Translate from English to Traditional Chinese. Only return the translated text.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error(`翻譯失敗: ${text.substring(0, 50)}...`, error.message);
    return text;
  }
}

// 延遲函數（避免 API rate limit）
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('🚀 開始自動翻譯產品到中文...\n');

  const products = await prisma.product.findMany({
    where: {
      version: 2,
      name_en: { not: null },
      name_zh: null, // 只翻譯還沒有中文的
    },
  });

  console.log(`找到 ${products.length} 個產品需要翻譯\n`);

  let translated = 0;
  let failed = 0;

  for (const product of products) {
    console.log(`\n📝 翻譯產品：${product.name_en}`);

    try {
      const translations = {};

      // 翻譯產品名稱
      if (product.name_en) {
        console.log('   - 翻譯名稱...');
        translations.name_zh = await translate(product.name_en, 'product_name');
        await delay(500); // 延遲 500ms
      }

      // 翻譯簡短描述
      if (product.shortDesc_en) {
        console.log('   - 翻譯簡述...');
        translations.shortDesc_zh = await translate(product.shortDesc_en, 'short_desc');
        await delay(500);
      }

      // 翻譯詳細描述
      if (product.description_en) {
        console.log('   - 翻譯描述...');
        translations.description_zh = await translate(product.description_en, 'product_description');
        await delay(500);
      }

      // 翻譯規格欄位（較短，可以快一點）
      if (product.dimensions_en) {
        translations.dimensions_zh = await translate(product.dimensions_en, 'specifications');
        await delay(300);
      }

      if (product.materials_en) {
        translations.materials_zh = await translate(product.materials_en, 'specifications');
        await delay(300);
      }

      if (product.leadTime_en) {
        translations.leadTime_zh = await translate(product.leadTime_en);
        await delay(300);
      }

      if (product.packagingInfo_en) {
        translations.packagingInfo_zh = await translate(product.packagingInfo_en);
        await delay(300);
      }

      if (product.unit_en) {
        translations.unit_zh = await translate(product.unit_en);
        await delay(300);
      }

      if (product.priceHint_en) {
        translations.priceHint_zh = await translate(product.priceHint_en);
        await delay(300);
      }

      // 更新資料庫
      await prisma.product.update({
        where: { id: product.id },
        data: translations,
      });

      console.log(`   ✅ 完成：${translations.name_zh}`);
      translated++;

    } catch (error) {
      console.error(`   ❌ 失敗：${error.message}`);
      failed++;
    }

    // 每個產品之間延遲 1 秒
    await delay(1000);
  }

  console.log('\n\n📊 翻譯完成！');
  console.log(`   - 成功：${translated} 個產品`);
  console.log(`   - 失敗：${failed} 個產品`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ 翻譯失敗:', e);
    prisma.$disconnect();
    process.exit(1);
  });
