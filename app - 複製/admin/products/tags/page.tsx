// app/admin/products/tags/page.tsx
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="admin-page-header-eyebrow">PRODUCT TAGS</p>
          <h1 className="admin-page-title">Tags</h1>
          <p className="admin-page-subtitle">
            管理 catalog 會用到的標籤（用 slug 控制 catalog 區塊顯示）。
          </p>
        </div>
        <a
          href="/admin/products"
          className="text-xs text-zinc-500 hover:text-zinc-800"
        >
          ← Back to products
        </a>
      </div>

      {/* Create tag */}
      <section className="admin-card">
        <div className="admin-card-body">
          <h2 className="section-title mb-3">Create new tag</h2>
          <form
            action="/api/admin/tags"
            method="POST"
            className="flex flex-col gap-3 md:flex-row"
          >
            <div className="flex-1 space-y-1.5">
              <label className="field-label">Name</label>
              <input
                name="name"
                className="admin-input"
                placeholder="e.g. Lunar New Year"
                required
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="field-label">Slug (key)</label>
              <input
                name="slug"
                className="admin-input font-mono"
                placeholder="lunar-new-year"
                required
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full md:w-auto">
                Add
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Existing tags */}
      <section className="admin-card mt-8">
        <div className="admin-card-body">
          <h2 className="section-title mb-3">Existing tags</h2>

          {tags.length === 0 ? (
            <p className="text-sm text-zinc-500">目前還沒有任何 tag。</p>
          ) : (
            <div className="space-y-3">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 md:flex-row md:items-center"
                >
                  {/* Update form */}
                  <form
                    action={`/api/admin/tags/${tag.id}`}
                    method="POST"
                    className="flex-1 space-y-2 md:flex md:items-center md:gap-3 md:space-y-0"
                  >
                    <input type="hidden" name="_action" value="update" />

                    <div className="flex-1 space-y-1.5">
                      <label className="field-label text-[11px]">Name</label>
                      <input
                        name="name"
                        defaultValue={tag.name}
                        className="admin-input py-1.5 text-sm"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="field-label text-[11px]">Slug</label>
                      <input
                        name="slug"
                        defaultValue={tag.slug}
                        className="admin-input py-1.5 text-sm font-mono"
                      />
                    </div>
                    <div className="pt-4 md:pt-6">
                      <button type="submit" className="btn-outline">
                        Save
                      </button>
                    </div>
                  </form>

                  {/* Delete form */}
                  <form
                    action={`/api/admin/tags/${tag.id}`}
                    method="POST"
                    className="md:pt-6"
                  >
                    <input type="hidden" name="_action" value="delete" />
                    <button type="submit" className="btn-danger">
                      Delete
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
