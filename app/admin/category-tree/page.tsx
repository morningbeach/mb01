// app/admin/category-tree/page.tsx - 樹狀分類管理主頁
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CategoryTreeView } from "./components/CategoryTreeView";

export const dynamic = "force-dynamic";

export default async function CategoryTreeAdminPage() {
  // 載入完整樹狀結構
  const rootNodes = await prisma.categoryNode.findMany({
    where: { parentId: null, isActive: true },
    include: {
      children: {
        include: {
          children: {
            include: {
              children: {
                include: {
                  children: true,
                },
              },
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  const allNodes = await prisma.categoryNode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">樹狀分類管理</h1>
          <p className="mt-1 text-sm text-zinc-600">
            建立彈性的多層級分類結構，每個節點可獨立設定展示方式
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/catalog-tree/tree-view"
            target="_blank"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            前台預覽 →
          </Link>
          <Link
            href="/admin/category-tree/new"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            + 新增節點
          </Link>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm text-zinc-600">總節點數</div>
          <div className="mt-1 text-2xl font-bold text-zinc-900">{allNodes.length}</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm text-zinc-600">根節點</div>
          <div className="mt-1 text-2xl font-bold text-zinc-900">{rootNodes.length}</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm text-zinc-600">葉節點</div>
          <div className="mt-1 text-2xl font-bold text-zinc-900">
            {allNodes.filter(n => n.isLeaf).length}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm text-zinc-600">最大深度</div>
          <div className="mt-1 text-2xl font-bold text-zinc-900">
            {calculateMaxDepth(rootNodes)}
          </div>
        </div>
      </div>

      {/* 樹狀結構視圖 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">分類結構</h2>
        {rootNodes.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
            <div className="text-4xl">🌳</div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">尚無分類節點</h3>
            <p className="mt-2 text-sm text-zinc-600">
              建立第一個根節點開始建構你的分類樹
            </p>
            <Link
              href="/admin/category-tree/new"
              className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              建立根節點
            </Link>
          </div>
        ) : (
          <CategoryTreeView nodes={rootNodes} />
        )}
      </div>

      {/* 展示模式說明 */}
      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">可用展示模式</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {displayModes.map((mode) => (
            <div key={mode.value} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{mode.icon}</span>
                <span className="font-semibold text-zinc-900">{mode.label}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-600">{mode.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function calculateMaxDepth(nodes: any[], currentDepth = 1): number {
  if (!nodes || nodes.length === 0) return currentDepth - 1;
  
  let maxDepth = currentDepth;
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      const childDepth = calculateMaxDepth(node.children, currentDepth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
  }
  return maxDepth;
}

const displayModes = [
  { value: "hero-cards", label: "英雄區+卡片", icon: "🎨", description: "大圖Banner + 子分類卡片網格" },
  { value: "grid", label: "網格展示", icon: "▦", description: "標準網格排列" },
  { value: "masonry", label: "瀑布流", icon: "⚡", description: "不規則高度的瀑布流" },
  { value: "waterfall", label: "多列瀑布", icon: "💧", description: "多列瀑布流展示" },
  { value: "carousel", label: "輪播", icon: "🎠", description: "橫向輪播瀏覽" },
  { value: "list", label: "列表", icon: "📋", description: "簡潔列表展示" },
];
