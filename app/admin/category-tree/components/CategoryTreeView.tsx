"use client";

import Link from "next/link";
import { useState } from "react";

type CategoryNodeType = {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  depth: number;
  order: number;
  displayMode: string;
  isActive: boolean;
  isLeaf: boolean;
  children?: CategoryNodeType[];
};

export function CategoryTreeView({ nodes }: { nodes: CategoryNodeType[] }) {
  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} level={0} />
      ))}
    </div>
  );
}

function TreeNode({ node, level }: { node: CategoryNodeType; level: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // 預設展開前2層
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className="group flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 transition-colors hover:bg-zinc-50"
        style={{ marginLeft: `${level * 24}px` }}
      >
        {/* 展開/收合按鈕 */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-zinc-500 hover:bg-zinc-200"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        ) : (
          <div className="h-6 w-6 flex-shrink-0" />
        )}

        {/* 節點資訊 */}
        <div className="flex flex-1 items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900">{node.name_zh}</span>
              <span className="text-sm text-zinc-500">({node.name_en})</span>
              {node.isLeaf && (
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  葉節點
                </span>
              )}
              {!node.isActive && (
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                  未啟用
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-4 text-xs text-zinc-500">
              <span>Slug: {node.slug}</span>
              <span>深度: {node.depth}</span>
              <span>排序: {node.order}</span>
              <span>展示: {node.displayMode}</span>
              {hasChildren && (
                <span className="text-blue-600">
                  {node.children.length} 個子節點
                </span>
              )}
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-2">
            <Link
              href={`/catalog-tree/${node.slug}`}
              target="_blank"
              className="rounded bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
            >
              預覽
            </Link>
            <Link
              href={`/admin/category-tree/${node.id}/edit`}
              className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              編輯
            </Link>
          </div>
        </div>
      </div>

      {/* 子節點 */}
      {hasChildren && isExpanded && (
        <div className="mt-2">
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
