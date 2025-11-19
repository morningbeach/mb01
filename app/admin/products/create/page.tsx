// app/admin/products/create/page.tsx
import { prisma } from "@/lib/prisma";
import { ImageInputField } from "@/app/admin/components/ImageInputField";
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
            Create a new product entry for catalog &amp; detail pages.
          </p>
        </div>
        <a
          href="/admin/products"
          className="text-xs text-zinc-500 hover:text-zinc-800"
        >
          ← Back to products
        </a>
      </div>

      <form
        action="/api/admin/products/create"
        method="POST"
        className="space-y-10"
      >
        {/* BASIC INFO */}
        <section className="admin-card">
          <div className="admin-card-body space-y-5">
            <div>
              <h2 className="section-title">Basic info</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="field-label">Name</label>
                <input name="name" className="admin-input" required />
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Slug</label>
                <input
                  name="slug"
                  className="admin-input font-mono"
                  placeholder="example-product"
                  required
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="field-label">Category</label>
                <select
                  name="category"
                  className="admin-input"
                  defaultValue="GIFT"
                >
                  <option value="GIFT">GIFT</option>
                  <option value="GIFT_BOX">GIFT_BOX</option>
                  <option value="GIFT_SET">GIFT_SET</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="field-label">SKU</label>
                <input name="sku" className="admin-input" />
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Minimum order</label>
                <input
                  type="number"
                  name="minQty"
                  className="admin-input"
                  min={0}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="field-label">Price hint</label>
                <input
                  name="priceHint"
                  className="admin-input"
                  placeholder="e.g. From USD 3.5 / set (1,000+ sets)"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Currency</label>
                <input
                  name="currency"
                  className="admin-input"
                  placeholder="TWD / USD / HKD..."
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="field-label">Short description</label>
                <textarea
                  name="shortDesc"
                  rows={3}
                  className="admin-textarea"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Full description</label>
                <textarea
                  name="description"
                  rows={5}
                  className="admin-textarea"
                />
              </div>
            </div>
          </div>
        </section>

        {/* IMAGES */}
        <section className="admin-card">
          <div className="admin-card-body">
            <div className="mb-4">
              <h2 className="section-title">Images</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div className="space-y-4">
                <ImageInputField
                  name="coverImage"
                  label="Cover image"
                  placeholder="https://..."
                />

                <div className="space-y-1.5">
                  <label className="field-label">Gallery images</label>
                  <textarea
                    name="images"
                    rows={5}
                    className="admin-textarea font-mono text-xs"
                    placeholder="One image URL per line"
                  />
                  <p className="helper-text">
                    Optional. These URLs will be used on the product detail
                    page gallery.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-3 py-3 text-[11px] text-zinc-500">
                Preview will be visible on product detail page.
              </div>
            </div>
          </div>
        </section>

        {/* SPECS */}
        <section className="admin-card">
          <div className="admin-card-body space-y-4">
            <h2 className="section-title">Specifications</h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="field-label">Lead time</label>
                <input
                  name="leadTime"
                  className="admin-input"
                  placeholder="e.g. 約 25–30 天（不含運輸）"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Materials</label>
                <input
                  name="materials"
                  className="admin-input"
                  placeholder="e.g. rPET non-woven, cotton rope handles..."
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="field-label">Dimensions</label>
                <input
                  name="dimensions"
                  className="admin-input"
                  placeholder="e.g. W32 × D10 × H26 cm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Packaging info</label>
                <input
                  name="packagingInfo"
                  className="admin-input"
                  placeholder="e.g. 1 set / polybag, 20 sets / carton"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="field-label">Origin country</label>
                <input
                  name="originCountry"
                  className="admin-input"
                  placeholder="CN / TW / ..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Unit</label>
                <input
                  name="unit"
                  className="admin-input"
                  placeholder="set / pc / pair..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Notes for buyer</label>
                <input
                  name="notesForBuyer"
                  className="admin-input"
                  placeholder="MOQ suggestions, packing tips..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* TAGS */}
        <section className="admin-card">
          <div className="admin-card-body space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Tags</h2>
              <a
                href="/admin/products/tags"
                className="text-[11px] text-zinc-500 hover:text-zinc-800"
              >
                Manage tag list ↗
              </a>
            </div>
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
