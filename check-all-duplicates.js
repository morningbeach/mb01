const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  // 查找所有產品
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      name_zh: true,
      slug: true,
      coverImage: true,
      category: true,
    }
  });
  
  console.log('=== 所有產品總數 ===');
  console.log('總數:', allProducts.length);
  
  // 檢查是否有重複的圖片
  const imageMap = new Map();
  allProducts.forEach(p => {
    if (p.coverImage) {
      if (!imageMap.has(p.coverImage)) {
        imageMap.set(p.coverImage, []);
      }
      imageMap.get(p.coverImage).push(p);
    }
  });
  
  console.log('\n=== 重複圖片的產品 ===');
  let duplicateCount = 0;
  imageMap.forEach((products, image) => {
    if (products.length > 1) {
      duplicateCount++;
      console.log(`\n圖片: ${image.substring(0, 80)}...`);
      products.forEach(p => console.log(`  - [${p.category}] ${p.id} | ${p.name_zh || p.name}`));
    }
  });
  
  if (duplicateCount === 0) {
    console.log('沒有發現重複圖片的產品');
  } else {
    console.log(`\n總共有 ${duplicateCount} 組重複圖片`);
  }
  
  // 檢查是否有重複的 slug
  const slugMap = new Map();
  allProducts.forEach(p => {
    if (!slugMap.has(p.slug)) {
      slugMap.set(p.slug, []);
    }
    slugMap.get(p.slug).push(p);
  });
  
  console.log('\n=== 重複 slug 的產品 ===');
  let slugDuplicateCount = 0;
  slugMap.forEach((products, slug) => {
    if (products.length > 1) {
      slugDuplicateCount++;
      console.log(`\nSlug: ${slug}`);
      products.forEach(p => console.log(`  - ${p.id} | ${p.name_zh || p.name}`));
    }
  });
  
  if (slugDuplicateCount === 0) {
    console.log('沒有發現重複 slug 的產品');
  }
  
  await prisma.$disconnect();
}

main();
