import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const productId = 'cmilxbo5u0000wy388o69mus3';
  
  console.log('🔍 檢查產品 SKU...\n');

  // 查詢當前產品
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
    },
  });

  if (!product) {
    console.log('❌ 找不到產品');
    return;
  }

  console.log('📦 當前產品：');
  console.log(`   ID: ${product.id}`);
  console.log(`   名稱: ${product.name}`);
  console.log(`   Slug: ${product.slug}`);
  console.log(`   SKU: ${product.sku === null ? '(null)' : product.sku === '' ? '(空字串)' : `"${product.sku}"`}`);

  // 查詢是否有其他產品使用相同的 SKU
  if (product.sku !== null && product.sku !== '') {
    const duplicates = await prisma.product.findMany({
      where: {
        sku: product.sku,
        NOT: { id: productId },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
      },
    });

    if (duplicates.length > 0) {
      console.log(`\n⚠️  發現 ${duplicates.length} 個產品使用相同的 SKU：`);
      duplicates.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} (${p.slug})`);
        console.log(`      ID: ${p.id}`);
        console.log(`      SKU: "${p.sku}"`);
      });
    } else {
      console.log('\n✅ 沒有其他產品使用相同的 SKU');
    }
  }

  // 檢查所有空字串 SKU
  const emptySkuProducts = await prisma.product.findMany({
    where: { sku: '' },
    select: { id: true, name: true, slug: true },
  });

  if (emptySkuProducts.length > 0) {
    console.log(`\n⚠️  發現 ${emptySkuProducts.length} 個產品的 SKU 是空字串：`);
    emptySkuProducts.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.slug})`);
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ 錯誤:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
