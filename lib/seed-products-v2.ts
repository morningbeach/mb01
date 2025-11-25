// lib/seed-products-v2.ts - V2 版本產品假資料
import { PrismaClient, Category, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

// V2 產品假資料
const productsV2 = [
  // 紙器包裝類
  {
    slug: "luxury-gift-box-a",
    sku: "GB-LUX-A001",
    name: "豪華禮品盒 A 型",
    category: "GIFT_BOX" as Category,
    shortDesc: "高級天地盒結構，適合高端禮品包裝",
    description: "採用進口特種紙，內襯絨布，磁吸式開合設計，提供極致的開箱體驗。適合珠寶、手錶、高端化妝品等貴重禮品包裝。",
    minQty: 500,
    priceHint: "NT$ 80-150 / 個",
    currency: "TWD",
    dimensions: "20 x 15 x 8 cm",
    leadTime: "15-20 工作天",
    materials: "特種紙、灰板、絨布內襯",
    notesForBuyer: "可客製化 LOGO 燙金/燙銀，最低起訂量 500 個",
    originCountry: "台灣",
    status: "ACTIVE" as ProductStatus,
    version: 2,
  },
  {
    slug: "standard-gift-box-b",
    sku: "GB-STD-B002",
    name: "標準禮品盒 B 型",
    category: "GIFT_BOX" as Category,
    shortDesc: "經濟實惠的天地盒方案",
    description: "標準規格天地盒，採用銅版紙印刷，內襯瓦楞紙保護。適合一般禮品、茶葉、糕點等產品包裝。性價比高，交期快速。",
    minQty: 1000,
    priceHint: "NT$ 35-60 / 個",
    currency: "TWD",
    dimensions: "18 x 12 x 6 cm",
    leadTime: "10-15 工作天",
    materials: "銅版紙、瓦楞紙",
    notesForBuyer: "支援 4 色印刷，可加上光、霧膜",
    originCountry: "台灣",
    status: "ACTIVE" as ProductStatus,
    version: 2,
  },
  {
    slug: "magnetic-flip-box",
    sku: "GB-MAG-003",
    name: "磁吸掀蓋禮盒",
    category: "GIFT_BOX" as Category,
    shortDesc: "優雅的磁吸式掀蓋設計",
    description: "精緻磁吸掀蓋結構，開合順暢有質感。內部可訂製多種隔層設計，適合化妝品套組、茶葉禮盒等多件組合產品。",
    minQty: 800,
    priceHint: "NT$ 90-180 / 個",
    currency: "TWD",
    dimensions: "25 x 18 x 10 cm",
    leadTime: "18-25 工作天",
    materials: "特種紙、灰板、磁鐵",
    notesForBuyer: "可客製化內部隔層設計",
    originCountry: "台灣",
    status: "ACTIVE" as ProductStatus,
    version: 2,
  },
  {
    slug: "tea-gift-box-single",
    sku: "GB-TEA-004",
    name: "單罐茶葉禮盒",
    category: "GIFT_BOX" as Category,
    shortDesc: "專為茶葉設計的精品包裝",
    description: "專業茶葉包裝盒，內部尺寸精確配合標準茶葉罐。可選擇天地盒或翻蓋式結構，提供完整的品牌形象展示空間。",
    minQty: 500,
    priceHint: "NT$ 50-90 / 個",
    currency: "TWD",
    dimensions: "10 x 10 x 12 cm",
    leadTime: "12-18 工作天",
    materials: "銅版紙、特種紙",
    notesForBuyer: "可搭配茶葉罐一起訂購",
    originCountry: "台灣",
    status: "ACTIVE" as ProductStatus,
    version: 2,
  },
  {
    slug: "wine-box-double",
    sku: "GB-WINE-005",
    name: "雙瓶裝酒盒",
    category: "GIFT_BOX" as Category,
    shortDesc: "雙瓶紅酒專用禮盒",
    description: "專為標準 750ml 紅酒瓶設計，內部採用 EVA 或瓦楞紙隔層，確保運輸安全。外觀可選擇多種材質和印刷工藝。",
    minQty: 500,
    priceHint: "NT$ 120-220 / 個",
    currency: "TWD",
    dimensions: "35 x 18 x 10 cm",
    leadTime: "15-22 工作天",
    materials: "灰板、特種紙、EVA 內襯",
    notesForBuyer: "可加手提設計，適合送禮",
    originCountry: "台灣",
    status: "ACTIVE" as ProductStatus,
    version: 2,
  },

  // 帆布袋類
  {
    slug: "canvas-flat-bag-standard",
    sku: "CV-FLAT-006",
    name: "標準帆布平面袋",
    category: "GIFT" as Category,
    shortDesc: "環保耐用的帆布提袋",
    description: "採用 12 安厚度純棉帆布，雙面印刷，手提把牢固耐用。適合企業禮贈品、活動宣傳、環保購物袋等用途。",
    minQty: 300,
    priceHint: "NT$ 80-150 / 個",
    currency: "TWD",
    dimensions: "38 x 42 cm",
    leadTime: "10-15 工作天",
    materials: "12 安純棉帆布",
    notesForBuyer: "可網版印刷或數位印刷",
    originCountry: "台灣",
    status: "ACTIVE" as ProductStatus,
    version: 2,
  },
  {
    slug: "canvas-tote-fashion",
    sku: "CV-TOTE-007",
    name: "時尚托特包",
    category: "GIFT" as Category,
    shortDesc: "大容量實用托特包",
    description: "加大尺寸設計，底部加寬加深，可容納 A4 文件、筆電等物品。適合日常通勤、購物使用。手提加肩背雙用設計。",
    minQty: 200,
    priceHint: "NT$ 120-200 / 個",
    currency: "TWD",
    dimensions: "40 x 35 x 12 cm",
    leadTime: "12-18 工作天",
    materials: "14 安純棉帆布",
    notesForBuyer: "可加內袋、拉鍊等配件",
    originCountry: "台灣",
    status: "ACTIVE" as ProductStatus,
    version: 2,
  },
  {
    slug: "canvas-cosmetic-bag-small",
    sku: "CV-COSM-008",
    name: "小型化妝包",
    category: "GIFT" as Category,
    shortDesc: "便攜式帆布化妝包",
    description: "精緻小巧的化妝包，內部防水處理，拉鍊開合方便。適合放置化妝品、保養品小樣、隨身小物等。",
    minQty: 500,
    priceHint: "NT$ 45-80 / 個",
    currency: "TWD",
    dimensions: "20 x 15 x 8 cm",
    leadTime: "8-12 工作天",
    materials: "8 安帆布 + 防水內裡",
    notesForBuyer: "適合作為品牌贈品",
    originCountry: "台灣",
    status: "ACTIVE" as ProductStatus,
    version: 2,
  },

  // 3C 產品類
  {
    slug: "wireless-charger-premium",
    sku: "3C-CHRG-009",
    name: "高級無線充電器",
    category: "GIFT" as Category,
    shortDesc: "15W 快充無線充電盤",
    description: "支援 QI 無線充電標準，最高 15W 快充輸出。鋁合金外殼，防滑矽膠底座，內建散熱風扇。支援客製化 LOGO 雷雕。",
    minQty: 100,
    priceHint: "NT$ 350-600 / 個",
    currency: "TWD",
    dimensions: "10 x 10 x 0.8 cm",
    leadTime: "20-30 工作天",
    materials: "鋁合金、矽膠",
    notesForBuyer: "需要提供 LOGO 向量檔",
    originCountry: "中國",
    status: "ACTIVE" as ProductStatus,
    version: 2,
  },
  {
    slug: "mini-bluetooth-speaker",
    sku: "3C-SPKR-010",
    name: "迷你藍牙喇叭",
    category: "GIFT" as Category,
    shortDesc: "便攜式無線音響",
    description: "小巧輕便的藍牙音箱，支援藍牙 5.0 連接，續航力 8 小時。可客製化外殼印刷或雷雕 LOGO。音質清晰，適合戶外使用。",
    minQty: 200,
    priceHint: "NT$ 280-480 / 個",
    currency: "TWD",
    dimensions: "8 x 8 x 5 cm",
    leadTime: "25-35 工作天",
    materials: "ABS 塑膠、矽膠",
    notesForBuyer: "可選擇多種顏色",
    originCountry: "中國",
    status: "ACTIVE" as ProductStatus,
    version: 2,
  },
  {
    slug: "wireless-bluetooth-keyboard",
    sku: "3C-KEYB-011",
    name: "無線藍牙鍵盤",
    category: "GIFT" as Category,
    shortDesc: "輕薄便攜無線鍵盤",
    description: "超薄設計，巧克力按鍵，打字舒適安靜。支援多設備切換，續航力達 3 個月。可客製化鍵帽或外殼 LOGO。",
    minQty: 100,
    priceHint: "NT$ 450-750 / 個",
    currency: "TWD",
    dimensions: "28 x 12 x 2 cm",
    leadTime: "30-40 工作天",
    materials: "ABS 塑膠",
    notesForBuyer: "支援 Windows/Mac/iOS/Android",
    originCountry: "中國",
    status: "ACTIVE" as ProductStatus,
    version: 2,
  },

  // 文具日用品
  {
    slug: "ceramic-coaster-round-set",
    sku: "HW-COST-012",
    name: "圓形陶瓷杯墊",
    category: "GIFT" as Category,
    shortDesc: "吸水陶瓷杯墊",
    description: "高品質陶瓷材質，吸水性佳，底部軟木防滑。可客製化全彩印刷圖案或 LOGO。適合企業贈品、紀念品等用途。",
    minQty: 500,
    priceHint: "NT$ 35-65 / 個",
    currency: "TWD",
    dimensions: "直徑 10 cm x 0.5 cm",
    leadTime: "15-20 工作天",
    materials: "陶瓷、軟木",
    notesForBuyer: "可製作客製化禮盒包裝",
    originCountry: "中國",
    status: "ACTIVE" as ProductStatus,
    version: 2,
  },
  {
    slug: "led-makeup-mirror",
    sku: "HW-MIRR-013",
    name: "LED 化妝鏡",
    category: "GIFT" as Category,
    shortDesc: "觸控 LED 補光化妝鏡",
    description: "內建 LED 燈圈，三段亮度調節，觸控開關。可 360 度旋轉，USB 充電式。外殼可客製化印刷 LOGO，適合美妝品牌贈品。",
    minQty: 200,
    priceHint: "NT$ 180-320 / 個",
    currency: "TWD",
    dimensions: "15 x 20 x 10 cm",
    leadTime: "25-35 工作天",
    materials: "ABS 塑膠、玻璃",
    notesForBuyer: "含 USB 充電線",
    originCountry: "中國",
    status: "ACTIVE" as ProductStatus,
    version: 2,
  },

  // 禮品組
  {
    slug: "corporate-gift-set-a",
    sku: "SET-CORP-A014",
    name: "企業禮品組 A",
    category: "GIFT_SET" as Category,
    shortDesc: "精選企業禮品三件組",
    description: "包含：無線充電器 + 藍牙喇叭 + 帆布托特包，統一品牌視覺設計。附精美禮盒包裝，適合企業年節送禮、VIP 客戶贈禮。",
    minQty: 50,
    priceHint: "NT$ 1,200-1,800 / 組",
    currency: "TWD",
    leadTime: "35-45 工作天",
    materials: "組合產品",
    notesForBuyer: "可單獨客製化各項產品 LOGO",
    originCountry: "台灣/中國",
    status: "ACTIVE" as ProductStatus,
    version: 2,
  },
];

async function seedProductsV2() {
  console.log("🌱 開始寫入 V2 產品假資料...\n");

  // 先刪除 V2 產品的所有 ProductTag 關聯
  const v2ProductIds = await prisma.product.findMany({
    where: { version: 2 },
    select: { id: true },
  });
  
  if (v2ProductIds.length > 0) {
    await prisma.productTag.deleteMany({
      where: { productId: { in: v2ProductIds.map(p => p.id) } },
    });
    console.log(`🗑️  已清除 V2 產品的 Tag 關聯\n`);
  }

  // 清除現有 V2 產品
  const deleted = await prisma.product.deleteMany({
    where: { version: 2 },
  });
  console.log(`🗑️  已清除 ${deleted.count} 個舊 V2 產品\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const productData of productsV2) {
    try {
      const product = await prisma.product.create({
        data: productData,
      });
      console.log(`✓ 已建立: ${product.name} (${product.slug})`);
      successCount++;
    } catch (error: any) {
      console.error(`✗ 建立失敗: ${productData.name} - ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n✅ 產品資料寫入完成！`);
  console.log(`\n📊 統計:`);
  console.log(`   成功: ${successCount} 個產品`);
  console.log(`   失敗: ${errorCount} 個產品`);
  console.log(`   總計: ${productsV2.length} 個產品`);
}

// 如果直接執行此檔案
if (require.main === module) {
  seedProductsV2()
    .catch((error) => {
      console.error("❌ 種子資料寫入失敗:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedProductsV2, productsV2 };
