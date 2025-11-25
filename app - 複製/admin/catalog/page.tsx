// app/admin/catalog/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCatalogPage() {
  const categories = await prisma.frontCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      tagGroups: true,
    },
  });

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="admin-page-header-eyebrow">CATALOG</p>
          <h1 className="admin-page-title">Catalog categories</h1>
          <p className="admin-page-subtitle">
            Control the cards &amp; sections displayed on{" "}
            <code className="font-mono text-xs">/products</code> and{" "}
            <code className="font-mono text-xs">/catalog/[slug]</code>.
          </p>
        </div>
      </div>

      {/* Create new category */}
      <section className="admin-card mb-8">
        <div className="admin-card-body">
          <h2 className="section-title mb-3">Create new catalog category</h2>
          <form
            // ✅ 改成現在實際存在的 route
            action="/api/admin/catalog/create"
            method="POST"
            className="grid gap-3 md:grid-cols-[2fr,2fr,1fr,auto]"
          >
            <div className="space-y-1.5">
              <label className="field-label">Name</label>
              <input
                name="name"
                className="admin-input"
                placeholder="e.g. Gifts"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="field-label">Slug</label>
              <input
                name="slug"
                className="admin-input font-mono"
                placeholder="gifts"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="field-label">Base product category</label>
              <select
                name="baseCategory"
                className="admin-input"
                defaultValue=""
              >
                <option value="">(All)</option>
                <option value="GIFT">GIFT</option>
                <option value="GIFT_BOX">GIFT_BOX</option>
                <option value="GIFT_SET">GIFT_SET</option>
              </select>
            </div>
            <div className="flex items-end">
              {/* ✅ 預設 order 放在最後一個 */}
              <input
                type="hidden"
                name="order"
                value={categories.length + 1}
              />
              {/* ✅ 預設為啟用 */}
              <input type="hidden" name="isActive" value="on" />
              <button type="submit" className="btn-primary w-full md:w-auto">
                Add
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* List */}
      <section className="admin-card">
        <div className="admin-card-body overflow-x-auto">
          <table className="admin-table">
            <thead className="admin-table-head">
              <tr>
                <th className="border-b border-zinc-200 px-4 py-2 md:px-6">
                  Category
                </th>
                <th className="hidden border-b border-zinc-200 px-4 py-2 md:table-cell md:px-6">
                  Slug / Base
                </th>
                <th className="border-b border-zinc-200 px-4 py-2 md:px-6">
                  Tag groups
                </th>
                <th className="border-b border-zinc-200 px-4 py-2 text-right md:px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-zinc-500 md:px-6"
                  >
                    No catalog categories yet.
                  </td>
                </tr>
              )}

              {categories.map((cat, idx) => {
                const rowBg = idx % 2 === 0 ? "bg-white" : "bg-zinc-50/60";

                return (
                  <tr key={cat.id} className={rowBg}>
                    <td className="border-t border-zinc-100 px-4 py-3 align-top md:px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/catalog/${cat.id}`}
                            className="text-sm font-medium text-zinc-900 hover:underline"
                          >
                            {cat.name}
                          </Link>
                          {!cat.isActive && (
                            <span className="admin-pill text-[10px] !bg-amber-100 !text-amber-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        {cat.cardTitle && (
                          <p className="text-[12px] text-zinc-600">
                            {cat.cardTitle}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="hidden border-t border-zinc-100 px-4 py-3 align-top md:table-cell md:px-6">
                      <div className="space-y-1 text-xs text-zinc-600">
                        <div>
                          <span className="font-mono text-[11px]">
                            /catalog/{cat.slug}
                          </span>
                        </div>
                        <div>
                          Base:{" "}
                          {cat.baseCategory ? (
                            <span className="admin-pill text-[10px]">
                              {cat.baseCategory}
                            </span>
                          ) : (
                            <span className="text-[11px] text-zinc-400">
                              All categories
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="border-t border-zinc-100 px-4 py-3 align-top md:px-6">
                      <div className="flex flex-wrap gap-1.5 text-[11px] text-zinc-600">
                        {cat.tagGroups.length === 0 && (
                          <span className="text-zinc-400">
                            No tag groups yet
                          </span>
                        )}
                        {cat.tagGroups.map((g) => (
                          <span
                            key={g.id}
                            className="admin-pill text-[11px]"
                          >
                            {g.label}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="border-t border-zinc-100 px-4 py-3 align-top md:px-6">
                      <div className="flex flex-nowrap justify-end gap-2">
                        <Link
                          href={`/admin/catalog/${cat.id}`}
                          className="btn-outline"
                        >
                          Edit
                        </Link>

                        {/* ✅ 刪除走 /api/admin/catalog/delete + hidden id */}
                        <form
                          action="/api/admin/catalog/delete"
                          method="POST"
                        >
                          <input type="hidden" name="id" value={cat.id} />
                          <button type="submit" className="btn-danger">
                            Delete
                          </button>
                        </form>
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
