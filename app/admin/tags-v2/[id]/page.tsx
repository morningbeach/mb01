import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { TagForm } from "../components/TagForm";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TagDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
      products: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              name_zh: true,
              name_en: true,
              coverImage: true,
              slug: true,
            },
          },
        },
        take: 10,
      },
    },
  });

  if (!tag || tag.version !== 2) {
    notFound();
  }

  // 檢查雙語完整性
  const hasEnglish = !!tag.name_en;
  const hasChinese = !!tag.name_zh;
  const isBilingual = hasEnglish && hasChinese;

  return (
    <>
      <AdminPageHeader
        eyebrow="標籤編輯"
        title={tag.name_zh || tag.name_en || tag.name}
        description={`正在編輯標籤 · ${tag._count.products} 個產品使用中`}
      />

      {/* 雙語狀態提示 */}
      {!isBilingual && (
        <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="font-medium text-yellow-800">雙語資料不完整</span>
          </div>
          <p className="mt-1 text-sm text-yellow-700">
            {!hasEnglish && "缺少英文名稱。"}
            {!hasChinese && "缺少中文名稱。"}
            請在下方表單中補齊。
          </p>
        </div>
      )}

      {isBilingual && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="font-medium text-green-800">雙語資料完整</span>
          </div>
          <p className="mt-1 text-sm text-green-700">
            英文：{tag.name_en} · 中文：{tag.name_zh}
          </p>
        </div>
      )}

      {/* 編輯表單 */}
      <TagForm tag={tag} />

      {/* 使用此標籤的產品 */}
      {tag._count.products > 0 && (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            📦 使用此標籤的產品 ({tag._count.products})
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {tag.products.map((pt) => (
              <Link
                key={pt.product.id}
                href={`/admin/products-v2/${pt.product.id}`}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 hover:bg-zinc-50 transition-colors"
              >
                {pt.product.coverImage ? (
                  <img
                    src={pt.product.coverImage}
                    alt=""
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-zinc-100 flex items-center justify-center text-zinc-400">
                    📷
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900 truncate">
                    {pt.product.name_zh || pt.product.name_en || pt.product.name}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {pt.product.name_en || pt.product.slug}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          {tag._count.products > 10 && (
            <p className="mt-3 text-sm text-zinc-500 text-center">
              還有 {tag._count.products - 10} 個產品未顯示...
            </p>
          )}
        </div>
      )}
    </>
  );
}
