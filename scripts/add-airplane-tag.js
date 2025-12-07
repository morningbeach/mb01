const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // 1. 查看 folding-carton 維度和其下的 tags
  const foldingCartonDim = await prisma.filterDimension.findFirst({
    where: { slug: 'folding-carton' },
    include: {
      tagMappings: {
        include: { tag: true },
        orderBy: { order: 'asc' }
      }
    }
  });
  
  console.log('=== folding-carton 維度 ===');
  if (foldingCartonDim) {
    console.log(`ID: ${foldingCartonDim.id}`);
    console.log(`Name: ${foldingCartonDim.name_zh}`);
    console.log('目前的 Tags:');
    foldingCartonDim.tagMappings.forEach((tm, i) => {
      console.log(`  ${i+1}. ${tm.tag.slug}: ${tm.tag.name_zh}`);
    });
  } else {
    console.log('未找到 folding-carton 維度');
  }
  
  // 2. 查看飛機盒 tag
  const airplaneTag = await prisma.tag.findFirst({
    where: { slug: 'airplane-box' }
  });
  
  console.log('\n=== 飛機盒 tag ===');
  if (airplaneTag) {
    console.log(`ID: ${airplaneTag.id}`);
    console.log(`slug: ${airplaneTag.slug}`);
    console.log(`name_zh: ${airplaneTag.name_zh}`);
    
    // 檢查飛機盒是否已在 folding-carton 維度
    const existingMapping = await prisma.dimensionTagMapping.findFirst({
      where: {
        dimensionId: foldingCartonDim?.id,
        tagId: airplaneTag.id
      }
    });
    
    if (existingMapping) {
      console.log('✓ 飛機盒已在 folding-carton 維度中');
    } else if (foldingCartonDim) {
      // 加入飛機盒到 folding-carton 維度
      console.log('正在將飛機盒加入 folding-carton 維度...');
      
      // 取得目前最大的 order
      const maxOrder = Math.max(...foldingCartonDim.tagMappings.map(tm => tm.order), 0);
      
      await prisma.dimensionTagMapping.create({
        data: {
          dimensionId: foldingCartonDim.id,
          tagId: airplaneTag.id,
          order: maxOrder + 1
        }
      });
      
      console.log(`✓ 已將飛機盒加入 folding-carton 維度 (order: ${maxOrder + 1})`);
    }
  } else {
    console.log('未找到飛機盒 tag');
  }
  
  // 3. 驗證結果
  console.log('\n=== 驗證結果 ===');
  const updatedDim = await prisma.filterDimension.findFirst({
    where: { slug: 'folding-carton' },
    include: {
      tagMappings: {
        include: { tag: true },
        orderBy: { order: 'asc' }
      }
    }
  });
  
  if (updatedDim) {
    console.log('folding-carton 維度現在的 tags:');
    updatedDim.tagMappings.forEach((tm, i) => {
      const isAirplane = tm.tag.slug === 'airplane-box' ? ' ⭐' : '';
      console.log(`  ${i+1}. ${tm.tag.slug}: ${tm.tag.name_zh}${isAirplane}`);
    });
  }
  
  await prisma.$disconnect();
}

run();
