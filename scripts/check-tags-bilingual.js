// scripts/check-tags-bilingual.js
// 檢查並修復 Tag 的中英文欄位

require('dotenv').config();

const { PrismaClient } = require("@prisma/client");

// 處理自簽憑證
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const prisma = new PrismaClient();

// 常見 Tag 的中英文對照表
const tagTranslations = {
  // 材質類
  "kraft-paper": { zh: "牛皮紙", en: "Kraft Paper" },
  "cardboard": { zh: "卡紙", en: "Cardboard" },
  "corrugated": { zh: "瓦楞紙", en: "Corrugated" },
  "rigid-box": { zh: "硬紙盒", en: "Rigid Box" },
  "art-paper": { zh: "銅版紙", en: "Art Paper" },
  "specialty-paper": { zh: "特種紙", en: "Specialty Paper" },
  "recycled": { zh: "再生紙", en: "Recycled Paper" },
  "plastic": { zh: "塑膠", en: "Plastic" },
  "wood": { zh: "木質", en: "Wood" },
  "fabric": { zh: "布料", en: "Fabric" },
  "leather": { zh: "皮革", en: "Leather" },
  "metal": { zh: "金屬", en: "Metal" },
  "acrylic": { zh: "壓克力", en: "Acrylic" },
  
  // 產品類型
  "gift-box": { zh: "禮盒", en: "Gift Box" },
  "packaging-box": { zh: "包裝盒", en: "Packaging Box" },
  "mailer-box": { zh: "郵寄盒", en: "Mailer Box" },
  "display-box": { zh: "展示盒", en: "Display Box" },
  "folding-box": { zh: "折疊盒", en: "Folding Box" },
  "drawer-box": { zh: "抽屜盒", en: "Drawer Box" },
  "magnetic-box": { zh: "磁吸盒", en: "Magnetic Box" },
  "sleeve-box": { zh: "天地蓋", en: "Sleeve Box" },
  "book-box": { zh: "書型盒", en: "Book Style Box" },
  "window-box": { zh: "開窗盒", en: "Window Box" },
  "tube-box": { zh: "圓筒盒", en: "Tube Box" },
  "pillow-box": { zh: "枕頭盒", en: "Pillow Box" },
  "bag": { zh: "紙袋", en: "Paper Bag" },
  "pouch": { zh: "袋子", en: "Pouch" },
  "insert": { zh: "內襯", en: "Insert" },
  "tray": { zh: "托盤", en: "Tray" },
  
  // 用途類
  "cosmetics": { zh: "化妝品", en: "Cosmetics" },
  "jewelry": { zh: "珠寶", en: "Jewelry" },
  "food": { zh: "食品", en: "Food" },
  "electronics": { zh: "電子產品", en: "Electronics" },
  "apparel": { zh: "服飾", en: "Apparel" },
  "wine": { zh: "紅酒", en: "Wine" },
  "tea": { zh: "茶葉", en: "Tea" },
  "coffee": { zh: "咖啡", en: "Coffee" },
  "chocolate": { zh: "巧克力", en: "Chocolate" },
  "candle": { zh: "蠟燭", en: "Candle" },
  "perfume": { zh: "香水", en: "Perfume" },
  "watch": { zh: "手錶", en: "Watch" },
  "glasses": { zh: "眼鏡", en: "Glasses" },
  "shoes": { zh: "鞋類", en: "Shoes" },
  "luxury": { zh: "奢侈品", en: "Luxury" },
  "corporate": { zh: "企業禮品", en: "Corporate Gift" },
  "wedding": { zh: "婚禮", en: "Wedding" },
  "holiday": { zh: "節日", en: "Holiday" },
  "christmas": { zh: "聖誕節", en: "Christmas" },
  "chinese-new-year": { zh: "農曆新年", en: "Chinese New Year" },
  "moon-festival": { zh: "中秋節", en: "Moon Festival" },
  "valentines": { zh: "情人節", en: "Valentine's Day" },
  
  // 特色類
  "eco-friendly": { zh: "環保", en: "Eco-Friendly" },
  "sustainable": { zh: "永續", en: "Sustainable" },
  "premium": { zh: "高端", en: "Premium" },
  "custom": { zh: "客製化", en: "Custom" },
  "hot-stamping": { zh: "燙金", en: "Hot Stamping" },
  "embossing": { zh: "浮雕", en: "Embossing" },
  "debossing": { zh: "壓印", en: "Debossing" },
  "uv-coating": { zh: "UV印刷", en: "UV Coating" },
  "matte": { zh: "霧面", en: "Matte" },
  "glossy": { zh: "亮面", en: "Glossy" },
  "spot-uv": { zh: "局部上光", en: "Spot UV" },
  "foil": { zh: "燙箔", en: "Foil" },
  "ribbon": { zh: "緞帶", en: "Ribbon" },
  "magnetic-closure": { zh: "磁扣", en: "Magnetic Closure" },
  "die-cut": { zh: "刀模", en: "Die Cut" },
  "printing": { zh: "印刷", en: "Printing" },
  "full-color": { zh: "全彩", en: "Full Color" },
  
  // 尺寸類
  "small": { zh: "小型", en: "Small" },
  "medium": { zh: "中型", en: "Medium" },
  "large": { zh: "大型", en: "Large" },
  "mini": { zh: "迷你", en: "Mini" },
  
  // 其他常見
  "new": { zh: "新品", en: "New" },
  "bestseller": { zh: "熱銷", en: "Bestseller" },
  "popular": { zh: "熱門", en: "Popular" },
  "featured": { zh: "精選", en: "Featured" },
  "sale": { zh: "特價", en: "Sale" },
  "limited": { zh: "限量", en: "Limited" },
};

async function checkAndFixTags() {
  console.log("🏷️  檢查 Tag 雙語欄位...\n");

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });

  console.log(`📦 找到 ${tags.length} 個 Tags\n`);
  console.log("=".repeat(80));

  const missingTranslations = [];
  let needsUpdateCount = 0;
  let alreadyCompleteCount = 0;

  for (const tag of tags) {
    const hasZh = tag.name_zh && tag.name_zh.trim() !== "";
    const hasEn = tag.name_en && tag.name_en.trim() !== "";

    if (hasZh && hasEn) {
      console.log(`✅ ${tag.slug.padEnd(25)} | 中: ${tag.name_zh.padEnd(15)} | 英: ${tag.name_en}`);
      alreadyCompleteCount++;
    } else {
      // 嘗試從對照表找翻譯
      const translation = tagTranslations[tag.slug];
      
      if (translation) {
        // 有翻譯，準備更新
        const updateData = {};
        if (!hasZh) updateData.name_zh = translation.zh;
        if (!hasEn) updateData.name_en = translation.en;

        await prisma.tag.update({
          where: { id: tag.id },
          data: updateData,
        });

        console.log(`🔧 ${tag.slug.padEnd(25)} | 中: ${translation.zh.padEnd(15)} | 英: ${translation.en} (已修復)`);
        needsUpdateCount++;
      } else {
        // 沒有翻譯，記錄下來
        console.log(`⚠️  ${tag.slug.padEnd(25)} | 中: ${(tag.name_zh || "❌缺少").padEnd(15)} | 英: ${tag.name_en || "❌缺少"}`);
        missingTranslations.push({
          id: tag.id,
          slug: tag.slug,
          name: tag.name,
          name_zh: tag.name_zh,
          name_en: tag.name_en,
        });
      }
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n📊 統計:");
  console.log(`   完整: ${alreadyCompleteCount} 個`);
  console.log(`   已修復: ${needsUpdateCount} 個`);
  console.log(`   待處理: ${missingTranslations.length} 個`);

  if (missingTranslations.length > 0) {
    console.log("\n⚠️  以下 Tag 需要手動補充翻譯:\n");
    for (const tag of missingTranslations) {
      console.log(`   "${tag.slug}": { zh: "${tag.name_zh || tag.name || ""}", en: "${tag.name_en || ""}" },`);
    }
  }

  console.log("\n" + "=".repeat(80));
}

checkAndFixTags()
  .catch((error) => {
    console.error("❌ 檢查失敗:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
