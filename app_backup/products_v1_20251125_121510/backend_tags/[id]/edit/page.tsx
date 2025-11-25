// app/admin/tags/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditTagPage({
  params,
}: {
  params: { id: string };
}) {
  const tag = await prisma.tag.findUnique({
    where: { id: params.id },
    include: {
      products: true,
    },
  });

  if (!tag) return notFound();

  const usageCount = tag.products.length;

  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-zinc-50 px-4 py-10 md:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">
            PRODUCT TAGS
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Edit tag
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Editing: {tag.name} ({tag.slug})
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
        action="/api/admin/tags/update"
        method="POST"
        className="space-y-6 rounded-2xl border border-zinc-200 bg-white px-4 py-5 md:px-6 md:py-6"
      >
        <input type="hidden" name="id" value={tag.id} />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700">
            Name (display)
          </label>
          <input
            name="name"
            defaultValue={tag.name}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/40"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-700">
            Slug (unique)
          </label>
          <input
            name="slug"
            defaultValue={tag.slug}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-mono outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/40"
            required
          />
          <p className="text-[11px] text-zinc-500">
            Changing slug will affect catalog mapping for this tag.
          </p>
        </div>

        <div className="rounded-xl bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500">
          Used in <span className="font-semibold">{usageCount}</span>{" "}
          product(s).
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
          <form
            action="/api/admin/tags/delete"
            method="POST"
            onSubmit={(e) => {
              if (
                !confirm(
                  usageCount > 0
                    ? `This tag is used in ${usageCount} product(s). Delete anyway?`
                    : "Delete this tag?"
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={tag.id} />
            <button
              type="submit"
              className="text-xs text-red-600 hover:underline"
            >
              Delete tag
            </button>
          </form>

          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Save changes
          </button>
        </div>
      </form>
    </main>
  );
}
