// app/admin/page.tsx
import { AdminPageHeader } from "./components/AdminPageHeader";
import { VersionSwitcher } from "./components/VersionSwitcher";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Overview"
        description="Quick links to manage your homepage, products, and catalog layout."
      />

      {/* 版本切換器 */}
      <VersionSwitcher />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">頁面管理 📄</h2>
          <p className="mt-1 text-xs text-zinc-500">
            管理靜態頁面：關於我們、聯絡方式、工廠介紹等
          </p>
          <a
            href="/admin/pages"
            className="mt-3 inline-flex text-xs font-medium text-zinc-900 underline underline-offset-4"
          >
            前往頁面管理
          </a>
        </section>
      </div>

      {/* 新版系統 */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">新版系統 (V2)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <section className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5 shadow-sm">
            <div className="mb-2 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
              V2 New
            </div>
            <h2 className="text-sm font-semibold text-zinc-900">
              樹狀分類管理 🌳
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              建立彈性的多層級分類結構，每個節點可獨立設定展示方式
            </p>
            <a
              href="/admin/category-tree"
              className="mt-3 inline-flex text-xs font-medium text-blue-700 underline underline-offset-4"
            >
              前往樹狀分類編輯器 →
            </a>
          </section>

          <section className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5 shadow-sm">
            <div className="mb-2 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
              V2 New
            </div>
            <h2 className="text-sm font-semibold text-zinc-900">
              商品管理 V2 📦
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              優化的商品管理介面，支援版本控制與更清晰的分類邏輯
            </p>
            <a
              href="/admin/products-v2"
              className="mt-3 inline-flex text-xs font-medium text-blue-700 underline underline-offset-4"
            >
              前往商品管理 V2 →
            </a>
          </section>

          <section className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5 shadow-sm">
            <div className="mb-2 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
              V2 New
            </div>
            <h2 className="text-sm font-semibold text-zinc-900">
              標籤管理 V2 🏷️
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              重新設計的標籤架構，更清晰的組織方式
            </p>
            <a
              href="/admin/tags-v2"
              className="mt-3 inline-flex text-xs font-medium text-blue-700 underline underline-offset-4"
            >
              前往標籤管理 V2 →
            </a>
          </section>

          <section className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5 shadow-sm">
            <div className="mb-2 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
              V2 New
            </div>
            <h2 className="text-sm font-semibold text-zinc-900">
              分類管理 V2 📂
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              優化的分類邏輯，更靈活的標籤組織方式
            </p>
            <a
              href="/admin/catalog-v2"
              className="mt-3 inline-flex text-xs font-medium text-blue-700 underline underline-offset-4"
            >
              前往分類管理 V2 →
            </a>
          </section>
        </div>
      </div>

      {/* 舊版系統 */}
      <div className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-zinc-500">舊版系統 (V1) - 僅供參考</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-xl border border-zinc-300 bg-zinc-100 p-5 opacity-75 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-700">Products V1</h2>
            <p className="mt-1 text-xs text-zinc-500">
              舊版商品管理系統（建議使用 Products V2）
            </p>
            <a
              href="/admin/products"
              className="mt-3 inline-flex text-xs font-medium text-zinc-600 underline underline-offset-4"
            >
              Go to products V1
            </a>
          </section>

          <section className="rounded-xl border border-zinc-300 bg-zinc-100 p-5 opacity-75 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-700">Catalog V1</h2>
            <p className="mt-1 text-xs text-zinc-500">
              舊版分類系統（建議使用 Catalog V2）
            </p>
            <a
              href="/admin/catalog"
              className="mt-3 inline-flex text-xs font-medium text-zinc-600 underline underline-offset-4"
            >
              Go to catalog V1
            </a>
          </section>

          <section className="rounded-xl border border-zinc-300 bg-zinc-100 p-5 opacity-75 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-700">Tags V1</h2>
            <p className="mt-1 text-xs text-zinc-500">
              舊版標籤系統（建議使用 Tags V2）
            </p>
            <a
              href="/admin/tags"
              className="mt-3 inline-flex text-xs font-medium text-zinc-600 underline underline-offset-4"
            >
              Go to tags V1
            </a>
          </section>
        </div>
      </div>
    </>
  );
}
