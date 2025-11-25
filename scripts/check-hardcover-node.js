// 檢查 hardcover-boxes 節點資料
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNode() {
  const node = await prisma.categoryNode.findUnique({
    where: { slug: 'hardcover-boxes' },
    include: {
      children: {
        where: { isActive: true },
      },
    },
  });

  console.log('\n📦 hardcover-boxes 節點資料：\n');
  console.log('ID:', node?.id);
  console.log('Name:', node?.name_zh, '/', node?.name_en);
  console.log('isLeaf:', node?.isLeaf);
  console.log('tagIds:', node?.tagIds);
  console.log('子節點數量:', node?.children?.length || 0);
  console.log('displayMode:', node?.displayMode);
  console.log('path:', node?.path);
  
  if (node?.children && node.children.length > 0) {
    console.log('\n子節點列表:');
    node.children.forEach(child => {
      console.log(`  - ${child.name_zh} (${child.slug}) - isLeaf: ${child.isLeaf}`);
    });
  }

  // 如果有 tagIds，查詢對應的產品
  if (node?.tagIds && node.tagIds.length > 0) {
    console.log('\n🏷️  關聯的 TAG IDs:', node.tagIds);
    
    const products = await prisma.product.findMany({
      where: {
        version: 2,
        status: 'ACTIVE',
        tags: {
          some: {
            tagId: { in: node.tagIds },
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
      },
    });

    console.log(`\n找到 ${products.length} 個產品：`);
    products.forEach(p => {
      console.log(`  - ${p.name} (${p.slug}) SKU: ${p.sku}`);
    });
  }
}

checkNode()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
