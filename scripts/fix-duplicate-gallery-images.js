/**
 * 修正產品 gallery 中重複的封面圖
 * 移除 images 陣列中與 coverImage 相同的圖片
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDuplicateGalleryImages() {
  console.log('🔍 開始檢查產品圖片...\n');

  try {
    // 取得所有 V2 產品
    const products = await prisma.product.findMany({
      where: { version: 2 },
      select: {
        id: true,
        name: true,
        name_zh: true,
        coverImage: true,
        images: true,
      },
    });

    console.log(`📦 找到 ${products.length} 個 V2 產品\n`);

    let fixedCount = 0;

    for (const product of products) {
      const productName = product.name_zh || product.name || product.id;
      
      // 檢查 images 陣列是否包含 coverImage
      if (product.coverImage && product.images && product.images.length > 0) {
        const hasDuplicate = product.images.includes(product.coverImage);
        
        if (hasDuplicate) {
          // 移除重複的封面圖
          const cleanedImages = product.images.filter(img => img !== product.coverImage);
          
          console.log(`🔧 修正: ${productName}`);
          console.log(`   封面圖: ${product.coverImage.substring(0, 50)}...`);
          console.log(`   原本 images: ${product.images.length} 張`);
          console.log(`   修正後 images: ${cleanedImages.length} 張`);
          
          // 更新資料庫
          await prisma.product.update({
            where: { id: product.id },
            data: { images: cleanedImages },
          });
          
          fixedCount++;
          console.log(`   ✅ 已修正\n`);
        }
      }
    }

    console.log('='.repeat(50));
    console.log(`\n🎉 完成！共修正 ${fixedCount} 個產品`);
    
    if (fixedCount === 0) {
      console.log('   沒有發現需要修正的產品');
    }

  } catch (error) {
    console.error('❌ 發生錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateGalleryImages();
