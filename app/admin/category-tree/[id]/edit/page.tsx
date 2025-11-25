// app/admin/category-tree/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CategoryNodeForm } from "../../components/CategoryNodeForm";

export const dynamic = "force-dynamic";

export default async function EditCategoryNodePage({
  params,
}: {
  params: { id: string };
}) {
  const node = await prisma.categoryNode.findUnique({
    where: { id: params.id },
  });

  if (!node) {
    return notFound();
  }

  // 獲取所有節點供選擇父節點（排除自己和自己的子節點）
  const allNodes = await prisma.categoryNode.findMany({
    where: {
      isActive: true,
      NOT: {
        OR: [
          { id: params.id }, // 排除自己
          { path: { has: node.slug } }, // 排除自己的子節點
        ],
      },
    },
    orderBy: [{ depth: "asc" }, { order: "asc" }],
    select: {
      id: true,
      slug: true,
      name_zh: true,
      name_en: true,
      depth: true,
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">編輯分類節點</h1>
        <p className="mt-1 text-sm text-zinc-600">
          編輯 {node.name_zh} ({node.slug})
        </p>
      </div>

      <CategoryNodeForm node={node} allNodes={allNodes} />
    </div>
  );
}
