// app/catalog/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/SiteShell";

export const dynamic = "force-dynamic";

export default async function CatalogCategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  const category = await prisma.frontCategory.findUnique({
    where: { slug },
    include: {
      tagGroups: {
        include: { tag: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!category || !category.isActive) {
    notFound();
  }

  // 把此大類底下、對應 baseCategory 的所有產品都抓出來
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      ...(category.baseCategory ? { category: category.baseCategory } : {}),
    },
    include: {
      tags: {
        include: { tag: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 依 tagId 分組（新版 schema 用 tagId，而不是 tagSlug）
  const groupedByTagId: Record<string, typeof products> = {};
  for (const group of category.tagGroups) {
    if (!group.tagId) continue;
    groupedByTagId[group.tagId] = products.filter((p) =>
      p.tags.some((pt) => pt.tagId === group.tagId)
    );
  }

  // 沒被任何 group 吃到的產品 → 其他項目
  const others = products.filter(
    (p) =>
      !category.tagGroups.some(
        (g) => g.tagId && p.tags.some((pt) => pt.tagId === g.tagId)
      )
  );

  return (
    <SiteShell>
      {/* HERO */}
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">{category.name}</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          {category.heroTitle || category.name}
        </h1>
        {category.heroSubtitle && (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
            {category.heroSubtitle}
          </p>
        )}
      </section>

      {/* GROUPS + CARDS */}
      <section className="mt-12">
        {category.tagGroups.map((group) => {
          const list = group.tagId ? groupedByTagId[group.tagId] : [];
          if (!list || list.length === 0) return null;

          return (
            <div
              key={group.id}
              className="mb-10 border-b border-zinc-100 pb-10 last:mb-0 last:border-0 last:pb-0"
            >
              <div className="mb-4 flex flex-col gap-1">
                <h2 className="text-lg font-semibold tracking-[-0.02em]">
                  {group.label || group.tag?.name}
                </h2>
                {group.description && (
                  <p className="max-w-xl text-[13px] text-zinc-600">
                    {group.description}
                  </p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {list.map((p) => (
                  <article
                    key={p.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-md"
                  >
                    <Link
                      href={`/products/${p.slug}`}
                      className="flex flex-1 flex-col"
                    >
                      <div className="relative overflow-hidden border-b border-zinc-200">
                        <div className="relative aspect-[4/3]">
                          {p.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.coverImage}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-xs text-zinc-500">
                              Image coming soon
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-2 px-4 py-3">
                        <h3 className="text-[15px] font-medium tracking-[-0.02em] text-zinc-900">
                          {p.name}
                        </h3>
                        {p.shortDesc && (
                          <p className="line-clamp-3 text-[13px] leading-relaxed text-zinc-600">
                            {p.shortDesc}
                          </p>
                        )}
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {p.tags.slice(0, 3).map((pt) => (
                            <span
                              key={pt.tagId}
                              className="rounded-full bg-zinc-100 px-2 py-[2px] text-[11px] text-zinc-700"
                            >
                              {pt.tag.name}
                            </span>
                          ))}
                          {p.tags.length > 3 && (
                            <span className="text-[11px] text-zinc-400">
                              +{p.tags.length - 3}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500">
                          {p.minQty && (
                            <span>MOQ {p.minQty.toLocaleString()}</span>
                          )}
                          <span className="flex items-center gap-1 text-zinc-600">
                            <span>View details</span>
                            <span aria-hidden>↗</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          );
        })}

        {others.length > 0 && (
          <div>
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-lg font-semibold tracking-[-0.02em]">
                Other items in this category
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {others.map((p) => (
                <article
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                >
                  <Link
                    href={`/products/${p.slug}`}
                    className="flex flex-1 flex-col"
                  >
                    <div className="relative overflow-hidden border-b border-zinc-200">
                      <div className="relative aspect-[4/3]">
                        {p.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.coverImage}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-xs text-zinc-500">
                            Image coming soon
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 px-4 py-3">
                      <h3 className="text-[15px] font-medium tracking-[-0.02em] text-zinc-900">
                        {p.name}
                      </h3>
                      {p.shortDesc && (
                        <p className="line-clamp-3 text-[13px] leading-relaxed text-zinc-600">
                          {p.shortDesc}
                        </p>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-500">
            No products matched this category yet. Make sure your products are
            assigned the right <code>Category</code> and <code>Tag</code>.
          </div>
        )}
      </section>
    </SiteShell>
  );
}
