// app/admin/catalog/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ImageInputField } from "@/app/admin/components/ImageInputField";

export const dynamic = "force-dynamic";

export default async function AdminCatalogDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const category = await prisma.frontCategory.findUnique({
    where: { id: params.id },
    include: {
      tagGroups: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!category) return notFound();

  const allTags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="admin-page-header-eyebrow">CATALOG</p>
          <h1 className="admin-page-title">Edit catalog category</h1>
          <p className="admin-page-subtitle">
            Editing: {category.name}{" "}
            <span className="font-mono text-xs text-zinc-500">
              (/catalog/{category.slug})
            </span>
          </p>
        </div>
        <a
          href="/admin/catalog"
          className="text-xs text-zinc-500 hover:text-zinc-800"
        >
          ← Back to catalog
        </a>
      </div>

      {/* BASIC INFO */}
      <section className="admin-card mb-8">
        <div className="admin-card-body space-y-5">
          <h2 className="section-title">Basic information</h2>
          <form
            action={`/api/admin/catalog/${category.id}`}
            method="POST"
            className="space-y-5"
          >
            <input type="hidden" name="_action" value="updateCategory" />

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="field-label">Name</label>
                <input
                  name="name"
                  defaultValue={category.name}
                  className="admin-input"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Slug</label>
                <input
                  name="slug"
                  defaultValue={category.slug}
                  className="admin-input font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="field-label">Hero title</label>
                <input
                  name="heroTitle"
                  defaultValue={category.heroTitle ?? ""}
                  className="admin-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Hero subtitle</label>
                <input
                  name="heroSubtitle"
                  defaultValue={category.heroSubtitle ?? ""}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="field-label">Card title</label>
                <input
                  name="cardTitle"
                  defaultValue={category.cardTitle ?? ""}
                  className="admin-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Card description</label>
                <input
                  name="cardDescription"
                  defaultValue={category.cardDescription ?? ""}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="field-label">Base product category</label>
                <select
                  name="baseCategory"
                  defaultValue={category.baseCategory ?? ""}
                  className="admin-input"
                >
                  <option value="">(All)</option>
                  <option value="GIFT">GIFT</option>
                  <option value="GIFT_BOX">GIFT_BOX</option>
                  <option value="GIFT_SET">GIFT_SET</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Order</label>
                <input
                  type="number"
                  name="order"
                  defaultValue={category.order ?? 0}
                  className="admin-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Status</label>
                <select
                  name="isActive"
                  defaultValue={category.isActive ? "true" : "false"}
                  className="admin-input"
                >
                  <option value="true">Active</option>
                  <option value="false">Hidden</option>
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <div className="space-y-1.5">
                <ImageInputField
                  name="cardImage"
                  label="Card image"
                  defaultValue={category.cardImage ?? ""}
                  placeholder="/cdn/categories/..."
                />
              </div>
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-3 py-3 text-[11px] text-zinc-500">
                This image is used on the{" "}
                <code className="font-mono">/products</code> overview cards.
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="btn-primary">
                Save category
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* TAG GROUPS */}
      <section className="admin-card">
        <div className="admin-card-body space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Tag groups for this category</h2>
            <p className="text-[11px] text-zinc-500">
              Each group maps to a Tag.slug, and appears as a section on the
              catalog page.
            </p>
          </div>

          {/* Existing groups */}
          <div className="space-y-3">
            {category.tagGroups.length === 0 && (
              <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
                No tag groups yet. Use the form below to add one.
              </p>
            )}

            {category.tagGroups.map((group) => (
              <div
                key={group.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 md:flex-row md:items-center"
              >
                <form
                  action="/api/admin/catalog/update-groups"
                  method="POST"
                  className="flex-1 space-y-2 md:flex md:items-center md:gap-3 md:space-y-0"
                >
                  <input type="hidden" name="_action" value="update" />
                  <input type="hidden" name="id" value={group.id} />
                  <input
                    type="hidden"
                    name="frontCategoryId"
                    value={category.id}
                  />

                  <div className="flex-1 space-y-1.5">
                    <label className="field-label">Label</label>
                    <input
                      name="label"
                      defaultValue={group.label}
                      className="admin-input"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="field-label">Description</label>
                    <input
                      name="description"
                      defaultValue={group.description ?? ""}
                      className="admin-input"
                    />
                  </div>
                  <div className="w-40 space-y-1.5">
                    <label className="field-label">Tag slug</label>
                    <select
                      name="tagSlug"
                      defaultValue={group.tagSlug}
                      className="admin-input"
                    >
                      {allTags.map((tag) => (
                        <option key={tag.id} value={tag.slug}>
                          {tag.name} ({tag.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24 space-y-1.5">
                    <label className="field-label">Order</label>
                    <input
                      type="number"
                      name="order"
                      defaultValue={group.order ?? 0}
                      className="admin-input"
                    />
                  </div>

                  <div className="pt-4 md:pt-6">
                    <button type="submit" className="btn-outline">
                      Save
                    </button>
                  </div>
                </form>

                <form
                  action="/api/admin/catalog/update-groups"
                  method="POST"
                  className="md:pt-6"
                >
                  <input type="hidden" name="_action" value="delete" />
                  <input type="hidden" name="id" value={group.id} />
                  <input
                    type="hidden"
                    name="frontCategoryId"
                    value={category.id}
                  />
                  <button type="submit" className="btn-danger">
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>

          {/* Add new group */}
          <div className="mt-6 border-t border-zinc-200 pt-4">
            <h3 className="mb-3 text-xs font-semibold tracking-[0.16em] text-zinc-500">
              ADD NEW GROUP
            </h3>
            <form
              action="/api/admin/catalog/update-groups"
              method="POST"
              className="grid gap-3 md:grid-cols-[2fr,2fr,1.5fr,0.7fr,auto]"
            >
              <input type="hidden" name="_action" value="create" />
              <input
                type="hidden"
                name="frontCategoryId"
                value={category.id}
              />

              <div className="space-y-1.5">
                <label className="field-label">Label</label>
                <input
                  name="label"
                  className="admin-input"
                  placeholder="e.g. Mid-Autumn programs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Description</label>
                <input
                  name="description"
                  className="admin-input"
                  placeholder="Optional subtitle for this group"
                />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Tag slug</label>
                <select
                  name="tagSlug"
                  className="admin-input"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select tag…
                  </option>
                  {allTags.map((tag) => (
                    <option key={tag.id} value={tag.slug}>
                      {tag.name} ({tag.slug})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Order</label>
                <input
                  type="number"
                  name="order"
                  className="admin-input"
                  defaultValue={category.tagGroups.length}
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full md:w-auto">
                  Add group
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
