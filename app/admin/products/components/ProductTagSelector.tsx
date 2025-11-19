// app/admin/products/components/ProductTagSelector.tsx
"use client";

import * as React from "react";

type Tag = {
  id: string;
  slug: string;
  name: string;
  color?: string | null;
};

type Props = {
  allTags: Tag[];
  initialSelectedIds: string[];
  fieldName: string; // 送到後端的欄位名稱，例如 "tagIds"
};

export function ProductTagSelector({
  allTags,
  initialSelectedIds,
  fieldName,
}: Props) {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(
    new Set(initialSelectedIds)
  );

  const filtered = React.useMemo(() => {
    if (!query.trim()) return allTags;
    const q = query.trim().toLowerCase();
    return allTags.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q)
    );
  }, [allTags, query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {/* 搜尋列 */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-[11px] text-zinc-500">
          Total tags: <span className="font-medium">{allTags.length}</span> ·
          Selected: <span className="font-medium">{selected.size}</span>
        </div>
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-zinc-300 px-3 py-1.5 text-xs outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/40"
          />
        </div>
      </div>

      {/* 真正送去後端的值：用 hidden 把所有選中的 tagId 打包起來 */}
      {[...selected].map((id) => (
        <input key={id} type="hidden" name={fieldName} value={id} />
      ))}

      {/* Tag 列表 */}
      <div className="grid gap-2 md:grid-cols-3">
        {filtered.length === 0 && (
          <p className="col-span-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500">
            No tags matched your search.
          </p>
        )}

        {filtered.map((tag) => {
          const isSelected = selected.has(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className={
                "flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition " +
                (isSelected
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400")
              }
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{tag.name}</span>
                <span
                  className={
                    "font-mono text-[10px] " +
                    (isSelected ? "text-zinc-200" : "text-zinc-500")
                  }
                >
                  {tag.slug}
                </span>
              </div>
              <span
                className={
                  "ml-2 h-4 w-4 rounded-full border text-[9px] leading-4 " +
                  (isSelected
                    ? "border-white bg-white/20"
                    : "border-zinc-300 bg-zinc-50 text-zinc-400")
                }
              >
                {isSelected ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
