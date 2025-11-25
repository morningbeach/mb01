// app/admin/products-v2/page.tsx
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../components/AdminPageHeader";
import Link from "next/link";
import { ProductCard } from "./components/ProductCard";

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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
