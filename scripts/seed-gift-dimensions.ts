import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// 禮品維度資料 (Gift Dimensions)
// 與提袋維度結構相同，標籤共用
// ==========================================

interface TagData {
  slug: string;
  name_zh: string;
  name_en: string;
}

interface DimensionData {
  slug: string;
  category: string;
  name_zh: string;
  name_en: string;
  icon: string;
  order: number;
  allow_multiple: boolean;
  tags: TagData[];
}

const dimensions: DimensionData[] = [
  // ==========================================
  // 1. 產品類型 (Product Type) - 已在 seed-gift-products.ts 建立
  // ==========================================
  // gift-type 維度已存在，這裡跳過

  // ==========================================
  // 2. 材質 (Material)
  // ==========================================
  {
    slug: 'gift-material',
    category: 'gift',
    name_zh: '材質',
    name_en: 'Material',
    icon: 'Layers',
    order: 2,
    allow_multiple: true,
    tags: [
      // 布料類
      { slug: 'canvas', name_zh: '帆布', name_en: 'Canvas' },
      { slug: 'cotton', name_zh: '棉布', name_en: 'Cotton' },
      { slug: 'polyester', name_zh: '聚酯纖維', name_en: 'Polyester' },
      { slug: 'nylon', name_zh: '尼龍', name_en: 'Nylon' },
      // 皮革類
      { slug: 'leather', name_zh: '皮革', name_en: 'Leather' },
      { slug: 'faux-leather', name_zh: '仿皮', name_en: 'Faux Leather / PU Leather' },
      // 金屬類
      { slug: 'stainless-steel', name_zh: '不鏽鋼', name_en: 'Stainless Steel' },
      { slug: 'aluminum', name_zh: '鋁合金', name_en: 'Aluminum' },
      { slug: 'zinc-alloy', name_zh: '鋅合金', name_en: 'Zinc Alloy' },
      // 塑膠類
      { slug: 'plastic', name_zh: '塑膠', name_en: 'Plastic' },
      { slug: 'silicone', name_zh: '矽膠', name_en: 'Silicone' },
      { slug: 'acrylic', name_zh: '壓克力', name_en: 'Acrylic' },
      { slug: 'abs', name_zh: 'ABS', name_en: 'ABS Plastic' },
      // 木材類
      { slug: 'wood', name_zh: '木材', name_en: 'Wood' },
      { slug: 'bamboo', name_zh: '竹子', name_en: 'Bamboo' },
      { slug: 'cork', name_zh: '軟木', name_en: 'Cork' },
      // 陶瓷/玻璃類
      { slug: 'ceramic', name_zh: '陶瓷', name_en: 'Ceramic' },
      { slug: 'glass', name_zh: '玻璃', name_en: 'Glass' },
      { slug: 'crystal', name_zh: '水晶', name_en: 'Crystal' },
      // 紙類
      { slug: 'paper', name_zh: '紙', name_en: 'Paper' },
      { slug: 'cardboard', name_zh: '紙板', name_en: 'Cardboard' },
      // 其他
      { slug: 'rubber', name_zh: '橡膠', name_en: 'Rubber' },
      { slug: 'eva', name_zh: 'EVA', name_en: 'EVA Foam' },
    ],
  },
  // ==========================================
  // 3. 印刷工藝 (Print & Finishing) - 與提袋共用標籤
  // ==========================================
  {
    slug: 'gift-print',
    category: 'gift',
    name_zh: '印刷工藝',
    name_en: 'Print & Finishing',
    icon: 'Paintbrush',
    order: 3,
    allow_multiple: true,
    tags: [
      { slug: 'screen-print', name_zh: '網版印刷', name_en: 'Screen Printing' },
      { slug: 'heat-transfer', name_zh: '熱轉印', name_en: 'Heat Transfer' },
      { slug: 'sublimation', name_zh: '熱昇華', name_en: 'Sublimation' },
      { slug: 'dtg-print', name_zh: '數位直噴', name_en: 'DTG / Digital Print' },
      { slug: 'offset-print', name_zh: '平版印刷', name_en: 'Offset Printing' },
      { slug: 'embroidery', name_zh: '刺繡', name_en: 'Embroidery' },
      { slug: 'hot-foil', name_zh: '燙金/燙銀', name_en: 'Hot Foil Stamping' },
      { slug: 'embossing', name_zh: '壓印', name_en: 'Embossing / Debossing' },
      { slug: 'laser-engraving', name_zh: '雷射雕刻', name_en: 'Laser Engraving' },
      { slug: 'uv-print', name_zh: 'UV印刷', name_en: 'UV Printing' },
      { slug: 'pad-print', name_zh: '移印', name_en: 'Pad Printing' },
      { slug: 'etching', name_zh: '蝕刻', name_en: 'Etching' },
    ],
  },
  // ==========================================
  // 4. 特色功能 (Features)
  // ==========================================
  {
    slug: 'gift-feature',
    category: 'gift',
    name_zh: '特色功能',
    name_en: 'Features',
    icon: 'Star',
    order: 4,
    allow_multiple: true,
    tags: [
      { slug: 'waterproof', name_zh: '防水', name_en: 'Waterproof' },
      { slug: 'insulated', name_zh: '保溫保冷', name_en: 'Insulated' },
      { slug: 'foldable', name_zh: '可折疊', name_en: 'Foldable' },
      { slug: 'portable', name_zh: '便攜式', name_en: 'Portable' },
      { slug: 'rechargeable', name_zh: '可充電', name_en: 'Rechargeable' },
      { slug: 'wireless', name_zh: '無線', name_en: 'Wireless' },
      { slug: 'led-light', name_zh: 'LED燈', name_en: 'LED Light' },
      { slug: 'customizable', name_zh: '可客製化', name_en: 'Customizable' },
      { slug: 'multi-function', name_zh: '多功能', name_en: 'Multi-function' },
      { slug: 'anti-slip', name_zh: '防滑', name_en: 'Anti-slip' },
      { slug: 'uv-resistant', name_zh: '抗UV', name_en: 'UV Resistant' },
      { slug: 'magnetic', name_zh: '磁吸式', name_en: 'Magnetic' },
    ],
  },
  // ==========================================
  // 5. 環保認證 (Eco Certification) - 與提袋共用標籤
  // ==========================================
  {
    slug: 'gift-eco',
    category: 'gift',
    name_zh: '環保認證',
    name_en: 'Eco Certification',
    icon: 'Leaf',
    order: 5,
    allow_multiple: true,
    tags: [
      { slug: 'grs-certified', name_zh: 'GRS認證', name_en: 'GRS Certified' },
      { slug: 'recycled-material', name_zh: '回收材料', name_en: 'Recycled Material' },
      { slug: 'biodegradable', name_zh: '可降解', name_en: 'Biodegradable' },
      { slug: 'organic-cotton', name_zh: '有機棉', name_en: 'Organic Cotton' },
      { slug: 'oeko-tex', name_zh: 'OEKO-TEX認證', name_en: 'OEKO-TEX Certified' },
      { slug: 'fsc-paper', name_zh: 'FSC認證紙', name_en: 'FSC Certified Paper' },
      { slug: 'bpa-free', name_zh: '不含BPA', name_en: 'BPA Free' },
      { slug: 'food-grade', name_zh: '食品級', name_en: 'Food Grade' },
    ],
  },
  // ==========================================
  // 6. 應用場景 (Application) - 統一設計，與提袋共用標籤
  // ==========================================
  {
    slug: 'gift-application',
    category: 'gift',
    name_zh: '應用場景',
    name_en: 'Application',
    icon: 'Target',
    order: 6,
    allow_multiple: true,
    tags: [
      { slug: 'food-beverage', name_zh: '食品飲料', name_en: 'Food & Beverage' },
      { slug: 'bakery-dessert', name_zh: '烘焙甜點', name_en: 'Bakery & Dessert' },
      { slug: 'tea-coffee', name_zh: '茶飲咖啡', name_en: 'Tea & Coffee' },
      { slug: 'wine-spirits', name_zh: '酒類', name_en: 'Wine & Spirits' },
      { slug: 'cosmetics-beauty', name_zh: '美妝保養', name_en: 'Cosmetics & Beauty' },
      { slug: 'fashion-apparel', name_zh: '服飾配件', name_en: 'Fashion & Apparel' },
      { slug: 'jewelry-watch', name_zh: '珠寶鐘錶', name_en: 'Jewelry & Watch' },
      { slug: 'electronics-3c', name_zh: '3C電子', name_en: 'Electronics' },
      { slug: 'corporate-gift', name_zh: '企業禮贈', name_en: 'Corporate Gifts' },
      { slug: 'wedding-celebration', name_zh: '婚慶喜宴', name_en: 'Wedding & Celebration' },
      { slug: 'festival-holiday', name_zh: '節慶送禮', name_en: 'Festival & Holiday' },
      { slug: 'retail-shopping', name_zh: '零售購物', name_en: 'Retail Shopping' },
      { slug: 'trade-show-event', name_zh: '展覽活動', name_en: 'Trade Show & Events' },
      { slug: 'travel-outdoor', name_zh: '旅行戶外', name_en: 'Travel & Outdoor' },
      { slug: 'sports-fitness', name_zh: '運動健身', name_en: 'Sports & Fitness' },
      { slug: 'baby-kids', name_zh: '母嬰用品', name_en: 'Baby & Kids' },
      { slug: 'school-office', name_zh: '學校辦公', name_en: 'School & Office' },
      { slug: 'hotel-hospitality', name_zh: '飯店民宿', name_en: 'Hotel & Hospitality' },
      { slug: 'restaurant-cafe', name_zh: '餐廳咖啡廳', name_en: 'Restaurant & Cafe' },
      { slug: 'healthcare-medical', name_zh: '醫療保健', name_en: 'Healthcare & Medical' },
    ],
  },
];

async function main() {
  console.log('🎁 開始建立禮品維度資料...\n');

  let totalTagsCreated = 0;
  let totalTagsReused = 0;
  let totalMappings = 0;

  for (const dim of dimensions) {
    console.log(`\n📦 建立維度: ${dim.name_zh} (${dim.slug})`);
    
    // 建立或更新維度
    const dimension = await prisma.filterDimension.upsert({
      where: { slug: dim.slug },
      create: {
        slug: dim.slug,
        category: dim.category,
        name_zh: dim.name_zh,
        name_en: dim.name_en,
        icon: dim.icon,
        order: dim.order,
        is_active: true,
        allow_multiple: dim.allow_multiple,
      },
      update: {
        name_zh: dim.name_zh,
        name_en: dim.name_en,
        icon: dim.icon,
        order: dim.order,
        allow_multiple: dim.allow_multiple,
      },
    });

    // 處理每個 tag
    for (let i = 0; i < dim.tags.length; i++) {
      const tagData = dim.tags[i];
      
      // 檢查 slug 是否已存在（可能被提袋維度建立過）
      const existingTag = await prisma.tag.findUnique({
        where: { slug: tagData.slug },
      });

      let tagId: string;

      if (existingTag) {
        tagId = existingTag.id;
        // 更新中英文名稱
        await prisma.tag.update({
          where: { id: tagId },
          data: {
            name_zh: tagData.name_zh,
            name_en: tagData.name_en,
          },
        });
        console.log(`  ✅ 共用現有 Tag: ${tagData.name_zh} (${tagData.slug})`);
        totalTagsReused++;
      } else {
        // 建立新 tag
        const newTag = await prisma.tag.create({
          data: {
            id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            slug: tagData.slug,
            name: tagData.name_zh,
            name_zh: tagData.name_zh,
            name_en: tagData.name_en,
          },
        });
        tagId = newTag.id;
        console.log(`  🆕 建立新 Tag: ${tagData.name_zh} (${tagData.slug})`);
        totalTagsCreated++;
      }

      // 建立維度與 tag 的關聯
      await prisma.dimensionTagMapping.upsert({
        where: {
          dimensionId_tagId: {
            dimensionId: dimension.id,
            tagId: tagId,
          },
        },
        create: {
          dimensionId: dimension.id,
          tagId: tagId,
          order: i,
        },
        update: {
          order: i,
        },
      });
      totalMappings++;
    }
  }

  console.log('\n==========================================');
  console.log('✅ 禮品維度建立完成！');
  console.log(`📊 統計：`);
  console.log(`   - 維度數量: ${dimensions.length}`);
  console.log(`   - 新增 Tags: ${totalTagsCreated}`);
  console.log(`   - 共用 Tags: ${totalTagsReused}`);
  console.log(`   - 關聯數量: ${totalMappings}`);
  console.log('==========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ 錯誤:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
