import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 分析產品與過濾器標籤的關聯...\n');

  // 1. 取得所有過濾器中的標籤 ID
  const dimensionMappings = await prisma.dimensionTagMapping.findMany({
    include: {
      tag: true,
      dimension: true,
    },
  });

  const filterTagIds = new Set(dimensionMappings.map(m => m.tagId));
  console.log(`📊 過濾器中共有 ${filterTagIds.size} 個標籤\n`);

  // 按維度分類顯示
  const dimensionGroups = new Map<string, string[]>();
  dimensionMappings.forEach(m => {
    const dimName = m.dimension.name_zh;
    if (!dimensionGroups.has(dimName)) {
      dimensionGroups.set(dimName, []);
    }
    dimensionGroups.get(dimName)!.push(m.tag.name_zh || m.tag.name);
  });

  console.log('📦 各維度標籤：');
  dimensionGroups.forEach((tags, dim) => {
    console.log(`   ${dim}: ${tags.length} 個`);
  });

  // 2. 取得所有 V2 產品及其標籤
  const products = await prisma.product.findMany({
    where: { version: 2, status: 'ACTIVE' },
    include: {
      ProductTag: {
        include: { Tag: true },
      },
    },
  });

  console.log(`\n📦 共有 ${products.length} 個 V2 產品\n`);

  // 3. 分類產品
  const productsWithFilterTags: any[] = [];
  const productsWithoutFilterTags: any[] = [];

  products.forEach(product => {
    const productTagIds = product.ProductTag.map(pt => pt.tagId);
    const hasFilterTag = productTagIds.some(id => filterTagIds.has(id));
    
    if (hasFilterTag) {
      productsWithFilterTags.push(product);
    } else {
      productsWithoutFilterTags.push(product);
    }
  });

  console.log(`✅ 有過濾器標籤的產品: ${productsWithFilterTags.length} 個`);
  console.log(`❌ 沒有過濾器標籤的產品: ${productsWithoutFilterTags.length} 個\n`);

  // 4. 列出沒有過濾器標籤的產品
  if (productsWithoutFilterTags.length > 0) {
    console.log('==========================================');
    console.log('❌ 以下產品沒有任何過濾器標籤：');
    console.log('==========================================\n');
    
    productsWithoutFilterTags.forEach((product, i) => {
      const tags = product.ProductTag.map((pt: any) => pt.Tag.name_zh || pt.Tag.name).join(', ');
      console.log(`${i + 1}. ${product.name_zh || product.name}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   URL: https://www.mbpack.co/products/${product.slug}`);
      console.log(`   現有標籤: ${tags || '(無標籤)'}`);
      console.log('');
    });
  }

  // 5. 分析各維度的產品覆蓋率
  console.log('\n==========================================');
  console.log('📊 各維度產品覆蓋統計：');
  console.log('==========================================\n');

  const dimensions = await prisma.filterDimension.findMany({
    include: {
      tagMappings: {
        include: { tag: true },
      },
    },
    orderBy: { order: 'asc' },
  });

  for (const dim of dimensions) {
    const dimTagIds = new Set(dim.tagMappings.map(m => m.tagId));
    const productsInDim = products.filter(p => 
      p.ProductTag.some(pt => dimTagIds.has(pt.tagId))
    );
    console.log(`${dim.name_zh}: ${productsInDim.length} 個產品`);
  }

  console.log('\n==========================================');
  console.log('分析完成！');
  console.log('==========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ 錯誤:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
