import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// 提袋維度資料 (Bag Dimensions)
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
  // 1. 材質 (Material)
  // ==========================================
  {
    slug: 'bag-material',
    category: 'bag',
    name_zh: '材質',
    name_en: 'Material',
    icon: 'Layers',
    order: 1,
    allow_multiple: true,
    tags: [
      { slug: 'canvas', name_zh: '帆布', name_en: 'Canvas' },
      { slug: 'cotton', name_zh: '棉布', name_en: 'Cotton' },
      { slug: 'non-woven', name_zh: '不織布', name_en: 'Non-Woven' },
      { slug: 'rpet', name_zh: '麗新布 rPET', name_en: 'rPET / Recycled Polyester' },
      { slug: 'oxford', name_zh: '牛津布', name_en: 'Oxford Fabric' },
      { slug: 'pvc', name_zh: 'PVC', name_en: 'PVC' },
      { slug: 'tpu', name_zh: 'TPU', name_en: 'TPU' },
      { slug: 'pp-woven', name_zh: 'PP編織袋', name_en: 'PP Woven' },
      { slug: 'pp-frosted', name_zh: 'PP磨砂', name_en: 'PP Frosted' },
      { slug: 'tyvek', name_zh: '杜邦紙', name_en: 'Tyvek / DuPont Paper' },
      { slug: 'jute', name_zh: '麻布', name_en: 'Jute / Burlap' },
      { slug: 'kraft-bag', name_zh: '牛皮紙', name_en: 'Kraft Paper' },
      { slug: 'art-paper-bag', name_zh: '銅版紙', name_en: 'Art Paper / Coated Paper' },
      { slug: 'leather', name_zh: '皮革', name_en: 'Leather' },
      { slug: 'faux-leather', name_zh: '仿皮', name_en: 'Faux Leather / PU Leather' },
      { slug: 'cork', name_zh: '軟木', name_en: 'Cork' },
      { slug: 'coffee-grounds', name_zh: '咖啡渣', name_en: 'Coffee Grounds Material' },
      { slug: 'nylon', name_zh: '尼龍', name_en: 'Nylon' },
      { slug: 'polyester', name_zh: '聚酯纖維', name_en: 'Polyester' },
      { slug: 'mesh', name_zh: '網布', name_en: 'Mesh Fabric' },
    ],
  },
  // ==========================================
  // 2. 袋形 (Bag Style)
  // ==========================================
  {
    slug: 'bag-style',
    category: 'bag',
    name_zh: '袋形',
    name_en: 'Bag Style',
    icon: 'ShoppingBag',
    order: 2,
    allow_multiple: true,
    tags: [
      { slug: 'tote-bag', name_zh: '托特袋', name_en: 'Tote Bag' },
      { slug: 'flat-bag', name_zh: '平面袋', name_en: 'Flat Bag' },
      { slug: 'gusset-bag', name_zh: '五面袋', name_en: 'Gusset Bag' },
      { slug: 'drawstring-bag', name_zh: '束口袋', name_en: 'Drawstring Bag' },
      { slug: 'drawstring-backpack', name_zh: '束口後背包', name_en: 'Drawstring Backpack' },
      { slug: 'backpack', name_zh: '後背包', name_en: 'Backpack' },
      { slug: 'shoulder-bag', name_zh: '肩背袋', name_en: 'Shoulder Bag' },
      { slug: 'crossbody-bag', name_zh: '斜背袋', name_en: 'Crossbody Bag' },
      { slug: 'messenger-bag', name_zh: '郵差包', name_en: 'Messenger Bag' },
      { slug: 'cooler-bag', name_zh: '保冷袋', name_en: 'Cooler Bag / Insulated Bag' },
      { slug: 'lunch-bag', name_zh: '便當袋', name_en: 'Lunch Bag' },
      { slug: 'wine-bag', name_zh: '酒袋', name_en: 'Wine Bag' },
      { slug: 'bottle-bag', name_zh: '杯袋', name_en: 'Bottle Bag / Cup Bag' },
      { slug: 'pouch', name_zh: '化妝包/收納袋', name_en: 'Pouch / Cosmetic Bag' },
      { slug: 'pencil-case', name_zh: '筆袋', name_en: 'Pencil Case' },
      { slug: 'laptop-sleeve', name_zh: '電腦包', name_en: 'Laptop Sleeve' },
      { slug: 'document-bag', name_zh: '文件袋', name_en: 'Document Bag' },
      { slug: 'foldable-bag', name_zh: '折疊袋', name_en: 'Foldable Bag' },
      { slug: 'eco-bag', name_zh: '環保購物袋', name_en: 'Eco Shopping Bag' },
      { slug: 'ita-bag', name_zh: '痛包/娃包', name_en: 'Ita Bag / Display Bag' },
      { slug: 'paper-shopping-bag', name_zh: '紙提袋', name_en: 'Paper Shopping Bag' },
      { slug: 'gift-bag', name_zh: '禮品袋', name_en: 'Gift Bag' },
      { slug: 'other-bag-style', name_zh: '其他袋型', name_en: 'Other Bag Styles' },
    ],
  },
  // ==========================================
  // 3. 印刷工藝 (Print & Finishing)
  // ==========================================
  {
    slug: 'bag-print',
    category: 'bag',
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
      { slug: 'laminated-print', name_zh: '覆膜印刷', name_en: 'Laminated Printing' },
      { slug: 'embroidery', name_zh: '刺繡', name_en: 'Embroidery' },
      { slug: 'woven-label', name_zh: '織標', name_en: 'Woven Label' },
      { slug: 'bag-hot-foil', name_zh: '燙金/燙銀', name_en: 'Hot Foil Stamping' },
      { slug: 'bag-embossing', name_zh: '壓印', name_en: 'Embossing / Debossing' },
      { slug: 'badge-patch', name_zh: '徽章/布章', name_en: 'Badge / Patch' },
      { slug: 'uv-print-bag', name_zh: 'UV印刷', name_en: 'UV Printing' },
    ],
  },
  // ==========================================
  // 4. 特色功能 (Features)
  // ==========================================
  {
    slug: 'bag-feature',
    category: 'bag',
    name_zh: '特色功能',
    name_en: 'Features',
    icon: 'Star',
    order: 4,
    allow_multiple: true,
    tags: [
      { slug: 'waterproof', name_zh: '防水', name_en: 'Waterproof' },
      { slug: 'insulated', name_zh: '保溫保冷', name_en: 'Insulated' },
      { slug: 'foldable', name_zh: '可折疊', name_en: 'Foldable' },
      { slug: 'zipper-closure', name_zh: '拉鏈封口', name_en: 'Zipper Closure' },
      { slug: 'magnetic-closure-bag', name_zh: '磁扣封口', name_en: 'Magnetic Closure' },
      { slug: 'velcro-closure', name_zh: '魔鬼氈封口', name_en: 'Velcro Closure' },
      { slug: 'snap-closure', name_zh: '按扣封口', name_en: 'Snap Closure' },
      { slug: 'reinforced-bottom', name_zh: '加固底部', name_en: 'Reinforced Bottom' },
      { slug: 'inner-pocket', name_zh: '內袋', name_en: 'Inner Pocket' },
      { slug: 'outer-pocket', name_zh: '外袋', name_en: 'Outer Pocket' },
      { slug: 'adjustable-strap', name_zh: '可調式背帶', name_en: 'Adjustable Strap' },
      { slug: 'removable-strap', name_zh: '可拆卸背帶', name_en: 'Removable Strap' },
      { slug: 'transparent-window', name_zh: '透明視窗', name_en: 'Transparent Window' },
    ],
  },
  // ==========================================
  // 5. 環保認證 (Eco Certification)
  // ==========================================
  {
    slug: 'bag-eco',
    category: 'bag',
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
    ],
  },
  // ==========================================
  // 6. 應用場景 (Application)
  // ==========================================
  {
    slug: 'bag-application',
    category: 'bag',
    name_zh: '應用場景',
    name_en: 'Application',
    icon: 'Target',
    order: 6,
    allow_multiple: true,
    tags: [
      { slug: 'retail-shopping', name_zh: '零售購物', name_en: 'Retail Shopping' },
      { slug: 'corporate-gift-bag', name_zh: '企業禮贈品', name_en: 'Corporate Gifts' },
      { slug: 'trade-show', name_zh: '展覽活動', name_en: 'Trade Show / Events' },
      { slug: 'food-delivery', name_zh: '餐飲外送', name_en: 'Food Delivery' },
      { slug: 'fashion-apparel', name_zh: '服飾配件', name_en: 'Fashion & Apparel' },
      { slug: 'cosmetics-bag-use', name_zh: '美妝保養', name_en: 'Cosmetics & Beauty' },
      { slug: 'travel-outdoor', name_zh: '旅行戶外', name_en: 'Travel & Outdoor' },
      { slug: 'school-office', name_zh: '學校辦公', name_en: 'School & Office' },
      { slug: 'sports-fitness', name_zh: '運動健身', name_en: 'Sports & Fitness' },
      { slug: 'baby-kids', name_zh: '母嬰用品', name_en: 'Baby & Kids' },
      { slug: 'wedding-party', name_zh: '婚禮派對', name_en: 'Wedding & Party' },
      { slug: 'grocery', name_zh: '生鮮超市', name_en: 'Grocery' },
    ],
  },
];

async function main() {
  console.log('🛍️ 開始建立提袋維度資料...\n');

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
      
      // 檢查 slug 是否已存在
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
        console.log(`  ✅ 使用現有 Tag: ${tagData.name_zh} (${tagData.slug})`);
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
  console.log('✅ 提袋維度建立完成！');
  console.log(`📊 統計：`);
  console.log(`   - 維度數量: ${dimensions.length}`);
  console.log(`   - 新增 Tags: ${totalTagsCreated}`);
  console.log(`   - 重用 Tags: ${totalTagsReused}`);
  console.log(`   - 關聯數量: ${totalMappings}`);
  console.log('==========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ 錯誤:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
