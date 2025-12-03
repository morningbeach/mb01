const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreDatabase() {
  const backupFile = process.argv[2] || path.join(__dirname, '..', 'db_backups', 'full_backup_2025-11-28T05-03-25.json');
  
  if (!fs.existsSync(backupFile)) {
    console.error('❌ 備份檔案不存在:', backupFile);
    process.exit(1);
  }

  console.log('📁 讀取備份檔案:', backupFile);
  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  
  console.log('開始還原資料庫...\n');
  
  try {
    // 按照依賴順序還原 (先還原沒有外鍵依賴的表)
    
    // 1. 基礎表格
    if (backup.tags?.length) {
      console.log(`還原 Tags (${backup.tags.length} 筆)...`);
      for (const item of backup.tags) {
        await prisma.tag.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    if (backup.categoryNodes?.length) {
      console.log(`還原 CategoryNodes (${backup.categoryNodes.length} 筆)...`);
      for (const item of backup.categoryNodes) {
        await prisma.categoryNode.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    if (backup.products?.length) {
      console.log(`還原 Products (${backup.products.length} 筆)...`);
      for (const item of backup.products) {
        await prisma.product.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    if (backup.productTags?.length) {
      console.log(`還原 ProductTags (${backup.productTags.length} 筆)...`);
      for (const item of backup.productTags) {
        try {
          await prisma.productTag.upsert({
            where: { id: item.id },
            update: item,
            create: item,
          });
        } catch (e) {
          // 忽略外鍵錯誤
        }
      }
    }

    if (backup.blogPosts?.length) {
      console.log(`還原 BlogPosts (${backup.blogPosts.length} 筆)...`);
      for (const item of backup.blogPosts) {
        await prisma.blogPost.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    if (backup.blogTags?.length) {
      console.log(`還原 BlogTags (${backup.blogTags.length} 筆)...`);
      for (const item of backup.blogTags) {
        try {
          await prisma.blogTag.upsert({
            where: { id: item.id },
            update: item,
            create: item,
          });
        } catch (e) {
          // 忽略
        }
      }
    }

    if (backup.pages?.length) {
      console.log(`還原 Pages (${backup.pages.length} 筆)...`);
      for (const item of backup.pages) {
        await prisma.page.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    if (backup.frontCategories?.length) {
      console.log(`還原 FrontCategories (${backup.frontCategories.length} 筆)...`);
      for (const item of backup.frontCategories) {
        await prisma.frontCategory.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    if (backup.frontCategoryTagGroups?.length) {
      console.log(`還原 FrontCategoryTagGroups (${backup.frontCategoryTagGroups.length} 筆)...`);
      for (const item of backup.frontCategoryTagGroups) {
        try {
          await prisma.frontCategoryTagGroup.upsert({
            where: { id: item.id },
            update: item,
            create: item,
          });
        } catch (e) {
          // 忽略
        }
      }
    }

    if (backup.giftSets?.length) {
      console.log(`還原 GiftSets (${backup.giftSets.length} 筆)...`);
      for (const item of backup.giftSets) {
        await prisma.giftSet.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    if (backup.giftSetItems?.length) {
      console.log(`還原 GiftSetItems (${backup.giftSetItems.length} 筆)...`);
      for (const item of backup.giftSetItems) {
        try {
          await prisma.giftSetItem.upsert({
            where: { id: item.id },
            update: item,
            create: item,
          });
        } catch (e) {
          // 忽略
        }
      }
    }

    if (backup.imageAssets?.length) {
      console.log(`還原 ImageAssets (${backup.imageAssets.length} 筆)...`);
      for (const item of backup.imageAssets) {
        await prisma.imageAsset.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    if (backup.homeSections?.length) {
      console.log(`還原 HomeSections (${backup.homeSections.length} 筆)...`);
      for (const item of backup.homeSections) {
        await prisma.homeSection.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    if (backup.images?.length) {
      console.log(`還原 Images (${backup.images.length} 筆)...`);
      for (const item of backup.images) {
        await prisma.image.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    if (backup.albums?.length) {
      console.log(`還原 Albums (${backup.albums.length} 筆)...`);
      for (const item of backup.albums) {
        await prisma.album.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    if (backup.albumImages?.length) {
      console.log(`還原 AlbumImages (${backup.albumImages.length} 筆)...`);
      for (const item of backup.albumImages) {
        try {
          await prisma.albumImage.upsert({
            where: { id: item.id },
            update: item,
            create: item,
          });
        } catch (e) {
          // 忽略
        }
      }
    }

    if (backup.productImages?.length) {
      console.log(`還原 ProductImages (${backup.productImages.length} 筆)...`);
      for (const item of backup.productImages) {
        try {
          await prisma.productImage.upsert({
            where: { id: item.id },
            update: item,
            create: item,
          });
        } catch (e) {
          // 忽略
        }
      }
    }

    if (backup.sitePages?.length) {
      console.log(`還原 SitePages (${backup.sitePages.length} 筆)...`);
      for (const item of backup.sitePages) {
        await prisma.sitePage.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    if (backup.caseProjects?.length) {
      console.log(`還原 CaseProjects (${backup.caseProjects.length} 筆)...`);
      for (const item of backup.caseProjects) {
        await prisma.caseProject.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    if (backup.virtualFolders?.length) {
      console.log(`還原 VirtualFolders (${backup.virtualFolders.length} 筆)...`);
      for (const item of backup.virtualFolders) {
        await prisma.virtualFolder.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    if (backup.trendReports?.length) {
      console.log(`還原 TrendReports (${backup.trendReports.length} 筆)...`);
      for (const item of backup.trendReports) {
        await prisma.trendReport.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
      }
    }

    console.log('\n✅ 資料庫還原完成!');

  } catch (error) {
    console.error('❌ 還原失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

restoreDatabase();
