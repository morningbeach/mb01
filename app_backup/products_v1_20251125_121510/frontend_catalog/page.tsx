// app/catalog/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Category } from "@prisma/client";

type SearchParams = {
  category?: string;
};

const categoryLabels: Record<Category, string> = {
  GIFT: "Gifts",
  GIFT_BOX: "Gift Boxes",
  GIFT_SET: "Gift Sets",
};

function mapCategoryFilter(raw?: string): Category | undefined {
  if (!raw) return undefined;
  if (raw === "gift" || raw === "GIFT") return Category.GIFT;
  if (raw === "gift-box" || raw === "GIFT_BOX") return Category.GIFT_BOX;
  if (raw === "gift-set" || raw === "GIFT_SET") return Category.GIFT_SET;
  return undefined;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const categoryFilter = mapCategoryFilter(searchParams.category);
  const products = await prisma.product.findMany({
    where: categoryFilter ? { category: categoryFilter } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      tags: { include: { tag: true } },
    },
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Catalog
        </p>
        <h1 className="text-2xl font-semibold text-slate-50">
          Packaging & gifting catalog
        </h1>
        <p className="max-w-2xl text-xs text-slate-300">
          Browse a living library of gift concepts, structural box forms and
          integrated gift sets. Each item can be tailored by material, size and
          budget.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 text-xs">
        <FilterChip href="/catalog" active={!categoryFilter}>
          All
        </FilterChip>
        <FilterChip href="/catalog?category=GIFT" active={categoryFilter === Category.GIFT}>
          Gifts
        </FilterChip>
        <FilterChip
          href="/catalog?category=GIFT_BOX"
          active={categoryFilter === Category.GIFT_BOX}
        >
          Gift boxes
        </FilterChip>
        <FilterChip
          href="/catalog?category=GIFT_SET"
          active={categoryFilter === Category.GIFT_SET}
        >
          Gift sets
        </FilterChip>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <p className="text-xs text-slate-400">No products found for this filter.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/catalog/product/${p.slug}`}
              className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-500 hover:bg-slate-900"
            >
              <div className="mb-3 aspect-[4/3] w-full rounded-xl bg-slate-800/70" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                {categoryLabels[p.category]}
              </p>
              <h2 className="mt-1 text-sm font-medium text-slate-100 group-hover:text-white">
                {p.name}
              </h2>
              {p.shortDesc && (
                <p className="mt-1 line-clamp-2 text-xs text-slate-300">
                  {p.shortDesc}
                </p>
              )}
              <div className="mt-auto flex flex-wrap gap-1 pt-3">
                {p.tags.slice(0, 3).map((pt) => (
                  <span
                    key={pt.tagId}
                    className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300"
                  >
                    {pt.tag.name}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 ${
        active
          ? "border-slate-100 bg-slate-100 text-slate-950"
          : "border-slate-700 text-slate-200 hover:border-slate-400"
      }`}
    >
      {children}
    </Link>
  );
}

