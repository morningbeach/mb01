// app/admin/tags-v2/page.tsx
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../components/AdminPageHeader";
import Link from "next/link";

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
  
  const tagUsageMap = new Map<string, number>();
  categoryNodes.forEach(node => {
    node.tagIds.forEach(tagId => {
      tagUsageMap.set(tagId, (tagUsageMap.get(tagId) || 0) + 1);
    });
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="標籤管理 V2"
        title="新版本標籤系統"
        description="重新設計的標籤架構 - 更清晰的組織方式"
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            V2 新版本
          </span>
          <span className="text-sm text-zinc-500">共 {tags.length} 個標籤</span>
        </div>
        <Link
          href="/admin/tags-v2/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + 新增標籤
        </Link>
      </div>

      {/* 標籤列表 */}
      {tags.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <h3 className="text-lg font-semibold text-zinc-900">
            尚無 V2 版本標籤
          </h3>
          <p className="mt-2 text-sm text-zinc-600">
            開始建立新版本的標籤，用於組織商品和分類
          </p>
          <Link
            href="/admin/tags-v2/new"
            className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            建立第一個 V2 標籤
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/admin/tags-v2/${tag.id}`}
              className="block rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-900">{tag.name}</h3>
                  {tag.subtitle && (
                    <p className="mt-1 text-xs text-zinc-600">{tag.subtitle}</p>
                  )}
                </div>
                {tag.color && (
                  <div
                    className="h-6 w-6 rounded-full border border-zinc-200"
                    style={{ backgroundColor: tag.color }}
                  />
                )}
              </div>

              {/* 使用統計 */}
              <div className="mt-3 flex gap-3 text-xs text-zinc-500">
                <span>📦 {tag._count.products} 商品</span>
                <span>📁 {tagUsageMap.get(tag.id) || 0} 分類</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
