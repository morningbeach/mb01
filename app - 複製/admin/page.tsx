// app/admin/page.tsx
import { AdminPageHeader } from "./components/AdminPageHeader";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Overview"
        description="Quick links to manage your homepage, products, and catalog layout."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
            Homepage builder
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Edit sections, hero, and featured products on the public homepage.
          </p>
          <a
            href="/admin/homepage"
            className="mt-3 inline-flex text-xs font-medium text-zinc-900 underline underline-offset-4"
          >
            Go to homepage editor
          </a>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Products</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Manage products, tags, and how they appear in the catalog.
          </p>
          <a
            href="/admin/products"
            className="mt-3 inline-flex text-xs font-medium text-zinc-900 underline underline-offset-4"
          >
            Go to products
          </a>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Images</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Upload, rename, and reuse images across products and homepage.
          </p>
          <a
            href="/admin/images"
            className="mt-3 inline-flex text-xs font-medium text-zinc-900 underline underline-offset-4"
          >
            Go to image library
          </a>
        </section>
      </div>
    </>
  );
}
