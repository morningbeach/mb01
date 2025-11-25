"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Display mode 配置
const displayModeConfig = {
  "hero-cards": {
    name_zh: "大圖卡片",
    name_en: "Hero Cards",
    description_zh: "大型橫幅卡片展示",
    description_en: "Large banner card display",
  },
  grid: {
    name_zh: "網格",
    name_en: "Grid",
    description_zh: "標準網格佈局",
    description_en: "Standard grid layout",
  },
  masonry: {
    name_zh: "瀑布流",
    name_en: "Masonry",
    description_zh: "不規則高度排列",
    description_en: "Irregular height arrangement",
  },
  waterfall: {
    name_zh: "瀑布流",
    name_en: "Waterfall",
    description_zh: "流式瀑布排列",
    description_en: "Flowing waterfall layout",
  },
  carousel: {
    name_zh: "輪播",
    name_en: "Carousel",
    description_zh: "橫向滑動輪播",
    description_en: "Horizontal scrolling carousel",
  },
  list: {
    name_zh: "列表",
    name_en: "List",
    description_zh: "詳細列表模式",
    description_en: "Detailed list mode",
  },
  "product-detail": {
    name_zh: "產品詳情",
    name_en: "Product Detail",
    description_zh: "完整產品頁面",
    description_en: "Full product page",
  },
};

export default function TreeViewPage() {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [lang, setLang] = useState<"zh" | "en">("zh");

  useEffect(() => {
    fetch("/api/category-tree")
      .then(res => res.json())
      .then(data => {
        setTreeData(data.tree || []);
        // 默認展開所有第一層
        const firstLevelIds = new Set<string>();
        (data.tree || []).forEach((node: any) => {
          firstLevelIds.add(node.id);
        });
        setExpandedNodes(firstLevelIds);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load tree:", err);
        setLoading(false);
      });
  }, []);

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const traverseTree = (node: any, callback: (n: any) => void) => {
    callback(node);
    if (node.children) {
      node.children.forEach((child: any) => traverseTree(child, callback));
    }
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    treeData.forEach(node => traverseTree(node, (n) => allIds.add(n.id)));
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    const firstLevelIds = new Set<string>();
    treeData.forEach(node => firstLevelIds.add(node.id));
    setExpandedNodes(firstLevelIds);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-zinc-600">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-16 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">🌳 完整樹狀結構</h1>
              <p className="mt-1 text-sm text-zinc-600">可視化商品分類架構</p>
            </div>
            <div className="flex items-center gap-2">
              {/* 語言切換 */}
              <div className="flex gap-1 rounded-full border border-zinc-300 p-0.5">
                <button
                  onClick={() => setLang("zh")}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    lang === "zh" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  中
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    lang === "en" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  EN
                </button>
              </div>

              {/* 展開/收合按鈕 */}
              <button
                onClick={expandAll}
                className="rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                全部展開
              </button>
              <button
                onClick={collapseAll}
                className="rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                全部收合
              </button>
              <Link
                href="/catalog-tree"
                className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
              >
                返回
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 樹狀結構 */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          {treeData.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              expanded={expandedNodes}
              onToggle={toggleNode}
              lang={lang}
              depth={0}
            />
          ))}
        </div>

        {/* 圖例 */}
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold tracking-tight text-zinc-900">展示模式說明</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(displayModeConfig).map(([key, config]) => (
              <div key={key} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <div className="text-sm font-medium text-zinc-900">
                  {config[`name_${lang}`]}
                </div>
                <div className="mt-1 text-xs leading-relaxed text-zinc-600">
                  {config[`description_${lang}`]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeNode({
  node,
  expanded,
  onToggle,
  lang,
  depth,
}: {
  node: any;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  lang: "zh" | "en";
  depth: number;
}) {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children && node.children.length > 0;

  // 根據層級決定顏色
  const levelColors = [
    "border-l-blue-500 bg-blue-50",
    "border-l-green-500 bg-green-50",
    "border-l-purple-500 bg-purple-50",
    "border-l-orange-500 bg-orange-50",
    "border-l-pink-500 bg-pink-50",
  ];

  const levelColor = levelColors[Math.min(depth, levelColors.length - 1)];

  return (
    <div className="mb-2">
      <div
        className={`flex items-start gap-3 rounded-lg border-l-4 p-3 ${levelColor}`}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        {/* 展開/收合按鈕 */}
        {hasChildren && (
          <button
            onClick={() => onToggle(node.id)}
            className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border border-zinc-300 bg-white text-xs font-bold text-zinc-600 hover:bg-zinc-100"
          >
            {isExpanded ? "−" : "+"}
          </button>
        )}
        {!hasChildren && <div className="h-5 w-5 flex-shrink-0" />}

        {/* 節點資訊 */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900">
              {lang === 'zh' ? node.name_zh : node.name_en}
            </span>
            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600">
              Level {node.depth}
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs text-zinc-600">
              {displayModeConfig[node.displayMode as keyof typeof displayModeConfig]?.[`name_${lang}`]}
            </span>
            {hasChildren && (
              <span className="text-xs text-zinc-500">
                ({node.children.length} 個子項)
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-zinc-600">
            {lang === 'zh' ? node.description_zh : node.description_en}
          </div>
          <Link
            href={`/catalog-tree/${node.slug}`}
            className="mt-2 inline-flex text-xs text-blue-600 hover:underline"
          >
            前往查看 →
          </Link>
        </div>
      </div>

      {/* 子節點 */}
      {isExpanded && hasChildren && (
        <div className="mt-1">
          {node.children.map((child: any) => (
            <TreeNode
              key={child.id}
              node={child}
              expanded={expanded}
              onToggle={onToggle}
              lang={lang}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
