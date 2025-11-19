// app/admin/components/TagSelector.tsx
"use client";

import { useMemo, useState } from "react";

type TagSelectorProps = {
  name?: string; // checkbox 的 name，預設 "tagIds"
  allTags: {
    id: string;
    name: string;
    slug: string;
  }[];
  selectedTagIds?: string[];
};

export function TagSelector({
  name = "tagIds",
  allTags,
  selectedTagIds = [],
}: TagSelectorProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allTags;
    return allTags.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q)
    );
  }, [allTags, query]);

  const selectedSet = new Set(selectedTagIds);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tags by name or slug…"
          className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/40"
        />
        <span className="hidden text-[11px] text-zinc-500 md:inline-block md:w-40 md:text-right">
          {selectedTagIds.length} selected / {allTags.length} total
        </span>
      </div>

      <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-2">
        {filtered.length === 0 && (
          <p className="px-1 py-1 text-[11px] text-zinc-500">
            No tags matched “{query}”.
          </p>
        )}

        {filtered.map((tag) => (
          <label
            key={tag.id}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
          >
            <input
              type="checkbox"
              name={name}
              value={tag.id}
              defaultChecked={selectedSet.has(tag.id)}
              className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900/40"
            />
            <div className="flex flex-col">
              <span>{tag.name}</span>
              <span className="font-mono text-[10px] text-zinc-500">
                {tag.slug}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
