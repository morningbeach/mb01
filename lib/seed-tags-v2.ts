// lib/seed-tags-v2.ts - TAG V2 種子資料
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// TAG 定義
const tagsV2 = [
  // === 產品類型 TAG ===
  { slug: "heaven-earth-box", name: "天地盒", subtitle: "Heaven & Earth Box", color: "#3b82f6", version: 2 },
  { slug: "flip-lid-box", name: "掀蓋盒", subtitle: "Flip Lid Box", color: "#8b5cf6", version: 2 },
  { slug: "magnetic-box", name: "磁吸盒", subtitle: "Magnetic Box", color: "#ec4899", version: 2 },
  { slug: "tea-box", name: "茶盒", subtitle: "Tea Box", color: "#10b981", version: 2 },
  { slug: "wine-box", name: "酒盒", subtitle: "Wine Box", color: "#dc2626", version: 2 },
  { slug: "cosmetic-box", name: "化妝品盒", subtitle: "Cosmetic Box", color: "#f59e0b", version: 2 },
  { slug: "perfume-box", name: "香水盒", subtitle: "Perfume Box", color: "#a855f7", version: 2 },
  
  // === 提袋類型 ===
  { slug: "canvas-bag", name: "帆布袋", subtitle: "Canvas Bag", color: "#059669", version: 2 },
  { slug: "flat-bag", name: "平面袋", subtitle: "Flat Bag", color: "#0891b2", version: 2 },
  { slug: "tote-bag", name: "托特袋", subtitle: "Tote Bag", color: "#0284c7", version: 2 },
  { slug: "gusset-bag", name: "五面袋", subtitle: "Gusseted Bag", color: "#7c3aed", version: 2 },
  { slug: "cosmetic-pouch", name: "化妝包", subtitle: "Cosmetic Pouch", color: "#db2777", version: 2 },
  { slug: "pvc-bag", name: "PVC袋", subtitle: "PVC Bag", color: "#06b6d4", version: 2 },
  { slug: "woven-bag", name: "編織袋", subtitle: "Woven Bag", color: "#84cc16", version: 2 },
  { slug: "nonwoven-bag", name: "不織布袋", subtitle: "Non-woven Bag", color: "#22c55e", version: 2 },
  { slug: "tyvek-bag", name: "杜邦紙袋", subtitle: "Tyvek Bag", color: "#14b8a6", version: 2 },
  
  // === 材質 TAG ===
  { slug: "special-paper", name: "特種紙", subtitle: "Special Paper", color: "#f97316", version: 2 },
  { slug: "coated-paper", name: "銅版紙", subtitle: "Coated Paper", color: "#fb923c", version: 2 },
  { slug: "grey-board", name: "灰板", subtitle: "Grey Board", color: "#78716c", version: 2 },
  { slug: "cotton-canvas", name: "純棉帆布", subtitle: "Cotton Canvas", color: "#d97706", version: 2 },
  { slug: "velvet-lining", name: "絨布內襯", subtitle: "Velvet Lining", color: "#be123c", version: 2 },
  { slug: "eva-foam", name: "EVA內襯", subtitle: "EVA Foam", color: "#64748b", version: 2 },
  { slug: "ceramic", name: "陶瓷", subtitle: "Ceramic", color: "#475569", version: 2 },
  { slug: "abs-plastic", name: "ABS塑膠", subtitle: "ABS Plastic", color: "#334155", version: 2 },
  
  // === 工藝特點 ===
  { slug: "hot-stamping", name: "燙金", subtitle: "Hot Stamping", color: "#ca8a04", version: 2 },
  { slug: "uv-coating", name: "UV上光", subtitle: "UV Coating", color: "#0ea5e9", version: 2 },
  { slug: "matte-film", name: "霧膜", subtitle: "Matte Film", color: "#6b7280", version: 2 },
  { slug: "glossy-film", name: "亮膜", subtitle: "Glossy Film", color: "#3b82f6", version: 2 },
  { slug: "embossing", name: "壓紋", subtitle: "Embossing", color: "#92400e", version: 2 },
  { slug: "laser-engraving", name: "雷雕", subtitle: "Laser Engraving", color: "#1e40af", version: 2 },
  { slug: "screen-printing", name: "網版印刷", subtitle: "Screen Printing", color: "#7c2d12", version: 2 },
  { slug: "digital-printing", name: "數位印刷", subtitle: "Digital Printing", color: "#4338ca", version: 2 },
  
  // === 用途場景 ===
  { slug: "luxury-gift", name: "高端禮品", subtitle: "Luxury Gift", color: "#7e22ce", version: 2 },
  { slug: "corporate-gift", name: "企業贈品", subtitle: "Corporate Gift", color: "#0369a1", version: 2 },
  { slug: "jewelry-packaging", name: "珠寶包裝", subtitle: "Jewelry Packaging", color: "#be185d", version: 2 },
  { slug: "tea-packaging", name: "茶葉包裝", subtitle: "Tea Packaging", color: "#15803d", version: 2 },
  { slug: "wine-packaging", name: "酒類包裝", subtitle: "Wine Packaging", color: "#991b1b", version: 2 },
  { slug: "cosmetic-packaging", name: "化妝品包裝", subtitle: "Cosmetic Packaging", color: "#c026d3", version: 2 },
  { slug: "food-packaging", name: "食品包裝", subtitle: "Food Packaging", color: "#ea580c", version: 2 },
  { slug: "eco-friendly", name: "環保", subtitle: "Eco-friendly", color: "#16a34a", version: 2 },
  { slug: "promotional", name: "宣傳推廣", subtitle: "Promotional", color: "#dc2626", version: 2 },
  { slug: "event-merch", name: "活動周邊", subtitle: "Event Merch", color: "#2563eb", version: 2 },
  
  // === 3C 產品 ===
  { slug: "wireless-charger", name: "無線充電器", subtitle: "Wireless Charger", color: "#0891b2", version: 2 },
  { slug: "bluetooth-speaker", name: "藍牙喇叭", subtitle: "Bluetooth Speaker", color: "#4f46e5", version: 2 },
  { slug: "keyboard", name: "鍵盤", subtitle: "Keyboard", color: "#6366f1", version: 2 },
  { slug: "phone-accessory", name: "手機配件", subtitle: "Phone Accessory", color: "#8b5cf6", version: 2 },
  
  // === 文具日用 ===
  { slug: "coaster", name: "杯墊", subtitle: "Coaster", color: "#06b6d4", version: 2 },
  { slug: "mirror", name: "鏡子", subtitle: "Mirror", color: "#ec4899", version: 2 },
  { slug: "stationery", name: "文具", subtitle: "Stationery", color: "#f59e0b", version: 2 },
  
  // === 尺寸規格 ===
  { slug: "standard-size", name: "標準尺寸", subtitle: "Standard Size", color: "#64748b", version: 2 },
  { slug: "large-size", name: "大尺寸", subtitle: "Large Size", color: "#475569", version: 2 },
  { slug: "small-size", name: "小尺寸", subtitle: "Small Size", color: "#94a3b8", version: 2 },
  
  // === 價格區間 ===
  { slug: "budget-friendly", name: "經濟實惠", subtitle: "Budget Friendly", color: "#22c55e", version: 2 },
  { slug: "premium-quality", name: "高級品", subtitle: "Premium Quality", color: "#9333ea", version: 2 },
  { slug: "mid-range", name: "中階", subtitle: "Mid-range", color: "#3b82f6", version: 2 },
];

async function seedTagsV2() {
  console.log("🏷️  開始寫入 TAG V2 種子資料...\n");

  // 清除現有 V2 標籤
  const deleted = await prisma.tag.deleteMany({
    where: { version: 2 },
  });
  console.log(`🗑️  已清除 ${deleted.count} 個舊 V2 標籤\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const tagData of tagsV2) {
    try {
      const tag = await prisma.tag.create({
        data: tagData,
      });
      console.log(`✓ 已建立: ${tag.name} (${tag.slug})`);
      successCount++;
    } catch (error: any) {
      console.error(`✗ 建立失敗: ${tagData.name} - ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n✅ TAG 資料寫入完成！`);
  console.log(`\n📊 統計:`);
  console.log(`   成功: ${successCount} 個 TAG`);
  console.log(`   失敗: ${errorCount} 個 TAG`);
  console.log(`   總計: ${tagsV2.length} 個 TAG`);
  
  return tagsV2;
}

// 如果直接執行此檔案
if (require.main === module) {
  seedTagsV2()
    .catch((error) => {
      console.error("❌ TAG 種子資料寫入失敗:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedTagsV2, tagsV2 };
