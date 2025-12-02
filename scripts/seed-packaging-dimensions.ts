import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// 包裝盒維度資料
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
  tags: TagData[];
}

// 現有 Tag slug 對照表（避免重複建立）
const existingTagMappings: Record<string, string> = {
  // 盒型
  'drawer-box': 'drawer-box-1764281831558',
  'window-box': 'windows-box-1764237864471',
  'lid-and-base-box': 'heaven-earth-box',
  'magnetic-closure-box': 'magnetic-box',
  'flip-top-rigid-box': 'flip-lid-box',
  // 其他印刷品
  'paper-bag': 'paper-bag',
  'eva-foam': 'eva-foam',
  // 應用場景
  'mooncake': 'mooncake-gift-box',
  'tea': 'tea-box',
  'jewelry': 'jewelry-packaging',
  'cosmetics': 'cosmetic-box',
  'perfume': 'perfume-box',
  'wine': 'wine-box',
  'electronics': 'tag-1764171518845',
  'corporate-gifts': 'corporate-gift',
  'wedding-favors': 'tag', // 婚禮
  // 材質
  'kraft-paper': 'kraft-paper',
  'grey-board': 'grey-board',
  'corrugated': 'corrugated-paper-1764281849895',
  'specialty-paper': 'special-paper',
  'coated-paper': 'coated-paper',
  // 加工工藝
  'hot-foil': 'hot-stamping',
  'uv-printing': 'uv-coating',
  'embossing': 'embossing',
  'matte-lamination': 'matte-film',
  'gloss-lamination': 'glossy-film',
  'laser-engraving': 'laser-engraving',
};

const dimensions: DimensionData[] = [
  // ==========================================
  // Ⅰ. 成型紙盒 (Folding Carton)
  // ==========================================
  {
    slug: 'folding-carton',
    category: 'print-packaging',
    name_zh: '成型紙盒',
    name_en: 'Folding Carton',
    icon: 'Package',
    order: 1,
    tags: [
      { slug: 'tuck-end-box', name_zh: '插底盒', name_en: 'Tuck End Box' },
      { slug: 'ste-box', name_zh: '上插下糊盒', name_en: 'Straight Tuck End (STE) Box' },
      { slug: 'rte-box', name_zh: '上插下逆糊盒', name_en: 'Reverse Tuck End (RTE) Box' },
      { slug: 'auto-lock-bottom-box', name_zh: '自動鎖底盒', name_en: 'Auto-Lock Bottom Box' },
      { slug: 'snap-lock-bottom-box', name_zh: '托底盒（組底盒）', name_en: 'Snap Lock Bottom Box' },
      { slug: 'book-style-box', name_zh: '書本型盒', name_en: 'Book-Style Box' },
      { slug: 'drawer-box', name_zh: '抽屜盒（滑蓋盒）', name_en: 'Drawer Box' },
      { slug: 'sleeve-box', name_zh: '套盒（紙套）', name_en: 'Sleeve Box' },
      { slug: 'window-box', name_zh: '開窗盒', name_en: 'Window Box' },
      { slug: 'gable-box', name_zh: '手提盒', name_en: 'Gable Box / Handle Box' },
      { slug: 'double-wall-tuck-box', name_zh: '雙插耳盒', name_en: 'Double Wall Tuck Top Box' },
      { slug: 'cake-box', name_zh: '蛋糕盒', name_en: 'Cake Box / Bakery Box' },
      { slug: 'carrier-box', name_zh: '扶手盒', name_en: 'Carrier Box / Beverage Carrier' },
    ],
  },
  // ==========================================
  // Ⅱ. 硬紙盒 (Rigid Box)
  // ==========================================
  {
    slug: 'rigid-box',
    category: 'print-packaging',
    name_zh: '硬紙盒',
    name_en: 'Rigid Box / Gift Box',
    icon: 'Gift',
    order: 2,
    tags: [
      { slug: 'lid-and-base-box', name_zh: '天地盒', name_en: 'Rigid Lid and Base Box' },
      { slug: 'rigid-drawer-box', name_zh: '抽屜盒', name_en: 'Rigid Drawer Box' },
      { slug: 'book-style-rigid-box', name_zh: '書本盒', name_en: 'Book-Style Rigid Box' },
      { slug: 'magnetic-closure-box', name_zh: '磁吸盒', name_en: 'Magnetic Closure Box' },
      { slug: 'slipcase-box', name_zh: '抽取式盒（滑蓋）', name_en: 'Slipcase Box' },
      { slug: 'frame-box', name_zh: '框盒', name_en: 'Frame Box / Neck Box' },
      { slug: 'flip-top-rigid-box', name_zh: '翻蓋盒', name_en: 'Flip-Top Rigid Box' },
      { slug: 'set-up-rigid-box', name_zh: '拼接盒', name_en: 'Set-Up Rigid Box' },
      { slug: 'round-lid-base-box', name_zh: '圓形天地盒', name_en: 'Round Lid and Base Box / Hat Box' },
      { slug: 'magnetic-handle-box', name_zh: '磁扣提盒', name_en: 'Magnetic Handle Rigid Box' },
    ],
  },
  // ==========================================
  // Ⅲ. 其他印刷品 (Other Print Items)
  // ==========================================
  {
    slug: 'other-print',
    category: 'print-packaging',
    name_zh: '其他印刷品',
    name_en: 'Other Print Items',
    icon: 'FileText',
    order: 3,
    tags: [
      { slug: 'holiday-cards', name_zh: '節慶賀卡', name_en: 'Holiday Greeting Cards' },
      { slug: 'invitation-cards', name_zh: '邀請卡', name_en: 'Invitation Cards' },
      { slug: 'thank-you-cards', name_zh: '感謝卡', name_en: 'Thank You Cards' },
      { slug: 'letterhead', name_zh: '信紙', name_en: 'Letterhead' },
      { slug: 'envelope', name_zh: '信封', name_en: 'Envelope' },
      { slug: 'poster', name_zh: '海報', name_en: 'Poster' },
      { slug: 'business-card', name_zh: '名片', name_en: 'Business Card' },
      { slug: 'calendar', name_zh: '年曆', name_en: 'Calendar' },
      { slug: 'desk-calendar', name_zh: '桌曆', name_en: 'Desk Calendar' },
      { slug: 'wall-calendar', name_zh: '掛曆', name_en: 'Wall Calendar' },
      { slug: 'catalog-brochure', name_zh: '型錄', name_en: 'Catalog / Brochure' },
      { slug: 'folded-leaflet', name_zh: '摺頁', name_en: 'Folded Leaflet' },
      { slug: 'hang-tag', name_zh: '吊牌', name_en: 'Hang Tag' },
      { slug: 'sticker', name_zh: '貼紙', name_en: 'Sticker / Label' },
      { slug: 'product-label', name_zh: '產品標籤', name_en: 'Product Label' },
      { slug: 'ribbon', name_zh: '絲帶', name_en: 'Ribbon' },
      { slug: 'paper-bag', name_zh: '手提袋', name_en: 'Paper Bag' },
      { slug: 'wrapping-paper', name_zh: '包裝紙', name_en: 'Wrapping Paper' },
      { slug: 'cushioning', name_zh: '緩衝材料', name_en: 'Cushioning Material' },
      { slug: 'insert-liner', name_zh: '內襯', name_en: 'Insert / Liner' },
      { slug: 'eva-foam', name_zh: 'EVA泡棉', name_en: 'EVA Foam' },
    ],
  },
  // ==========================================
  // 應用場景 (Application)
  // ==========================================
  {
    slug: 'application',
    category: 'print-packaging',
    name_zh: '應用場景',
    name_en: 'Application',
    icon: 'Target',
    order: 4,
    tags: [
      { slug: 'mooncake', name_zh: '月餅', name_en: 'Mooncake' },
      { slug: 'pineapple-cake', name_zh: '鳳梨酥', name_en: 'Pineapple Cake' },
      { slug: 'egg-yolk-pastry', name_zh: '蛋黃酥', name_en: 'Egg Yolk Pastry' },
      { slug: 'tea', name_zh: '茶葉', name_en: 'Tea' },
      { slug: 'coffee', name_zh: '咖啡', name_en: 'Coffee' },
      { slug: 'chocolate', name_zh: '巧克力', name_en: 'Chocolate' },
      { slug: 'candy', name_zh: '糖果', name_en: 'Candy' },
      { slug: 'cake', name_zh: '蛋糕', name_en: 'Cake' },
      { slug: 'cookie', name_zh: '餅乾', name_en: 'Cookie / Biscuit' },
      { slug: 'jewelry', name_zh: '珠寶', name_en: 'Jewelry' },
      { slug: 'watch', name_zh: '手錶', name_en: 'Watch' },
      { slug: 'cosmetics', name_zh: '化妝品', name_en: 'Cosmetics' },
      { slug: 'skincare', name_zh: '保養品', name_en: 'Skincare' },
      { slug: 'perfume', name_zh: '香水', name_en: 'Perfume' },
      { slug: 'wine', name_zh: '酒類', name_en: 'Wine / Spirits' },
      { slug: 'electronics', name_zh: '3C產品', name_en: 'Electronics' },
      { slug: 'apparel', name_zh: '服飾', name_en: 'Apparel' },
      { slug: 'creative-gifts', name_zh: '文創禮品', name_en: 'Creative Gifts' },
      { slug: 'corporate-gifts', name_zh: '企業禮品', name_en: 'Corporate Gifts' },
      { slug: 'wedding-favors', name_zh: '婚禮喜餅', name_en: 'Wedding Favors' },
    ],
  },
  // ==========================================
  // 材質 (Material)
  // ==========================================
  {
    slug: 'material',
    category: 'print-packaging',
    name_zh: '材質',
    name_en: 'Material',
    icon: 'Layers',
    order: 5,
    tags: [
      { slug: 'kraft-paper', name_zh: '牛皮紙', name_en: 'Kraft Paper' },
      { slug: 'white-cardboard', name_zh: '白卡紙', name_en: 'White Cardboard' },
      { slug: 'grey-board', name_zh: '灰板紙', name_en: 'Grey Board' },
      { slug: 'corrugated', name_zh: '瓦楞紙', name_en: 'Corrugated Paper' },
      { slug: 'specialty-paper', name_zh: '特種紙', name_en: 'Specialty Paper' },
      { slug: 'coated-paper', name_zh: '銅版紙', name_en: 'Coated Paper' },
      { slug: 'art-paper', name_zh: '美術紙', name_en: 'Art Paper' },
      { slug: 'pearl-paper', name_zh: '珠光紙', name_en: 'Pearl Paper' },
      { slug: 'stardream-paper', name_zh: '星幻紙', name_en: 'Stardream Paper' },
    ],
  },
  // ==========================================
  // 加工工藝 (Finishing)
  // ==========================================
  {
    slug: 'finishing',
    category: 'print-packaging',
    name_zh: '加工工藝',
    name_en: 'Finishing',
    icon: 'Sparkles',
    order: 6,
    tags: [
      { slug: 'hot-foil', name_zh: '燙金', name_en: 'Hot Foil Stamping' },
      { slug: 'silver-foil', name_zh: '燙銀', name_en: 'Silver Foil Stamping' },
      { slug: 'uv-printing', name_zh: 'UV印刷', name_en: 'UV Printing' },
      { slug: 'spot-uv', name_zh: '局部上光', name_en: 'Spot UV' },
      { slug: 'embossing', name_zh: '壓凸', name_en: 'Embossing' },
      { slug: 'debossing', name_zh: '壓凹', name_en: 'Debossing' },
      { slug: 'matte-lamination', name_zh: '霧膜', name_en: 'Matte Lamination' },
      { slug: 'gloss-lamination', name_zh: '亮膜', name_en: 'Gloss Lamination' },
      { slug: 'soft-touch', name_zh: '絲絨觸感膜', name_en: 'Soft Touch Lamination' },
      { slug: 'letterpress', name_zh: '打凸字', name_en: 'Letterpress' },
      { slug: 'laser-engraving', name_zh: '雷射雕刻', name_en: 'Laser Engraving' },
    ],
  },
];

async function main() {
  console.log('🚀 開始建立包裝盒維度資料...\n');

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
        allow_multiple: true,
      },
      update: {
        name_zh: dim.name_zh,
        name_en: dim.name_en,
        icon: dim.icon,
        order: dim.order,
      },
    });

    // 處理每個 tag
    for (let i = 0; i < dim.tags.length; i++) {
      const tagData = dim.tags[i];
      
      // 檢查是否有現有 tag 可用
      const existingSlug = existingTagMappings[tagData.slug];
      let tagId: string;

      if (existingSlug) {
        // 使用現有 tag
        const existingTag = await prisma.tag.findUnique({
          where: { slug: existingSlug },
        });
        
        if (existingTag) {
          tagId = existingTag.id;
          console.log(`  ✅ 使用現有 Tag: ${tagData.name_zh} -> ${existingSlug}`);
          totalTagsReused++;
        } else {
          // 現有 tag 不存在，建立新的
          const newTag = await prisma.tag.create({
            data: {
              id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              slug: tagData.slug,
              name: tagData.name_zh,
              name_zh: tagData.name_zh,
              name_en: tagData.name_en,
              version: 2,
            },
          });
          tagId = newTag.id;
          console.log(`  🆕 建立新 Tag: ${tagData.name_zh} (${tagData.slug})`);
          totalTagsCreated++;
        }
      } else {
        // 檢查 slug 是否已存在
        const existingTag = await prisma.tag.findUnique({
          where: { slug: tagData.slug },
        });

        if (existingTag) {
          tagId = existingTag.id;
          // 更新中英文名稱和版本
          await prisma.tag.update({
            where: { id: tagId },
            data: {
              name_zh: tagData.name_zh,
              name_en: tagData.name_en,
              version: 2,
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
              version: 2,
            },
          });
          tagId = newTag.id;
          console.log(`  🆕 建立新 Tag: ${tagData.name_zh} (${tagData.slug})`);
          totalTagsCreated++;
        }
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
  console.log('✅ 維度建立完成！');
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
