// app/admin/products/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteProductButton } from "./DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      tags: {
        include: { tag: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      {/* Page header */}
      <div className="mb-8">
        <p className="admin-page-header-eyebrow">PRODUCTS</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="admin-page-title">Product catalog</h1>
            <p className="admin-page-subtitle">
              Manage products used on catalog pages and product detail pages.
            </p>
          </div>
          <Link href="/admin/products/create" className="btn-primary">
            + New product
          </Link>
        </div>
      </div>

      {/* Table */}
      <section className="admin-card">
        <div className="admin-card-body overflow-x-auto">
          <table className="admin-table">
            <thead className="admin-table-head">
              <tr>
                <th className="border-b border-zinc-200 px-4 py-2 md:px-6">
                  Product
                </th>
                <th className="hidden border-b border-zinc-200 px-4 py-2 md:table-cell md:px-6">
                  Category / Tags
                </th>
                <th className="hidden border-b border-zinc-200 px-4 py-2 md:table-cell md:px-6">
                  MOQ / Price hint
                </th>
                <th className="border-b border-zinc-200 px-4 py-2 text-right md:px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-zinc-500 md:px-6"
                  >
                    No products yet. Click{" "}
                    <span className="font-medium">“New product”</span> to create
                    your first item.
                  </td>
                </tr>
              )}

              {products.map((p, idx) => {
                const tags = p.tags.map((t) => t.tag);
                const rowBg =
                  idx % 2 === 0 ? "bg-white" : "bg-zinc-50/60";

                return (
                  <tr key={p.id} className={rowBg}>
                    {/* Product main info */}
                    <td className="border-t border-zinc-100 px-4 py-3 align-top md:px-6">
                      <div className="flex gap-3">
                        {/* thumbnail */}
                        <div className="hidden h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 md:block">
                          {p.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.coverImage}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="truncate text-sm font-medium text-zinc-900 hover:underline"
                            >
                              {p.name}
                            </Link>
                            {p.category && (
                              <span className="admin-pill uppercase tracking-[0.14em] text-[10px]">
                                {p.category}
                              </span>
                            )}
                          </div>
                          {p.shortDesc && (
                            <p className="mt-0.5 line-clamp-2 text-[12px] text-zinc-500">
                              {p.shortDesc}
                            </p>
                          )}
                          <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
                            /products/{p.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category / tags */}
                    <td className="hidden border-t border-zinc-100 px-4 py-3 align-top text-xs text-zinc-600 md:table-cell md:px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {tags.length > 0 ? (
                          tags.map((tag) => (
                            <span key={tag.id} className="admin-pill">
                              {tag.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-zinc-400">
                            No tags
                          </span>
                        )}
                      </div>
                    </td>

                    {/* MOQ / price */}
                    <td className="hidden border-t border-zinc-100 px-4 py-3 align-top text-xs text-zinc-600 md:table-cell md:px-6">
                      <div className="space-y-0.5">
                        <div className="text-[11px] text-zinc-500">MOQ</div>
                        <div className="text-[13px] text-zinc-800">
                          {p.minQty
                            ? `${p.minQty.toLocaleString()} pcs`
                            : "Project-based"}
                        </div>
                        {p.priceHint && (
                          <div className="text-[11px] text-zinc-500">
                            {p.priceHint}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="border-t border-zinc-100 px-4 py-3 align-top md:px-6">
                      <div className="flex flex-nowrap justify-end gap-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="btn-outline"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="btn-outline"
                        >
                          View ↗
                        </Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
