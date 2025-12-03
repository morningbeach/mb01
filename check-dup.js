const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  // 取得 print-packaging 類別的產品
  const categoryTagIds = await prisma.dimensionTagMapping.findMany({
    where: { dimension: { category: 'print-packaging' } },
    select: { tagId: true },
  });
  const tagIds = [...new Set(categoryTagIds.map(t => t.tagId))];
  
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      version: 2,
      ProductTag: { some: { tagId: { in: tagIds } } },
    },
    select: {
      id: true,
      slug: true,
      name_zh: true,
      coverImage: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  
  console.log('總共:', products.length, '個產品\n');
  
  // 檢查重複的 id
  const idCounts = {};
  products.forEach(p => { idCounts[p.id] = (idCounts[p.id] || 0) + 1; });
  const dupIds = Object.entries(idCounts).filter(([k, v]) => v > 1);
  console.log('重複 ID:', dupIds.length);
  
  // 檢查重複的 slug
  const slugCounts = {};
  products.forEach(p => { slugCounts[p.slug] = (slugCounts[p.slug] || 0) + 1; });
  const dupSlugs = Object.entries(slugCounts).filter(([k, v]) => v > 1);
  console.log('重複 slug:', dupSlugs.length);
  if (dupSlugs.length > 0) {
    console.log('重複的 slug:');
    dupSlugs.forEach(([s, c]) => console.log('  ', s, '出現', c, '次'));
  }
  
  // 檢查重複的圖片
  const imgCounts = {};
  products.forEach(p => {
    if (p.coverImage) {
      const key = p.coverImage.split('?')[0].toLowerCase();
      imgCounts[key] = (imgCounts[key] || 0) + 1;
    }
  });
  const dupImgs = Object.entries(imgCounts).filter(([k, v]) => v > 1);
  console.log('重複圖片:', dupImgs.length);
  if (dupImgs.length > 0) {
    console.log('\n重複的圖片:');
    dupImgs.slice(0, 10).forEach(([img, c]) => {
      const prods = products.filter(p => p.coverImage && p.coverImage.split('?')[0].toLowerCase() === img);
      console.log('  圖片出現', c, '次:');
      prods.forEach(p => console.log('    -', p.id.slice(0,8), '|', p.slug, '|', p.name_zh));
    });
  }
  
  await prisma.$disconnect();
}
check();
