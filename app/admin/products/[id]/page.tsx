// app/admin/products/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ImageInputField } from "@/app/admin/components/ImageInputField";
import { ProductTagSelector } from "@/app/admin/products/components/ProductTagSelector";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { tags: true },
  });

  if (!product) {
    return notFound();
  }

  const allTags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });

  const initialSelectedIds = product.tags.map((t) => t.tagId);

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="admin-page-header-eyebrow">PRODUCTS</p>
          <h1 className="admin-page-title">Edit product</h1>
          <p className="admin-page-subtitle">Editing: {product.name}</p>
        </div>
        <a
          href="/admin/products"
          className="text-xs text-zinc-500 hover:text-zinc-800"
        >
          ← Back to products
        </a>
      </div>

      <form
        action="/api/admin/products/update"
        method="POST"
        className="space-y-10"
      >
        <input type="hidden" name="id" value={product.id} />

        {/* BASIC INFO */}
        <section className="admin-card">
          <div className="admin-card-body space-y-5">
            <div>
              <h2 className="section-title">Basic info</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
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
                  <option value="GIFT">GIFT</option>
                  <option value="GIFT_BOX">GIFT_BOX</option>
                  <option value="GIFT_SET">GIFT_SET</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="field-label">SKU</label>
                <input
                  name="sku"
                  defaultValue={product.sku ?? ""}
                  className="admin-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="field-label">Minimum order</label>
                <input
                  type="number"
                  name="minQty"
                  defaultValue={product.minQty ?? 0}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
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

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="field-label">Short description</label>
                <textarea
                  name="shortDesc"
                  defaultValue={product.shortDesc ?? ""}
                  rows={3}
                  className="admin-textarea"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Full description</label>
                <textarea
                  name="description"
                  defaultValue={product.description ?? ""}
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
                  defaultValue={product.coverImage ?? ""}
                />

                <div className="space-y-1.5">
                  <label className="field-label">Gallery images</label>
                  <textarea
                    name="images"
                    rows={5}
                    defaultValue={(product.images ?? []).join("\n")}
                    className="admin-textarea font-mono text-xs"
                  />
                  <p className="helper-text">
                    One image URL per line. Leave empty to keep only cover
                    image.
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
                  defaultValue={product.leadTime ?? ""}
                  className="admin-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Materials</label>
                <input
                  name="materials"
                  defaultValue={product.materials ?? ""}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="field-label">Dimensions</label>
                <input
                  name="dimensions"
                  defaultValue={product.dimensions ?? ""}
                  className="admin-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Packaging info</label>
                <input
                  name="packagingInfo"
                  defaultValue={product.packagingInfo ?? ""}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="field-label">Origin country</label>
                <input
                  name="originCountry"
                  defaultValue={product.originCountry ?? ""}
                  className="admin-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Unit</label>
                <input
                  name="unit"
                  defaultValue={product.unit ?? ""}
                  className="admin-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Notes for buyer</label>
                <input
                  name="notesForBuyer"
                  defaultValue={product.notesForBuyer ?? ""}
                  className="admin-input"
                />
              </div>
            </div>
          </div>
        </section>

        {/* TAGS */}
        <section className="admin-card">
          <div className="admin-card-body space-y-4">
            <div className="flex items-center justify-between">
  <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
    Section title
  </div>
</div>
            <ProductTagSelector
              allTags={allTags}
              initialSelectedIds={initialSelectedIds}
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
