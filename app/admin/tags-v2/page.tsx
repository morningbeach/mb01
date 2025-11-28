// app/admin/tags-v2/page.tsx
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../components/AdminPageHeader";
import TagsListClient from "./TagsListClient";

export const dynamic = "force-dynamic";

export default async function TagsV2Page() {
  const tags = await prisma.tag.findMany({
    where: { version: 2 },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
  
  // 計算每個 TAG 被多少分類節點使用
  const categoryNodes = await prisma.categoryNode.findMany({
    select: { tagIds: true },
  });
  
  const tagUsageMap: Record<string, number> = {};
  categoryNodes.forEach(node => {
    node.tagIds.forEach(tagId => {
      tagUsageMap[tagId] = (tagUsageMap[tagId] || 0) + 1;
    });
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="標籤管理 V2"
        title="新版本標籤系統"
        description="重新設計的標籤架構 - 更清晰的組織方式"
      />

      <TagsListClient initialTags={tags} tagUsageMap={tagUsageMap} />
    </>
  );
}
