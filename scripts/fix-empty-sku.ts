import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 開始修復空字串 SKU...\n');

  // 查詢所有 SKU 為空字串的產品
  const productsWithEmptySku = await prisma.product.findMany({
    where: {
      sku: '',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
    },
  });

  console.log(`找到 ${productsWithEmptySku.length} 個產品的 SKU 為空字串`);

  if (productsWithEmptySku.length > 0) {
    console.log('\n產品列表：');
    productsWithEmptySku.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (${p.slug})`);
    });

    console.log('\n正在將空字串 SKU 轉換為 null...');

    // 將空字串轉換為 null
    const result = await prisma.product.updateMany({
      where: {
        sku: '',
      },
      data: {
        sku: null,
      },
    });

    console.log(`✅ 成功更新 ${result.count} 個產品`);
  } else {
    console.log('✅ 沒有需要修復的產品');
  }

  console.log('\n==========================================');
  console.log('修復完成！');
  console.log('==========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ 錯誤:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
