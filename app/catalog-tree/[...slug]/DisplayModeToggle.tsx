"use client";

import Link from "next/link";

const displayModes = [
  { value: "hero-cards", label: "大圖卡片", icon: "🎴" },
  { value: "grid", label: "網格", icon: "▦" },
  { value: "masonry", label: "瀑布流", icon: "⬚" },
  { value: "waterfall", label: "流式", icon: "≋" },
  { value: "carousel", label: "輪播", icon: "⟳" },
  { value: "list", label: "列表", icon: "☰" },
  { value: "product-detail", label: "詳情", icon: "◉" },
];

export function DisplayModeToggle({
  currentMode,
  currentPath,
}: {
  currentMode: string;
  currentPath: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-600">
          展示模式切換 <span className="text-[10px] text-zinc-400">(測試功能，未來僅後台可切換)</span>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {displayModes.map((mode) => (
          <Link
            key={mode.value}
            href={`/catalog-tree/${currentPath}?displayMode=${mode.value}`}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              currentMode === mode.value
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50"
            }`}
          >
            <span>{mode.icon}</span>
            <span>{mode.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
