// app/admin/products/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ImageInputField,
  GalleryImagesInputField,
} from "@/app/admin/components/ImageInputField";
import { ProductTagSelector } from "@/app/admin/products/components/ProductTagSelector";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      // ✅ 圖片改用 Product 自己的欄位，不再 include relation
      tags: {
        include: { tag: true },
      },
    },
  });

  if (!product) return notFound();

  const allTags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });

  const initialTagIds = product.tags.map((t) => t.tagId);

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="admin-page-header-eyebrow">PRODUCTS</p>
          <h1 className="admin-page-title">Edit product</h1>
          <p className="admin-page-subtitle">
            Editing <span className="font-semibold">{product.name}</span>
          </p>
        </div>
        <a
          href="/admin/products"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Back to products
        </a>
      </div>

      {/* Form */}
      <form
        action="/api/admin/products/update"
        method="POST"
        className="space-y-6"
      >
        <input type="hidden" name="id" value={product.id} />

        {/* Basic info */}
        <section className="admin-card">
          <div className="admin-card-body space-y-5">
            <h2 className="section-title">Basic information</h2>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-1.5 md:col-span-2">
                <label className="field-label">Name</label>
                <input
                  name="name"
                  defaultValue={product.name}
                  className="admin-input"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Slug</label>
                <input
                  name="slug"
                  defaultValue={product.slug}
                  className="admin-input font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="field-label">Category</label>
                <select
                  name="category"
                  defaultValue={product.category}
                  className="admin-input"
                >
                  <option value="GIFT">Gift</option>
                  <option value="GIFT_BOX">Gift box</option>
                  <option value="GIFT_SET">Gift set</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Status</label>
                <select
                  name="status"
                  defaultValue={product.status}
                  className="admin-input"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="field-label">SKU</label>
                <input
                  name="sku"
                  defaultValue={product.sku ?? ""}
                  className="admin-input font-mono"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="field-label">Min. order qty</label>
                <input
                  name="minQty"
                  type="number"
                  min={0}
                  defaultValue={product.minQty ?? ""}
                  className="admin-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Price hint</label>
                <input
                  name="priceHint"
                  defaultValue={product.priceHint ?? ""}
                  className="admin-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Currency</label>
                <input
                  name="currency"
                  defaultValue={product.currency ?? ""}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="field-label">Short description</label>
              <textarea
                name="shortDesc"
                rows={2}
                defaultValue={product.shortDesc ?? ""}
                className="admin-input resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="field-label">Full description</label>
              <textarea
                name="description"
                rows={5}
                defaultValue={product.description ?? ""}
                className="admin-input"
              />
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="admin-card">
          <div className="admin-card-body space-y-5">
            <h2 className="section-title">Images</h2>

            <div className="space-y-2">
              <ImageInputField
                name="coverImage" // ✅ 直接綁到 Product.coverImage
                label="Cover image"
                defaultValue={product.coverImage ?? ""}
              />
              <p className="text-xs text-zinc-500">
                This image will be used in product lists and as the hero image
                on the product detail page.
              </p>
            </div>

            <GalleryImagesInputField
              name="gallery" // ✅ 綁到 Product.gallery (string[])
              label="Gallery images"
              defaultValues={product.gallery ?? []}
            />
          </div>
        </section>

        {/* Tags */}
        <section className="admin-card">
          <div className="admin-card-body space-y-5">
            <h2 className="section-title">Tags & filters</h2>
            <ProductTagSelector
              allTags={allTags}
              initialSelectedIds={initialTagIds}
              fieldName="tagIds"
            />
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4">
          <button type="submit" className="btn-primary">
            Save changes
          </button>
        </div>
      </form>
    </>
  );
}
