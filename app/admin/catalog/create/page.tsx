// app/admin/catalog/create/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CreateCatalogPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New catalog category
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Create a new top-level section for the /products page.
          </p>
        </div>
        <Link
          href="/admin/catalog"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Back to catalog
        </Link>
      </div>

      <form
        action="/api/admin/catalog/create"
        method="POST"
        className="mt-8 space-y-10"
      >
        <section className="rounded-2xl border border-zinc-200 bg-white px-4 py-5 md:px-6 md:py-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold tracking-[0.16em] text-zinc-500">
              BASIC INFO
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">
                Name
              </label>
              <input
                name="name"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/40"
                placeholder="Gifts"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">
                Slug
              </label>
              <input
                name="slug"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-mono outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/40"
                placeholder="gifts"
                required
              />
              <p className="text-[11px] text-zinc-500">
                Used in <code>/products/&lt;slug&gt;</code>
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">
                Base product category
              </label>
              <select
                name="baseCategory"
                defaultValue=""
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/40"
              >
                <option value="">(None)</option>
                <option value="GIFT">GIFT</option>
                <option value="GIFT_BOX">GIFT_BOX</option>
                <option value="GIFT_SET">GIFT_SET</option>
              </select>
              <p className="text-[11px] text-zinc-500">
                Optional. Used to pre-filter products shown in this category.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">
                Order
              </label>
              <input
                type="number"
                name="order"
                defaultValue={0}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">
                Active
              </label>
              <div className="flex items-center gap-2 pt-1.5">
                <input
                  id="isActive"
                  type="checkbox"
                  name="isActive"
                  defaultChecked
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900/40"
                />
                <label
                  htmlFor="isActive"
                  className="text-xs text-zinc-700"
                >
                  Show on /products
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-zinc-200 pt-5">
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Create category
          </button>
        </div>
      </form>
    </main>
  );
}
