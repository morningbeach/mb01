const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  console.log('=== 更新 FilterDimension 名稱 ===\n');
  
  // 1. 硬紙盒 -> 精裝紙盒
  const rigidBox = await prisma.filterDimension.updateMany({
    where: { slug: 'rigid-box' },
    data: { 
      name_zh: '精裝紙盒',
      name_en: 'Rigid Box / Gift Box'
    }
  });
  console.log('硬紙盒 -> 精裝紙盒:', rigidBox.count, '筆更新');
  
  // 2. 成型紙盒 -> 一般紙盒
  const foldingCarton = await prisma.filterDimension.updateMany({
    where: { slug: 'folding-carton' },
    data: { 
      name_zh: '一般紙盒',
      name_en: 'Folding Carton'
    }
  });
  console.log('成型紙盒 -> 一般紙盒:', foldingCarton.count, '筆更新');
  
  // 確認更新結果
  const dims = await prisma.filterDimension.findMany({
    where: { 
      slug: { in: ['rigid-box', 'folding-carton'] }
    },
    select: { slug: true, name_zh: true, name_en: true }
  });
  console.log('\n更新後結果:');
  dims.forEach(d => console.log(`  ${d.slug}: ${d.name_zh} (${d.name_en})`));
  
  await prisma.$disconnect();
}

main();
