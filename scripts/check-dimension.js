const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // 查看 folding-carton 維度
  const foldingCartonDim = await prisma.filterDimension.findFirst({
    where: { slug: 'folding-carton' },
    include: {
      FilterDimensionTag: {
        include: { Tag: true }
      }
    }
  });
  
  console.log('folding-carton 維度:');
  if (foldingCartonDim) {
    console.log(`  ID: ${foldingCartonDim.id}`);
    console.log(`  Name: ${foldingCartonDim.name_zh}`);
    console.log('  Tags:');
    foldingCartonDim.FilterDimensionTag.forEach(fdt => {
      console.log(`    - ${fdt.Tag.slug}: ${fdt.Tag.name_zh}`);
    });
  } else {
    console.log('  未找到');
  }
  
  // 查看飛機盒 tag 是否已在某個維度中
  const airplaneTag = await prisma.tag.findFirst({
    where: { slug: 'airplane-box' }
  });
  
  if (airplaneTag) {
    console.log('\n飛機盒 tag:');
    console.log(`  ID: ${airplaneTag.id}`);
    
    const existingRelation = await prisma.filterDimensionTag.findFirst({
      where: { tagId: airplaneTag.id },
      include: { FilterDimension: true }
    });
    
    if (existingRelation) {
      console.log(`  已在維度: ${existingRelation.FilterDimension.name_zh}`);
    } else {
      console.log('  尚未關聯到任何維度');
    }
  }
  
  await prisma.$disconnect();
}

run();
