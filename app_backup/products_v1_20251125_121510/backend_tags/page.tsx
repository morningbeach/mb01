// app/admin/tags/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TagDeleteForm } from "./TagDeleteForm"; // ✅ 新增這行

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      products: true, // ProductTag[]
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Header bar */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="text-sm font-semibold tracking-tight">MB Admin</div>
          <nav className="hidden gap-6 text-xs text-zinc-600 md:flex">
            <Link href="/admin" className="hover:text-zinc-900">
              Dashboard
            </Link>
            <Link href="/admin/products" className="hover:text-zinc-900">
              Products
            </Link>
            <Link href="/admin/tags" className="font-medium text-zinc-900">
              Product tags
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">
              PRODUCT TAGS
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Tags for catalog & filters
            </h1>
            <p className="mt-1 text-xs text-zinc-500">
              Manage the tag system used to group products on catalog pages.
            </p>
          </div>

          <Link
            href="/admin/tags/new"
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-zinc-800"
          >
            + New tag
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full border-separate border-spacing-0 text-left text-[13px]">
            <thead className="bg-zinc-50/80">
              <tr>
                <th className="border-b border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-500 md:px-6">
                  Name
                </th>
                <th className="border-b border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-500 md:px-6">
                  Slug
                </th>
                <th className="border-b border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-500 md:px-6">
                  Used in products
                </th>
                <th className="border-b border-zinc-200 px-4 py-2 text-right text-xs font-medium text-zinc-500 md:px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tags.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-zinc-500 md:px-6"
                  >
                    No tags yet. Click{" "}
                    <span className="font-medium">“New tag”</span> to create
                    your first product tag.
                  </td>
                </tr>
              )}

              {tags.map((tag, idx) => {
                const rowBg = idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40";
                const usageCount = tag.products.length;

                return (
                  <tr key={tag.id} className={rowBg}>
                    <td className="border-t border-zinc-100 px-4 py-3 align-top md:px-6">
                      <div className="text-sm font-medium text-zinc-900">
                        {tag.name}
                      </div>
                    </td>
                    <td className="border-t border-zinc-100 px-4 py-3 align-top font-mono text-xs text-zinc-500 md:px-6">
                      {tag.slug}
                    </td>
                    <td className="border-t border-zinc-100 px-4 py-3 align-top text-xs text-zinc-600 md:px-6">
                      {usageCount > 0 ? (
                        <span>{usageCount} product(s)</span>
                      ) : (
                        <span className="text-zinc-400">Not used</span>
                      )}
                    </td>
                    <td className="border-t border-zinc-100 px-4 py-3 align-top text-right text-xs md:px-6">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/tags/${tag.id}/edit`}
                          className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:border-zinc-400"
                        >
                          Edit
                        </Link>

                        {/* ✅ 改用 Client Component 負責 confirm + submit */}
                        <TagDeleteForm tagId={tag.id} usageCount={usageCount} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
