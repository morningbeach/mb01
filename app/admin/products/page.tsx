// app/admin/products/page.tsx
import Link from "next/link";
import Image from "next/image";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Server Action：刪除產品
export async function deleteProduct(formData: FormData) {
  "use server";

  const id = formData.get("productId") as string | null;
  if (!id) return;

  await prisma.product.delete({
    where: { id },
  });

  // 刷新列表頁
  revalidatePath("/admin/products");
}

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      productImages: true,
      giftSetItems: true,
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="admin-page-header-eyebrow">PRODUCTS</p>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">
            Manage all products displayed on catalog &amp; product detail pages.
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="inline-flex items-center justify-center rounded-md border border-zinc-900 px-4 py-2 text-sm font-medium tracking-tight text-white bg-zinc-900 hover:bg-zinc-800"
        >
          + New product
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Thumbnail</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {products.map((product) => {
              const thumb =
                product.coverImage ||
                product.productImages?.[0]?.url ||
                null;

              return (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-zinc-50/80"
                >
                  {/* Thumbnail */}
                  <td className="px-4 py-3">
                    {thumb ? (
                      <div className="h-12 w-12 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                        <Image
                          src={thumb}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-md border border-zinc-200 bg-zinc-100" />
                    )}
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 text-sm font-medium text-zinc-900">
                    {product.name}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500">
                    {product.category}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-xs uppercase tracking-wide text-zinc-500">
                    {product.status}
                  </td>

                  {/* Tags */}
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {product.tags?.map((t) => t.tag.name).join(", ") || "—"}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="inline-flex items-center gap-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-zinc-500 hover:text-zinc-900"
                      >
                        Edit
                      </Link>

                      <form action={deleteProduct}>
                        <input
                          type="hidden"
                          name="productId"
                          value={product.id}
                        />
                        <button
                          type="submit"
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-zinc-500"
                >
                  No products yet. Click “New product” to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
