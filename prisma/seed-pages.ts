// prisma/seed-pages.ts
// 建立預設頁面的 seed 腳本

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 開始建立預設頁面...');

  // 預設頁面資料
  const defaultPages = [
    {
      slug: 'homepage',
      type: 'HOMEPAGE',
      isDefault: true,
      isEnabled: true,
      showInNav: false, // 首頁不顯示在導覽列
      order: 0,
      navLabel_zh: '首頁',
      navLabel_en: 'Home',
    },
    {
      slug: 'products',
      type: 'PRODUCTS',
      isDefault: true,
      isEnabled: true,
      showInNav: true,
      order: 10,
      navLabel_zh: '產品',
      navLabel_en: 'Products',
    },
    {
      slug: 'about',
      type: 'ABOUT',
      isDefault: true,
      isEnabled: true,
      showInNav: true,
      order: 20,
      navLabel_zh: '關於我們',
      navLabel_en: 'About',
      label_zh: '品牌故事',
      label_en: 'Brand Story',
      title_zh: '以專案為核心的包裝夥伴，而非僅僅提供產品目錄',
      title_en: 'A packaging partner built around projects, not just SKUs.',
      desc_zh: 'MB Packaging 的創立理念很簡單：禮品盒和包裝不應該是事後才想到的。它們是品牌、行銷活動和開箱體驗的一部分。我們在品牌與工廠之間架起橋樑，將時間表、預算和想法轉化為實際、一致的包裝。',
      desc_en: 'MB Packaging was founded with a simple idea: gift boxes and packaging shouldn\'t be an afterthought. They are part of the brand, the campaign and the unboxing moment. We work between brands and factories to turn timelines, budgets and ideas into tangible, consistent packaging.',
    },
    {
      slug: 'factory',
      type: 'FACTORY',
      isDefault: true,
      isEnabled: true,
      showInNav: true,
      order: 30,
      navLabel_zh: '工廠實力',
      navLabel_en: 'Factory',
      label_zh: '工廠實力',
      label_en: 'Factory Strength',
      title_zh: '清潔、結構化的禮品盒和包裝生產基地',
      title_en: 'A clean, structured production base for gift boxes and packaging.',
      desc_zh: '我們的工廠圍繞一致的品質和可靠的交付而設計，擁有經驗豐富的工程、生產和品質控制團隊。',
      desc_en: 'Our facility is designed around consistent quality and reliable delivery, with experienced teams handling engineering, production and QC.',
    },
    {
      slug: 'process',
      type: 'ABOUT', // 使用 About 類型模板
      isDefault: true,
      isEnabled: false, // 預設關閉
      showInNav: true,
      order: 40,
      navLabel_zh: '流程',
      navLabel_en: 'Process',
      label_zh: '工作流程',
      label_en: 'Our Process',
      title_zh: '從概念到交付的完整流程',
      title_en: 'From concept to delivery',
      desc_zh: '我們的流程確保每個專案都能準時、高品質地完成。',
      desc_en: 'Our process ensures every project is completed on time and with the highest quality.',
    },
    {
      slug: 'case',
      type: 'CASE',
      isDefault: true,
      isEnabled: false, // 預設關閉
      showInNav: true,
      order: 50,
      navLabel_zh: '案例',
      navLabel_en: 'Case',
      label_zh: '專案案例',
      label_en: 'Case Studies',
      title_zh: '我們完成的精選專案',
      title_en: 'Featured projects we\'ve completed',
      desc_zh: '探索我們為全球品牌打造的包裝解決方案。',
      desc_en: 'Explore packaging solutions we\'ve created for global brands.',
    },
    {
      slug: 'contact',
      type: 'CONTACT',
      isDefault: true,
      isEnabled: true,
      showInNav: true,
      order: 60,
      navLabel_zh: '聯絡我們',
      navLabel_en: 'Contact',
      label_zh: '聯絡方式',
      label_en: 'Contact',
      title_zh: '開始一個專案或提出問題',
      title_en: 'Start a project or ask a question.',
      desc_zh: '分享您的數量、時間表和您需要的大致想法。我們會回覆建議和快速報價。',
      desc_en: 'Share your quantity, timeline and a rough idea of what you need. We\'ll respond with suggestions and a quick quotation.',
    },
  ];

  for (const pageData of defaultPages) {
    const existing = await prisma.sitePage.findUnique({
      where: { slug: pageData.slug },
    });

    if (existing) {
      console.log(`⏭️  頁面 "${pageData.slug}" 已存在，跳過`);
    } else {
      await prisma.sitePage.create({
        data: pageData as any,
      });
      console.log(`✅ 建立預設頁面: ${pageData.slug}`);
    }
  }

  console.log('✨ 預設頁面建立完成！');
}

main()
  .catch((e) => {
    console.error('❌ 錯誤:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
