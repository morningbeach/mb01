// scripts/full-db-backup.js
// 完整資料庫備份腳本

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// 安全備份函數 - 處理可能不存在的表
async function safeBackup(name, queryFn) {
  try {
    const data = await queryFn();
    return { success: true, data, count: Array.isArray(data) ? data.length : 1 };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function backupAll() {
  console.log('🔄 開始完整資料庫備份...\n');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = path.join(__dirname, '..', 'db_backups', timestamp);
  
  // 創建備份目錄
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const tables = [];

  try {
    // ===== 研究系統資料 =====
    console.log('📚 備份研究系統...');
    
    const researchSessions = await prisma.researchSession.findMany({
      include: {
        sources: true,
        modules: { include: { sources: true } },
        articles: true,
        conversations: { include: { messages: true } },
        logs: true
      }
    });
    fs.writeFileSync(path.join(backupDir, 'research-sessions.json'), JSON.stringify(researchSessions, null, 2));
    tables.push({ name: 'ResearchSession', count: researchSessions.length });
    console.log(`  ✅ ResearchSession: ${researchSessions.length} 筆`);

    // ResearchLog 單獨備份
    const researchLogs = await prisma.researchLog.findMany();
    fs.writeFileSync(path.join(backupDir, 'research-logs.json'), JSON.stringify(researchLogs, null, 2));
    tables.push({ name: 'ResearchLog', count: researchLogs.length });
    console.log(`  ✅ ResearchLog: ${researchLogs.length} 筆`);

    // ResearchSource
    const researchSources = await prisma.researchSource.findMany();
    fs.writeFileSync(path.join(backupDir, 'research-sources.json'), JSON.stringify(researchSources, null, 2));
    tables.push({ name: 'ResearchSource', count: researchSources.length });
    console.log(`  ✅ ResearchSource: ${researchSources.length} 筆`);

    // ResearchModule
    const researchModules = await prisma.researchModule.findMany({ include: { sources: true } });
    fs.writeFileSync(path.join(backupDir, 'research-modules.json'), JSON.stringify(researchModules, null, 2));
    tables.push({ name: 'ResearchModule', count: researchModules.length });
    console.log(`  ✅ ResearchModule: ${researchModules.length} 筆`);

    // ArticleDraft
    const articleDrafts = await prisma.articleDraft.findMany();
    fs.writeFileSync(path.join(backupDir, 'article-drafts.json'), JSON.stringify(articleDrafts, null, 2));
    tables.push({ name: 'ArticleDraft', count: articleDrafts.length });
    console.log(`  ✅ ArticleDraft: ${articleDrafts.length} 筆`);

    // AuthoritySource
    const authoritySources = await prisma.authoritySource.findMany();
    fs.writeFileSync(path.join(backupDir, 'authority-sources.json'), JSON.stringify(authoritySources, null, 2));
    tables.push({ name: 'AuthoritySource', count: authoritySources.length });
    console.log(`  ✅ AuthoritySource: ${authoritySources.length} 筆`);

    // AIModelConfig
    const aiModelConfigs = await prisma.aIModelConfig.findMany();
    fs.writeFileSync(path.join(backupDir, 'ai-model-configs.json'), JSON.stringify(aiModelConfigs, null, 2));
    tables.push({ name: 'AIModelConfig', count: aiModelConfigs.length });
    console.log(`  ✅ AIModelConfig: ${aiModelConfigs.length} 筆`);

    // ResearchSchedule
    const result1 = await safeBackup('ResearchSchedule', () => prisma.researchSchedule.findMany());
    if (result1.success) {
      fs.writeFileSync(path.join(backupDir, 'research-schedules.json'), JSON.stringify(result1.data, null, 2));
      tables.push({ name: 'ResearchSchedule', count: result1.count });
      console.log(`  ✅ ResearchSchedule: ${result1.count} 筆`);
    }

    // ===== 產品資料 =====
    console.log('\n📦 備份產品資料...');
    
    const products = await prisma.product.findMany({ include: { ProductImage: true, ProductTag: true } });
    fs.writeFileSync(path.join(backupDir, 'products.json'), JSON.stringify(products, null, 2));
    tables.push({ name: 'Product', count: products.length });
    console.log(`  ✅ Product: ${products.length} 筆`);

    // ProductImage
    const productImages = await prisma.productImage.findMany();
    fs.writeFileSync(path.join(backupDir, 'product-images.json'), JSON.stringify(productImages, null, 2));
    tables.push({ name: 'ProductImage', count: productImages.length });
    console.log(`  ✅ ProductImage: ${productImages.length} 筆`);

    // ProductTag
    const productTags = await prisma.productTag.findMany();
    fs.writeFileSync(path.join(backupDir, 'product-tags.json'), JSON.stringify(productTags, null, 2));
    tables.push({ name: 'ProductTag', count: productTags.length });
    console.log(`  ✅ ProductTag: ${productTags.length} 筆`);

    // GiftSet & GiftSetItem
    const giftSets = await prisma.giftSet.findMany({ include: { GiftSetItem: true } });
    fs.writeFileSync(path.join(backupDir, 'gift-sets.json'), JSON.stringify(giftSets, null, 2));
    tables.push({ name: 'GiftSet', count: giftSets.length });
    console.log(`  ✅ GiftSet: ${giftSets.length} 筆`);

    // ===== 分類資料 =====
    console.log('\n📂 備份分類資料...');
    
    const categories = await prisma.categoryNode.findMany();
    fs.writeFileSync(path.join(backupDir, 'categories.json'), JSON.stringify(categories, null, 2));
    tables.push({ name: 'CategoryNode', count: categories.length });
    console.log(`  ✅ CategoryNode: ${categories.length} 筆`);

    // FrontCategory
    const frontCategories = await prisma.frontCategory.findMany({ include: { FrontCategoryTagGroup: true } });
    fs.writeFileSync(path.join(backupDir, 'front-categories.json'), JSON.stringify(frontCategories, null, 2));
    tables.push({ name: 'FrontCategory', count: frontCategories.length });
    console.log(`  ✅ FrontCategory: ${frontCategories.length} 筆`);

    // ===== 標籤資料 =====
    const tags = await prisma.tag.findMany();
    fs.writeFileSync(path.join(backupDir, 'tags.json'), JSON.stringify(tags, null, 2));
    tables.push({ name: 'Tag', count: tags.length });
    console.log(`  ✅ Tag: ${tags.length} 筆`);

    // FilterDimension
    const filterDimensions = await prisma.filterDimension.findMany({ include: { tagMappings: true } });
    fs.writeFileSync(path.join(backupDir, 'filter-dimensions.json'), JSON.stringify(filterDimensions, null, 2));
    tables.push({ name: 'FilterDimension', count: filterDimensions.length });
    console.log(`  ✅ FilterDimension: ${filterDimensions.length} 筆`);

    // ===== 圖片資料 =====
    console.log('\n🖼️ 備份圖片資料...');
    
    const images = await prisma.image.findMany();
    fs.writeFileSync(path.join(backupDir, 'images.json'), JSON.stringify(images, null, 2));
    tables.push({ name: 'Image', count: images.length });
    console.log(`  ✅ Image: ${images.length} 筆`);

    // ImageAsset
    const imageAssets = await prisma.imageAsset.findMany();
    fs.writeFileSync(path.join(backupDir, 'image-assets.json'), JSON.stringify(imageAssets, null, 2));
    tables.push({ name: 'ImageAsset', count: imageAssets.length });
    console.log(`  ✅ ImageAsset: ${imageAssets.length} 筆`);

    // 相簿資料
    const albums = await prisma.album.findMany({ include: { AlbumImage: true } });
    fs.writeFileSync(path.join(backupDir, 'albums.json'), JSON.stringify(albums, null, 2));
    tables.push({ name: 'Album', count: albums.length });
    console.log(`  ✅ Album: ${albums.length} 筆`);

    // VirtualFolder
    const virtualFolders = await prisma.virtualFolder.findMany();
    fs.writeFileSync(path.join(backupDir, 'virtual-folders.json'), JSON.stringify(virtualFolders, null, 2));
    tables.push({ name: 'VirtualFolder', count: virtualFolders.length });
    console.log(`  ✅ VirtualFolder: ${virtualFolders.length} 筆`);

    // ===== 部落格資料 =====
    console.log('\n📝 備份部落格資料...');
    
    const blogPosts = await prisma.blogPost.findMany({ include: { BlogTag: true } });
    fs.writeFileSync(path.join(backupDir, 'blog-posts.json'), JSON.stringify(blogPosts, null, 2));
    tables.push({ name: 'BlogPost', count: blogPosts.length });
    console.log(`  ✅ BlogPost: ${blogPosts.length} 筆`);

    // ===== 案例專案 =====
    console.log('\n💼 備份案例專案...');
    
    const caseProjects = await prisma.caseProject.findMany();
    fs.writeFileSync(path.join(backupDir, 'case-projects.json'), JSON.stringify(caseProjects, null, 2));
    tables.push({ name: 'CaseProject', count: caseProjects.length });
    console.log(`  ✅ CaseProject: ${caseProjects.length} 筆`);

    // ===== 使用者資料 =====
    console.log('\n👤 備份使用者資料...');
    
    const adminUsers = await prisma.adminUser.findMany();
    const safeUsers = adminUsers.map(u => ({ ...u, password: '[REDACTED]' }));
    fs.writeFileSync(path.join(backupDir, 'admin-users.json'), JSON.stringify(safeUsers, null, 2));
    tables.push({ name: 'AdminUser', count: adminUsers.length });
    console.log(`  ✅ AdminUser: ${adminUsers.length} 筆`);

    // AdminSession
    const adminSessions = await prisma.adminSession.findMany();
    fs.writeFileSync(path.join(backupDir, 'admin-sessions.json'), JSON.stringify(adminSessions, null, 2));
    tables.push({ name: 'AdminSession', count: adminSessions.length });
    console.log(`  ✅ AdminSession: ${adminSessions.length} 筆`);

    // ===== 網站設定 =====
    console.log('\n⚙️ 備份網站設定...');
    
    const siteSettings = await prisma.siteSetting.findMany();
    fs.writeFileSync(path.join(backupDir, 'site-settings.json'), JSON.stringify(siteSettings, null, 2));
    tables.push({ name: 'SiteSetting', count: siteSettings.length });
    console.log(`  ✅ SiteSetting: ${siteSettings.length} 筆`);

    // SitePage
    const sitePages = await prisma.sitePage.findMany();
    fs.writeFileSync(path.join(backupDir, 'site-pages.json'), JSON.stringify(sitePages, null, 2));
    tables.push({ name: 'SitePage', count: sitePages.length });
    console.log(`  ✅ SitePage: ${sitePages.length} 筆`);

    // Page
    const pages = await prisma.page.findMany();
    fs.writeFileSync(path.join(backupDir, 'pages.json'), JSON.stringify(pages, null, 2));
    tables.push({ name: 'Page', count: pages.length });
    console.log(`  ✅ Page: ${pages.length} 筆`);

    // HomeSection
    const homeSections = await prisma.homeSection.findMany();
    fs.writeFileSync(path.join(backupDir, 'home-sections.json'), JSON.stringify(homeSections, null, 2));
    tables.push({ name: 'HomeSection', count: homeSections.length });
    console.log(`  ✅ HomeSection: ${homeSections.length} 筆`);

    // ===== 聯絡資料 =====
    console.log('\n📞 備份聯絡資料...');
    
    const contactInquiries = await prisma.contactInquiry.findMany();
    fs.writeFileSync(path.join(backupDir, 'contact-inquiries.json'), JSON.stringify(contactInquiries, null, 2));
    tables.push({ name: 'ContactInquiry', count: contactInquiries.length });
    console.log(`  ✅ ContactInquiry: ${contactInquiries.length} 筆`);

    // ===== AI 資料 =====
    console.log('\n🤖 備份 AI 資料...');
    
    const aiUsageLogs = await prisma.aiUsageLog.findMany();
    fs.writeFileSync(path.join(backupDir, 'ai-usage-logs.json'), JSON.stringify(aiUsageLogs, null, 2));
    tables.push({ name: 'AiUsageLog', count: aiUsageLogs.length });
    console.log(`  ✅ AiUsageLog: ${aiUsageLogs.length} 筆`);

    const aiPromptTemplates = await prisma.aiPromptTemplate.findMany();
    fs.writeFileSync(path.join(backupDir, 'ai-prompt-templates.json'), JSON.stringify(aiPromptTemplates, null, 2));
    tables.push({ name: 'AiPromptTemplate', count: aiPromptTemplates.length });
    console.log(`  ✅ AiPromptTemplate: ${aiPromptTemplates.length} 筆`);

    const aiInquiries = await prisma.aiInquiry.findMany();
    fs.writeFileSync(path.join(backupDir, 'ai-inquiries.json'), JSON.stringify(aiInquiries, null, 2));
    tables.push({ name: 'AiInquiry', count: aiInquiries.length });
    console.log(`  ✅ AiInquiry: ${aiInquiries.length} 筆`);

    // ===== Trend Report =====
    console.log('\n📈 備份趨勢報告...');
    
    const trendReports = await prisma.trendReport.findMany();
    fs.writeFileSync(path.join(backupDir, 'trend-reports.json'), JSON.stringify(trendReports, null, 2));
    tables.push({ name: 'TrendReport', count: trendReports.length });
    console.log(`  ✅ TrendReport: ${trendReports.length} 筆`);

    // ===== 寫入備份摘要 =====
    const summary = {
      timestamp: new Date().toISOString(),
      backupDir,
      tables,
      totalRecords: tables.reduce((sum, t) => sum + t.count, 0)
    };
    
    fs.writeFileSync(path.join(backupDir, '_backup-summary.json'), JSON.stringify(summary, null, 2));

    // ===== 完成報告 =====
    console.log('\n' + '='.repeat(50));
    console.log('✅ 備份完成！');
    console.log('='.repeat(50));
    console.log(`📁 備份位置: ${backupDir}`);
    console.log(`📊 總資料表: ${tables.length} 個`);
    console.log(`📊 總資料筆數: ${summary.totalRecords}`);
    console.log('\n資料表統計:');
    tables.forEach(t => {
      console.log(`  - ${t.name}: ${t.count} 筆`);
    });

  } catch (error) {
    console.error('❌ 備份失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupAll();
