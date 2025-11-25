// app/admin/products-v2/page.tsx
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../components/AdminPageHeader";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductsV2Page() {
  const products = await prisma.product.findMany({
    where: { version: 2 },
    include: {
      tags: { include: { tag: true } },
      _count: { select: { tags: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="商品管理 V2"
        title="新版本商品系統"
        description="優化的商品管理介面 - 更簡潔、更直觀"
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            V2 新版本
          </span>
          <span className="text-sm text-zinc-500">
            共 {products.length} 個商品
          </span>
        </div>
        <Link
          href="/admin/products-v2/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + 新增商品
        </Link>
      </div>

      {/* 商品網格 */}
      {products.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <h3 className="text-lg font-semibold text-zinc-900">
            尚無 V2 版本商品
          </h3>
          <p className="mt-2 text-sm text-zinc-600">
            開始建立新版本的商品，使用優化的框架和更清晰的分類邏輯
          </p>
          <Link
            href="/admin/products-v2/new"
            className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            建立第一個 V2 商品
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products-v2/${product.id}/edit`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-white hover:shadow-lg transition-all"
            >
              {/* 產品圖片 */}
              {product.coverImage ? (
                <img
                  src={product.coverImage}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="h-full w-full bg-zinc-100 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-zinc-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {/* 遮罩資訊 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="text-white font-medium text-sm line-clamp-2 mb-1">
                    {product.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/80">
                      {product.category}
                    </span>
                    {product.status === "ACTIVE" && (
                      <span className="inline-flex rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
                        已發布
                      </span>
                    )}
                    {product.status === "DRAFT" && (
                      <span className="inline-flex rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-white">
                        草稿
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 狀態角標 */}
              <div className="absolute top-2 right-2">
                {product.status === "ACTIVE" && (
                  <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-white"></div>
                )}
                {product.status === "DRAFT" && (
                  <div className="w-3 h-3 rounded-full bg-yellow-500 ring-2 ring-white"></div>
                )}
                {product.status === "ARCHIVED" && (
                  <div className="w-3 h-3 rounded-full bg-zinc-400 ring-2 ring-white"></div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
