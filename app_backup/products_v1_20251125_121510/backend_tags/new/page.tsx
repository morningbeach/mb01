// app/admin/tags/new/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NewTagPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-zinc-50 px-4 py-10 md:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">
            PRODUCT TAGS
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            New tag
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Create a tag for grouping products on catalog pages.
          </p>
        </div>
        <Link
          href="/admin/tags"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Back to tags
        </Link>
      </div>

      <form
        action="/api/admin/tags/create"
        method="POST"
        className="space-y-6 rounded-2xl border border-zinc-200 bg-white px-4 py-5 md:px-6 md:py-6"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700">
            Name (display)
          </label>
          <input
            name="name"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/40"
            required
          />
          <p className="text-[11px] text-zinc-500">
            This is shown on product cards and filters.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700">
            Slug (unique)
          </label>
          <input
            name="slug"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-mono outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/40"
            placeholder="mid-autumn, eco, esg..."
            required
          />
          <p className="text-[11px] text-zinc-500">
            Used as an internal key, and for catalog tag mapping.
          </p>
        </div>

        <div className="flex items-center justify-end border-t border-zinc-200 pt-4">
          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Create tag
          </button>
        </div>
      </form>
    </main>
  );
}
