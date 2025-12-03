// app/admin/catalog-v2/page.tsx
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../components/AdminPageHeader";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CatalogV2Page() {
  const categories = await prisma.frontCategory.findMany({
    where: { version: 2 },
    include: {
      FrontCategoryTagGroup: { include: { Tag: true }, orderBy: { order: "asc" } },
      _count: { select: { FrontCategoryTagGroup: true } },
    },
    orderBy: { order: "asc" },
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="分類管理 V2"
        title="新版本分類系統"
        description="優化的分類邏輯 - 更靈活的標籤組織方式"
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            V2 新版本
          </span>
          <span className="text-sm text-zinc-500">
            共 {categories.length} 個分類
          </span>
        </div>
        <Link
          href="/admin/catalog-v2/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + 新增分類
        </Link>
      </div>

      {/* 分類列表 */}
      {categories.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <h3 className="text-lg font-semibold text-zinc-900">
            尚無 V2 版本分類
          </h3>
          <p className="mt-2 text-sm text-zinc-600">
            開始建立新版本的分類架構，使用優化的標籤系統
          </p>
          <Link
            href="/admin/catalog-v2/new"
            className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            建立第一個 V2 分類
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/admin/catalog-v2/${category.id}`}
              className="block rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              {/* 分類圖片 */}
              {category.cardImage && (
                <img
                  src={category.cardImage}
                  alt={category.name}
                  className="h-32 w-full rounded-lg object-cover"
                />
              )}

              {/* 分類資訊 */}
              <div className="mt-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {category.name}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      category.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {category.isActive ? "啟用" : "停用"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-zinc-600">
                  {category.cardDescription || "無描述"}
                </p>

                {/* 標籤群組統計 */}
                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                  <span>📁 {category._count.FrontCategoryTagGroup} 個標籤群組</span>
                  {category.baseCategory && (
                    <>
                      <span>•</span>
                      <span>🏷️ {category.baseCategory}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
