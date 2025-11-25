// lib/seed-all-with-tags.ts - 完整種子資料（包含 TAG 關聯）
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAllWithTags() {
  console.log("🌱 開始完整種子資料寫入（含 TAG 關聯）...\n");

  // ===== 0. 清除舊的 ProductTag 關聯 =====
  console.log("📍 步驟 0/4: 清除舊的產品-TAG 關聯...");
  const v2Products = await prisma.product.findMany({ 
    where: { version: 2 },
    select: { id: true }
  });
  if (v2Products.length > 0) {
    await prisma.productTag.deleteMany({
      where: { productId: { in: v2Products.map(p => p.id) } }
    });
    console.log(`✓ 已清除 ${v2Products.length} 個產品的 TAG 關聯\n`);
  }

  // ===== 1. 先建立 TAG =====
  console.log("📍 步驟 1/4: 建立 TAG...");
  const { seedTagsV2 } = await import("./seed-tags-v2");
  await seedTagsV2();
  
  // 取得所有 TAG 的 ID 對應
  const tags = await prisma.tag.findMany({ where: { version: 2 } });
  const tagMap = new Map(tags.map(t => [t.slug, t.id]));
  console.log(`✓ 已建立 ${tags.length} 個 TAG\n`);

  // ===== 2. 建立產品並連結 TAG =====
  console.log("📍 步驟 2/4: 建立產品並連結 TAG...");
  
  // 清除舊產品
  await prisma.product.deleteMany({ where: { version: 2 } });
  
  const productsWithTags = [
    // 紙器包裝類
    {
      slug: "luxury-gift-box-a",
      name: "豪華禮品盒 A 型",
      category: "GIFT_BOX",
      shortDesc: "高級天地盒結構，適合高端禮品包裝",
      description: "採用進口特種紙，內襯絨布，磁吸式開合設計，提供極致的開箱體驗。",
      minQty: 500,
      priceHint: "NT$ 80-150 / 個",
      currency: "TWD",
      dimensions: "20 x 15 x 8 cm",
      leadTime: "15-20 工作天",
      materials: "特種紙、灰板、絨布內襯",
      notesForBuyer: "可客製化 LOGO 燙金/燙銀",
      originCountry: "台灣",
      status: "ACTIVE",
      version: 2,
      tagSlugs: ["heaven-earth-box", "special-paper", "velvet-lining", "magnetic-box", "hot-stamping", "luxury-gift", "jewelry-packaging", "premium-quality"]
    },
    {
      slug: "standard-gift-box-b",
      name: "標準禮品盒 B 型",
      category: "GIFT_BOX",
      shortDesc: "經濟實惠的天地盒方案",
      description: "標準規格天地盒，採用銅版紙印刷，內襯瓦楞紙保護。",
      minQty: 1000,
      priceHint: "NT$ 35-60 / 個",
      currency: "TWD",
      dimensions: "18 x 12 x 6 cm",
      leadTime: "10-15 工作天",
      materials: "銅版紙、瓦楞紙",
      notesForBuyer: "支援 4 色印刷",
      originCountry: "台灣",
      status: "ACTIVE",
      version: 2,
      tagSlugs: ["heaven-earth-box", "coated-paper", "food-packaging", "tea-packaging", "budget-friendly", "standard-size"]
    },
    {
      slug: "magnetic-flip-box",
      name: "磁吸掀蓋禮盒",
      category: "GIFT_BOX",
      shortDesc: "優雅的磁吸式掀蓋設計",
      description: "精緻磁吸掀蓋結構，開合順暢有質感。",
      minQty: 800,
      priceHint: "NT$ 90-180 / 個",
      currency: "TWD",
      dimensions: "25 x 18 x 10 cm",
      leadTime: "18-25 工作天",
      materials: "特種紙、灰板、磁鐵",
      notesForBuyer: "可客製化內部隔層",
      originCountry: "台灣",
      status: "ACTIVE",
      version: 2,
      tagSlugs: ["flip-lid-box", "magnetic-box", "special-paper", "cosmetic-packaging", "luxury-gift", "premium-quality"]
    },
    {
      slug: "tea-gift-box-single",
      name: "單罐茶葉禮盒",
      category: "GIFT_BOX",
      shortDesc: "專為茶葉設計的精品包裝",
      description: "專業茶葉包裝盒，內部尺寸精確配合標準茶葉罐。",
      minQty: 500,
      priceHint: "NT$ 50-90 / 個",
      currency: "TWD",
      dimensions: "10 x 10 x 12 cm",
      leadTime: "12-18 工作天",
      materials: "銅版紙、特種紙",
      notesForBuyer: "可搭配茶葉罐",
      originCountry: "台灣",
      status: "ACTIVE",
      version: 2,
      tagSlugs: ["tea-box", "tea-packaging", "coated-paper", "mid-range", "standard-size"]
    },
    {
      slug: "wine-box-double",
      name: "雙瓶裝酒盒",
      category: "GIFT_BOX",
      shortDesc: "雙瓶紅酒專用禮盒",
      description: "專為標準 750ml 紅酒瓶設計，內部採用 EVA 或瓦楞紙隔層。",
      minQty: 500,
      priceHint: "NT$ 120-220 / 個",
      currency: "TWD",
      dimensions: "35 x 18 x 10 cm",
      leadTime: "15-22 工作天",
      materials: "灰板、特種紙、EVA 內襯",
      notesForBuyer: "可加手提設計",
      originCountry: "台灣",
      status: "ACTIVE",
      version: 2,
      tagSlugs: ["wine-box", "wine-packaging", "eva-foam", "grey-board", "luxury-gift", "large-size"]
    },

    // 帆布袋類
    {
      slug: "canvas-flat-bag-standard",
      name: "標準帆布平面袋",
      category: "GIFT",
      shortDesc: "環保耐用的帆布提袋",
      description: "採用 12 安厚度純棉帆布，雙面印刷。",
      minQty: 300,
      priceHint: "NT$ 80-150 / 個",
      currency: "TWD",
      dimensions: "38 x 42 cm",
      leadTime: "10-15 工作天",
      materials: "12 安純棉帆布",
      notesForBuyer: "可網版印刷或數位印刷",
      originCountry: "台灣",
      status: "ACTIVE",
      version: 2,
      tagSlugs: ["canvas-bag", "flat-bag", "cotton-canvas", "screen-printing", "eco-friendly", "promotional", "corporate-gift", "standard-size"]
    },
    {
      slug: "canvas-tote-fashion",
      name: "時尚托特包",
      category: "GIFT",
      shortDesc: "大容量實用托特包",
      description: "加大尺寸設計，底部加寬加深。",
      minQty: 200,
      priceHint: "NT$ 120-200 / 個",
      currency: "TWD",
      dimensions: "40 x 35 x 12 cm",
      leadTime: "12-18 工作天",
      materials: "14 安純棉帆布",
      notesForBuyer: "可加內袋、拉鍊",
      originCountry: "台灣",
      status: "ACTIVE",
      version: 2,
      tagSlugs: ["canvas-bag", "tote-bag", "gusset-bag", "cotton-canvas", "eco-friendly", "event-merch", "large-size"]
    },
    {
      slug: "canvas-cosmetic-bag-small",
      name: "小型化妝包",
      category: "GIFT",
      shortDesc: "便攜式帆布化妝包",
      description: "精緻小巧的化妝包，內部防水處理。",
      minQty: 500,
      priceHint: "NT$ 45-80 / 個",
      currency: "TWD",
      dimensions: "20 x 15 x 8 cm",
      leadTime: "8-12 工作天",
      materials: "8 安帆布 + 防水內裡",
      notesForBuyer: "適合作為品牌贈品",
      originCountry: "台灣",
      status: "ACTIVE",
      version: 2,
      tagSlugs: ["canvas-bag", "cosmetic-pouch", "cotton-canvas", "corporate-gift", "small-size", "budget-friendly"]
    },

    // 3C 產品類
    {
      slug: "wireless-charger-premium",
      name: "高級無線充電器",
      category: "GIFT",
      shortDesc: "15W 快充無線充電盤",
      description: "支援 QI 無線充電標準，最高 15W 快充輸出。",
      minQty: 100,
      priceHint: "NT$ 350-600 / 個",
      currency: "TWD",
      dimensions: "10 x 10 x 0.8 cm",
      leadTime: "20-30 工作天",
      materials: "鋁合金、矽膠",
      notesForBuyer: "需要提供 LOGO 向量檔",
      originCountry: "中國",
      status: "ACTIVE",
      version: 2,
      tagSlugs: ["wireless-charger", "phone-accessory", "abs-plastic", "laser-engraving", "corporate-gift", "premium-quality"]
    },
    {
      slug: "mini-bluetooth-speaker",
      name: "迷你藍牙喇叭",
      category: "GIFT",
      shortDesc: "便攜式無線音響",
      description: "小巧輕便的藍牙音箱，支援藍牙 5.0 連接。",
      minQty: 200,
      priceHint: "NT$ 280-480 / 個",
      currency: "TWD",
      dimensions: "8 x 8 x 5 cm",
      leadTime: "25-35 工作天",
      materials: "ABS 塑膠、矽膠",
      notesForBuyer: "可選擇多種顏色",
      originCountry: "中國",
      status: "ACTIVE",
      version: 2,
      tagSlugs: ["bluetooth-speaker", "abs-plastic", "digital-printing", "corporate-gift", "event-merch", "mid-range"]
    },
    {
      slug: "wireless-bluetooth-keyboard",
      name: "無線藍牙鍵盤",
      category: "GIFT",
      shortDesc: "輕薄便攜無線鍵盤",
      description: "超薄設計，巧克力按鍵。",
      minQty: 100,
      priceHint: "NT$ 450-750 / 個",
      currency: "TWD",
      dimensions: "28 x 12 x 2 cm",
      leadTime: "30-40 工作天",
      materials: "ABS 塑膠",
      notesForBuyer: "支援多平台",
      originCountry: "中國",
      status: "ACTIVE",
      version: 2,
      tagSlugs: ["keyboard", "abs-plastic", "laser-engraving", "corporate-gift", "premium-quality"]
    },

    // 文具日用品
    {
      slug: "ceramic-coaster-round-set",
      name: "圓形陶瓷杯墊",
      category: "GIFT",
      shortDesc: "吸水陶瓷杯墊",
      description: "高品質陶瓷材質，吸水性佳。",
      minQty: 500,
      priceHint: "NT$ 35-65 / 個",
      currency: "TWD",
      dimensions: "直徑 10 cm x 0.5 cm",
      leadTime: "15-20 工作天",
      materials: "陶瓷、軟木",
      notesForBuyer: "可製作客製化禮盒",
      originCountry: "中國",
      status: "ACTIVE",
      version: 2,
      tagSlugs: ["coaster", "ceramic", "digital-printing", "corporate-gift", "budget-friendly", "standard-size"]
    },
    {
      slug: "led-makeup-mirror",
      name: "LED 化妝鏡",
      category: "GIFT",
      shortDesc: "觸控 LED 補光化妝鏡",
      description: "內建 LED 燈圈，三段亮度調節。",
      minQty: 200,
      priceHint: "NT$ 180-320 / 個",
      currency: "TWD",
      dimensions: "15 x 20 x 10 cm",
      leadTime: "25-35 工作天",
      materials: "ABS 塑膠、玻璃",
      notesForBuyer: "含 USB 充電線",
      originCountry: "中國",
      status: "ACTIVE",
      version: 2,
      tagSlugs: ["mirror", "abs-plastic", "digital-printing", "corporate-gift", "cosmetic-packaging", "mid-range"]
    },

    // 禮品組
    {
      slug: "corporate-gift-set-a",
      name: "企業禮品組 A",
      category: "GIFT_SET",
      shortDesc: "精選企業禮品三件組",
      description: "包含：無線充電器 + 藍牙喇叭 + 帆布托特包。",
      minQty: 50,
      priceHint: "NT$ 1,200-1,800 / 組",
      currency: "TWD",
      leadTime: "35-45 工作天",
      materials: "組合產品",
      notesForBuyer: "可單獨客製化各項產品",
      originCountry: "台灣/中國",
      status: "ACTIVE",
      version: 2,
      tagSlugs: ["corporate-gift", "luxury-gift", "premium-quality", "wireless-charger", "bluetooth-speaker", "canvas-bag"]
    },
  ];

  let productCount = 0;
  for (const prodData of productsWithTags) {
    const { tagSlugs, ...productData } = prodData;
    const tagIds = tagSlugs.map(slug => tagMap.get(slug)).filter(Boolean) as string[];
    
    const product = await prisma.product.create({
      data: {
        ...productData,
        tags: {
          create: tagIds.map(tagId => ({ tagId }))
        }
      }
    });
    console.log(`✓ ${product.name} (${tagIds.length} 個 TAG)`);
    productCount++;
  }
  console.log(`✓ 已建立 ${productCount} 個產品\n`);

  // ===== 3. 建立分類樹並設定 tagIds =====
  console.log("📍 步驟 3/4: 建立分類樹並設定 tagIds...");
  
  // 先建立基本分類樹
  const { seedCategoryTree } = await import("./seed-category-tree");
  await seedCategoryTree();
  
  // ===== 4. 更新葉節點的 tagIds =====
  console.log("📍 步驟 4/4: 更新分類節點的 tagIds...");
  
  const categoryTagMapping = [
    { slug: "heaven-earth-box-hardcover", tagSlugs: ["heaven-earth-box", "special-paper", "luxury-gift", "premium-quality"] },
    { slug: "flip-lid-box-hardcover", tagSlugs: ["flip-lid-box", "magnetic-box", "luxury-gift"] },
    { slug: "tea-box-hardcover", tagSlugs: ["tea-box", "tea-packaging"] },
    { slug: "wine-box-hardcover", tagSlugs: ["wine-box", "wine-packaging"] },
    { slug: "cosmetic-box-hardcover", tagSlugs: ["cosmetic-box", "cosmetic-packaging"] },
    { slug: "perfume-box-hardcover", tagSlugs: ["perfume-box", "cosmetic-packaging", "luxury-gift"] },
    { slug: "heaven-earth-box-softcover", tagSlugs: ["heaven-earth-box", "coated-paper", "budget-friendly"] },
    { slug: "calendar", tagSlugs: ["stationery", "promotional"] },
    { slug: "red-envelope", tagSlugs: ["stationery", "promotional"] },
    { slug: "manual", tagSlugs: ["stationery"] },
    { slug: "poster-book", tagSlugs: ["stationery", "promotional"] },
    { slug: "canvas-flat-bag", tagSlugs: ["canvas-bag", "flat-bag", "eco-friendly"] },
    { slug: "canvas-gusset-bag", tagSlugs: ["canvas-bag", "gusset-bag", "eco-friendly"] },
    { slug: "canvas-tote-bag", tagSlugs: ["canvas-bag", "tote-bag", "eco-friendly"] },
    { slug: "canvas-cosmetic-bag", tagSlugs: ["canvas-bag", "cosmetic-pouch"] },
    { slug: "canvas-other", tagSlugs: ["canvas-bag", "eco-friendly"] },
    { slug: "pvc-flat-bag", tagSlugs: ["pvc-bag", "flat-bag"] },
    { slug: "woven-flat-bag", tagSlugs: ["woven-bag", "flat-bag", "eco-friendly"] },
    { slug: "nonwoven-flat-bag", tagSlugs: ["nonwoven-bag", "flat-bag", "eco-friendly"] },
    { slug: "dupont-flat-bag", tagSlugs: ["tyvek-bag", "flat-bag", "eco-friendly"] },
    { slug: "chargers", tagSlugs: ["wireless-charger", "phone-accessory"] },
    { slug: "bluetooth-speakers", tagSlugs: ["bluetooth-speaker"] },
    { slug: "bluetooth-soundbox", tagSlugs: ["bluetooth-speaker"] },
    { slug: "keyboards", tagSlugs: ["keyboard"] },
    { slug: "phone-cases", tagSlugs: ["phone-accessory"] },
    { slug: "ceramic-coaster", tagSlugs: ["coaster", "ceramic"] },
    { slug: "silicone-coaster", tagSlugs: ["coaster"] },
    { slug: "makeup-mirror", tagSlugs: ["mirror"] },
  ];

  let nodeCount = 0;
  for (const mapping of categoryTagMapping) {
    const tagIds = mapping.tagSlugs.map(slug => tagMap.get(slug)).filter(Boolean) as string[];
    
    await prisma.categoryNode.updateMany({
      where: { slug: mapping.slug },
      data: { tagIds }
    });
    console.log(`✓ ${mapping.slug} (${tagIds.length} 個 TAG)`);
    nodeCount++;
  }
  console.log(`✓ 已更新 ${nodeCount} 個分類節點\n`);

  console.log("✅ 完整種子資料寫入完成！\n");
  console.log("📊 最終統計:");
  console.log(`   TAG: ${tags.length} 個`);
  console.log(`   產品: ${productCount} 個`);
  console.log(`   分類節點 (更新 tagIds): ${nodeCount} 個`);
}

if (require.main === module) {
  seedAllWithTags()
    .catch((error) => {
      console.error("❌ 種子資料寫入失敗:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedAllWithTags };
