// app/admin/category-tree/new/page.tsx
import { prisma } from "@/lib/prisma";
import { CategoryNodeForm } from "../components/CategoryNodeForm";
import { CategoryTreeView } from "../components/CategoryTreeView";

export const dynamic = "force-dynamic";

export default async function NewCategoryNodePage({ searchParams }: { searchParams?: { parentId?: string } }) {
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
      parentId: true,
    },
  });

  // 構建樹狀結構
  function buildTree(nodes) {
    const nodeMap = {};
    nodes.forEach(n => nodeMap[n.id] = { ...n, children: [] });
    const roots = [];
    nodes.forEach(n => {
      if (n.parentId && nodeMap[n.parentId]) {
        nodeMap[n.parentId].children.push(nodeMap[n.id]);
      } else {
        roots.push(nodeMap[n.id]);
      }
    });
    return roots;
  }
  const treeNodes = buildTree(allNodes);

  // 取得 parentId query
  const parentId = searchParams?.parentId || "";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">新增分類節點</h1>
        <p className="mt-1 text-sm text-zinc-600">
          建立新的分類節點，可以選擇掛在任何現有節點下方
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">目前分類樹狀結構</h2>
        <CategoryTreeView nodes={treeNodes} />
      </div>

      <CategoryNodeForm allNodes={allNodes.map(n => ({ ...n, parentId: n.parentId }))} node={undefined} initialParentId={parentId} />
    </div>
  );
}
