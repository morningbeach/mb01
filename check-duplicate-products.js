const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  // 查找香水盒相關產品
  const perfumeProducts = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: '香水' } },
        { name_zh: { contains: '香水' } },
        { slug: { contains: 'perfume' } }
      ]
    },
    select: {
      id: true,
      name: true,
      name_zh: true,
      slug: true,
      coverImage: true,
    }
  });
  
  console.log('=== 香水盒相關產品 ===');
  console.log('總數:', perfumeProducts.length);
  
  // 檢查是否有重複的圖片
  const imageMap = new Map();
  perfumeProducts.forEach(p => {
    if (p.coverImage) {
      if (!imageMap.has(p.coverImage)) {
        imageMap.set(p.coverImage, []);
      }
      imageMap.get(p.coverImage).push(p);
    }
    console.log(`${p.id} | ${p.name_zh || p.name} | ${p.slug}`);
  });
  
  console.log('\n=== 重複圖片的產品 ===');
  imageMap.forEach((products, image) => {
    if (products.length > 1) {
      console.log(`\n圖片: ${image}`);
      products.forEach(p => console.log(`  - ${p.id} | ${p.name_zh || p.name}`));
    }
  });
  
  await prisma.$disconnect();
}

main();
