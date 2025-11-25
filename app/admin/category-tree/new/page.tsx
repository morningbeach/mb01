// app/admin/category-tree/new/page.tsx
import { prisma } from "@/lib/prisma";
import { CategoryNodeForm } from "../components/CategoryNodeForm";

export const dynamic = "force-dynamic";

export default async function NewCategoryNodePage() {
  // 獲取所有節點供選擇父節點
  const allNodes = await prisma.categoryNode.findMany({
    where: { isActive: true },
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
        <h1 className="text-2xl font-bold text-zinc-900">新增分類節點</h1>
        <p className="mt-1 text-sm text-zinc-600">
          建立新的分類節點，可以選擇掛在任何現有節點下方
        </p>
      </div>

      <CategoryNodeForm allNodes={allNodes} />
    </div>
  );
}
