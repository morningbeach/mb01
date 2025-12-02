// scripts/check-fix-tags-bilingual.js
// 檢查並修復所有 Tag 的中英文欄位

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 常見標籤的中英對照表
const tagTranslations = {
  // 材質類
  "kraft-paper": { zh: "牛皮紙", en: "Kraft Paper" },
  "art-paper": { zh: "銅版紙", en: "Art Paper" },
  "special-paper": { zh: "特種紙", en: "Special Paper" },
  "corrugated": { zh: "瓦楞紙", en: "Corrugated" },
  "cardboard": { zh: "卡紙", en: "Cardboard" },
  "rigid-board": { zh: "硬紙板", en: "Rigid Board" },
  "paperboard": { zh: "紙板", en: "Paperboard" },
  "recycled": { zh: "再生紙", en: "Recycled Paper" },
  "fsc-certified": { zh: "FSC認證", en: "FSC Certified" },
  
  // 產品類型
  "gift-box": { zh: "禮盒", en: "Gift Box" },
  "packaging-box": { zh: "包裝盒", en: "Packaging Box" },
  "mailer-box": { zh: "郵寄盒", en: "Mailer Box" },
  "shipping-box": { zh: "運輸箱", en: "Shipping Box" },
  "display-box": { zh: "展示盒", en: "Display Box" },
  "drawer-box": { zh: "抽屜盒", en: "Drawer Box" },
  "magnetic-box": { zh: "磁吸盒", en: "Magnetic Box" },
  "rigid-box": { zh: "精裝盒", en: "Rigid Box" },
  "folding-box": { zh: "折疊盒", en: "Folding Box" },
  "paper-bag": { zh: "紙袋", en: "Paper Bag" },
  "shopping-bag": { zh: "購物袋", en: "Shopping Bag" },
  "tote-bag": { zh: "手提袋", en: "Tote Bag" },
  
  // 用途/行業
  "cosmetics": { zh: "化妝品", en: "Cosmetics" },
  "skincare": { zh: "護膚品", en: "Skincare" },
  "food": { zh: "食品", en: "Food" },
  "beverage": { zh: "飲料", en: "Beverage" },
  "wine": { zh: "紅酒", en: "Wine" },
  "tea": { zh: "茶葉", en: "Tea" },
  "coffee": { zh: "咖啡", en: "Coffee" },
  "chocolate": { zh: "巧克力", en: "Chocolate" },
  "jewelry": { zh: "珠寶", en: "Jewelry" },
  "watch": { zh: "手錶", en: "Watch" },
  "electronics": { zh: "電子產品", en: "Electronics" },
  "apparel": { zh: "服飾", en: "Apparel" },
  "fashion": { zh: "時尚", en: "Fashion" },
  "luxury": { zh: "奢侈品", en: "Luxury" },
  "premium": { zh: "高端", en: "Premium" },
  
  // 特性
  "eco-friendly": { zh: "環保", en: "Eco-Friendly" },
  "sustainable": { zh: "可持續", en: "Sustainable" },
  "biodegradable": { zh: "可生物降解", en: "Biodegradable" },
  "custom": { zh: "客製化", en: "Custom" },
  "customizable": { zh: "可客製", en: "Customizable" },
  "waterproof": { zh: "防水", en: "Waterproof" },
  "embossed": { zh: "壓紋", en: "Embossed" },
  "debossed": { zh: "凹印", en: "Debossed" },
  "foil-stamping": { zh: "燙金", en: "Foil Stamping" },
  "spot-uv": { zh: "局部UV", en: "Spot UV" },
  "matte": { zh: "霧面", en: "Matte" },
  "glossy": { zh: "亮面", en: "Glossy" },
  "laminated": { zh: "覆膜", en: "Laminated" },
  
  // 尺寸/規格
  "small": { zh: "小型", en: "Small" },
  "medium": { zh: "中型", en: "Medium" },
  "large": { zh: "大型", en: "Large" },
  "mini": { zh: "迷你", en: "Mini" },
  
  // 顏色
  "white": { zh: "白色", en: "White" },
  "black": { zh: "黑色", en: "Black" },
  "brown": { zh: "棕色", en: "Brown" },
  "kraft": { zh: "牛皮色", en: "Kraft" },
  "colorful": { zh: "彩色", en: "Colorful" },
  
  // 季節/節日
  "christmas": { zh: "聖誕節", en: "Christmas" },
  "new-year": { zh: "新年", en: "New Year" },
  "valentines": { zh: "情人節", en: "Valentine's Day" },
  "mothers-day": { zh: "母親節", en: "Mother's Day" },
  "wedding": { zh: "婚禮", en: "Wedding" },
  "birthday": { zh: "生日", en: "Birthday" },
  
  // 其他
  "bestseller": { zh: "熱銷", en: "Bestseller" },
  "new-arrival": { zh: "新品", en: "New Arrival" },
  "featured": { zh: "精選", en: "Featured" },
  "popular": { zh: "熱門", en: "Popular" },
  "trending": { zh: "流行", en: "Trending" },
  "sale": { zh: "特價", en: "Sale" },
  "limited": { zh: "限量", en: "Limited" },
};

// 檢測文字是否為中文
function isChinese(text) {
  if (!text) return false;
  return /[\u4e00-\u9fa5]/.test(text);
}

// 檢測文字是否為英文
function isEnglish(text) {
  if (!text) return false;
  return /^[a-zA-Z\s\-']+$/.test(text.trim());
}

async function checkAndFixTags() {
  console.log("開始檢查 Tag 的中英文欄位...\n");
  
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });
  
  console.log(`共找到 ${tags.length} 個 Tag\n`);
  
  const needsFix = [];
  const fixed = [];
  const manual = [];
  
  for (const tag of tags) {
    const issues = [];
    let updates = {};
    
    // 檢查 name_zh
    if (!tag.name_zh) {
      issues.push("缺少 name_zh");
      
      // 嘗試從對照表找翻譯
      if (tagTranslations[tag.slug]?.zh) {
        updates.name_zh = tagTranslations[tag.slug].zh;
      } else if (isChinese(tag.name)) {
        updates.name_zh = tag.name;
      }
    }
    
    // 檢查 name_en
    if (!tag.name_en) {
      issues.push("缺少 name_en");
      
      // 嘗試從對照表找翻譯
      if (tagTranslations[tag.slug]?.en) {
        updates.name_en = tagTranslations[tag.slug].en;
      } else if (isEnglish(tag.name)) {
        updates.name_en = tag.name;
      } else {
        // 從 slug 生成英文名稱
        const generatedEn = tag.slug
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        updates.name_en = generatedEn;
      }
    }
    
    if (issues.length > 0) {
      needsFix.push({
        id: tag.id,
        slug: tag.slug,
        name: tag.name,
        name_zh: tag.name_zh,
        name_en: tag.name_en,
        issues,
        updates,
      });
    }
  }
  
  console.log("=== 需要修復的 Tag ===\n");
  
  if (needsFix.length === 0) {
    console.log("✅ 所有 Tag 的中英文欄位都已完整！\n");
    return;
  }
  
  for (const item of needsFix) {
    console.log(`Tag: ${item.slug}`);
    console.log(`  現有: name="${item.name}", name_zh="${item.name_zh || "(空)"}", name_en="${item.name_en || "(空)"}"`);
    console.log(`  問題: ${item.issues.join(", ")}`);
    
    if (Object.keys(item.updates).length > 0) {
      console.log(`  修復: ${JSON.stringify(item.updates)}`);
      
      // 執行更新
      await prisma.tag.update({
        where: { id: item.id },
        data: item.updates,
      });
      
      fixed.push(item);
      console.log(`  ✅ 已修復`);
    } else {
      manual.push(item);
      console.log(`  ⚠️ 需要手動處理`);
    }
    console.log();
  }
  
  console.log("=== 修復摘要 ===");
  console.log(`總共檢查: ${tags.length} 個 Tag`);
  console.log(`需要修復: ${needsFix.length} 個`);
  console.log(`已自動修復: ${fixed.length} 個`);
  console.log(`需手動處理: ${manual.length} 個`);
  
  if (manual.length > 0) {
    console.log("\n=== 需手動處理的 Tag ===");
    manual.forEach(item => {
      console.log(`- ${item.slug}: ${item.issues.join(", ")}`);
    });
  }
}

checkAndFixTags()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
