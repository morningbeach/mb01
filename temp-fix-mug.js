const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 找到舊的 mag 標籤
  const oldTag = await prisma.tag.findFirst({
    where: { slug: 'mag' }
  });
  
  // 找到新的 mug 標籤
  const newTag = await prisma.tag.findFirst({
    where: { slug: 'mug' }
  });
  
  if (!oldTag || !newTag) {
    console.log('找不到標籤');
    return;
  }
  
  console.log('舊標籤 (mag):', oldTag.id);
  console.log('新標籤 (mug):', newTag.id);
  
  // 將舊標籤的產品關聯遷移到新標籤
  const oldProductTags = await prisma.productTag.findMany({
    where: { tagId: oldTag.id }
  });
  
  console.log(`需要遷移 ${oldProductTags.length} 個產品關聯`);
  
  for (const pt of oldProductTags) {
    // 檢查新標籤是否已有該產品的關聯
    const existing = await prisma.productTag.findFirst({
      where: { productId: pt.productId, tagId: newTag.id }
    });
    
    if (!existing) {
      await prisma.productTag.create({
        data: {
          productId: pt.productId,
          tagId: newTag.id
        }
      });
      console.log(`  已遷移產品: ${pt.productId}`);
    } else {
      console.log(`  產品已存在: ${pt.productId}`);
    }
  }
  
  // 刪除舊的 productTag 關聯
  await prisma.productTag.deleteMany({
    where: { tagId: oldTag.id }
  });
  console.log('已刪除舊的產品關聯');
  
  // 刪除舊標籤
  await prisma.tag.delete({
    where: { id: oldTag.id }
  });
  console.log('已刪除舊標籤 (mag)');
  
  // 驗證
  const count = await prisma.productTag.count({
    where: { tagId: newTag.id }
  });
  console.log(`\n新標籤 (mug) 現在有 ${count} 個產品關聯`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
