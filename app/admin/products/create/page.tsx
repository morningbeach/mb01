// app/admin/products/create/page.tsx
import { prisma } from "@/lib/prisma";
import {
  ImageInputField,
  GalleryImagesInputField,
} from "@/app/admin/components/ImageInputField";
import { ProductTagSelector } from "@/app/admin/products/components/ProductTagSelector";

export const dynamic = "force-dynamic";

export default async function AdminProductCreatePage() {
  const allTags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="admin-page-header-eyebrow">PRODUCTS</p>
          <h1 className="admin-page-title">New product</h1>
          <p className="admin-page-subtitle">
            Create a new product entry for catalog &amp; product detail pages.
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
        action="/api/admin/products/create"
        method="POST"
        className="space-y-6"
      >
        {/* Basic info */}
        <section className="admin-card">
          <div className="admin-card-body space-y-5">
            <h2 className="section-title">Basic information</h2>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-1.5 md:col-span-2">
                <label className="field-label">Name</label>
                <input
                  name="name"
                  className="admin-input"
                  placeholder="ESG Gift Set A"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Slug</label>
                <input
                  name="slug"
                  className="admin-input font-mono"
                  placeholder="esg-gift-set-a"
                  required
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="field-label">Category</label>
                <select name="category" className="admin-input" defaultValue="GIFT">
                  <option value="GIFT">Gift</option>
                  <option value="GIFT_BOX">Gift box</option>
                  <option value="GIFT_SET">Gift set</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Status</label>
                <select name="status" className="admin-input" defaultValue="ACTIVE">
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="field-label">SKU</label>
                <input
                  name="sku"
                  className="admin-input font-mono"
                  placeholder="OPTIONAL"
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
                  className="admin-input"
                  placeholder="e.g. 100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Price hint</label>
                <input
                  name="priceHint"
                  className="admin-input"
                  placeholder="From NT$ 399 / set"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Currency</label>
                <input
                  name="currency"
                  className="admin-input"
                  placeholder="TWD / USD / RMB..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="field-label">Short description</label>
              <textarea
                name="shortDesc"
                rows={2}
                className="admin-input resize-none"
                placeholder="One-line description for listing & SEO."
              />
            </div>

            <div className="space-y-1.5">
              <label className="field-label">Full description</label>
              <textarea
                name="description"
                rows={5}
                className="admin-input"
                placeholder="Detailed description shown on product detail page."
              />
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="admin-card">
          <div className="admin-card-body space-y-5">
            <h2 className="section-title">Images</h2>

            <ImageInputField
              name="coverImage"
              label="Cover image"
              description="This image will be used in product list and as hero image on product detail page."
            />

            <GalleryImagesInputField
              name="gallery"
              label="Gallery images"
              defaultValues={[]}
            />
          </div>
        </section>

        {/* Tags */}
        <section className="admin-card">
          <div className="admin-card-body space-y-5">
            <h2 className="section-title">Tags & filters</h2>
            <ProductTagSelector
              allTags={allTags}
              initialSelectedIds={[]}
              fieldName="tagIds"
            />
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4">
          <button type="submit" className="btn-primary">
            Save product
          </button>
        </div>
      </form>
    </>
  );
}
