"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  isHidden?: boolean;
  children?: CategoryNodeType[];
};

export function CategoryTreeView({ nodes }: { nodes: CategoryNodeType[] }) {
  const router = useRouter();
  
  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} level={0} onRefresh={() => router.refresh()} />
      ))}
    </div>
  );
}

function TreeNode({ 
  node, 
  level, 
  onRefresh 
}: { 
  node: CategoryNodeType; 
  level: number;
  onRefresh: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [isLoading, setIsLoading] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  // 切換啟用/停用狀態
  const handleToggleActive = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const res = await fetch(`/api/admin/category-tree/${node.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !node.isActive }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "操作失敗");
      }
      
      onRefresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 切換隱藏/顯示狀態
  const handleToggleHidden = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const res = await fetch(`/api/admin/category-tree/${node.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: !node.isHidden }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "操作失敗");
      }
      
      onRefresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 刪除節點
  const handleDelete = async () => {
    if (isLoading) return;
    
    if (hasChildren) {
      alert("無法刪除有子節點的分類，請先刪除所有子節點");
      return;
    }
    
    if (!confirm(`確定要刪除「${node.name_zh}」嗎？此操作無法復原。`)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await fetch(`/api/admin/category-tree/${node.id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "刪除失敗");
      }
      
      onRefresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={node.isHidden ? "opacity-50" : ""}>
      <div
        className={`group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-zinc-50 ${
          !node.isActive 
            ? "border-red-200 bg-red-50" 
            : node.isHidden 
              ? "border-orange-200 bg-orange-50" 
              : "border-zinc-200 bg-white"
        }`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {/* 展開/收合按鈕 */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 hover:border-zinc-400 transition-all cursor-pointer"
            type="button"
            title={isExpanded ? "收合" : "展開"}
          >
            {isExpanded ? "−" : "+"}
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
                  已停用
                </span>
              )}
              {node.isHidden && (
                <span className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                  已隱藏
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
                  {node.children!.length} 個子節點
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
            <Link
              href={`/admin/category-tree/new?parentId=${node.id}`}
              className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
            >
              新增子節點
            </Link>
            
            {/* 啟用/停用 */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleActive();
              }}
              disabled={isLoading}
              type="button"
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                node.isActive
                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={node.isActive ? "點擊停用" : "點擊啟用"}
            >
              {node.isActive ? "停用" : "啟用"}
            </button>
            
            {/* 隱藏/顯示 */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleHidden();
              }}
              disabled={isLoading}
              type="button"
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                node.isHidden
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={node.isHidden ? "點擊顯示" : "點擊隱藏"}
            >
              {node.isHidden ? "顯示" : "隱藏"}
            </button>
            
            {/* 刪除 */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isLoading || hasChildren}
              type="button"
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                hasChildren
                  ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
                  : "bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={hasChildren ? "有子節點，無法刪除" : "刪除節點"}
            >
              刪除
            </button>
          </div>
        </div>
      </div>

      {/* 子節點 */}
      {hasChildren && isExpanded && (
        <div className="mt-2">
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}
