import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 找出同時屬於多個類別的標籤
  const allMappings = await prisma.dimensionTagMapping.findMany({
    include: {
      tag: true,
      dimension: true,
    },
  });

  // 按 tagId 分組
  const tagCategoryMap = new Map<string, { tag: any; categories: Set<string> }>();
  
  for (const mapping of allMappings) {
    if (!tagCategoryMap.has(mapping.tagId)) {
      tagCategoryMap.set(mapping.tagId, {
        tag: mapping.tag,
        categories: new Set(),
      });
    }
    tagCategoryMap.get(mapping.tagId)!.categories.add(mapping.dimension.category);
  }

  // 找出跨類別的標籤
  console.log('=== 同時屬於多個類別的標籤 ===\n');
  const crossCategoryTags: string[] = [];
  
  for (const [tagId, data] of tagCategoryMap) {
    if (data.categories.size > 1) {
      console.log(`${data.tag.slug} (${data.tag.name_zh})`);
      console.log(`  類別: ${Array.from(data.categories).join(', ')}`);
      crossCategoryTags.push(data.tag.slug);
    }
  }

  if (crossCategoryTags.length === 0) {
    console.log('沒有找到跨類別的標籤');
  } else {
    console.log(`\n總共 ${crossCategoryTags.length} 個跨類別標籤`);
    console.log('\n建議加入 EXCLUDED_TAG_SLUGS:');
    console.log(JSON.stringify(crossCategoryTags, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
