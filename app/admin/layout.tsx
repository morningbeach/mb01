// app/admin/layout.tsx
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Top bar */}
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 md:px-6">
          {/* 第一排主選單 */}
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="text-sm font-semibold tracking-tight text-zinc-900"
            >
              MB Admin
            </Link>

            <nav className="flex flex-wrap items-center gap-4 text-xs text-zinc-600">
              <Link href="/admin" className="hover:text-zinc-900">
                Home
              </Link>
              <Link href="/admin/about" className="hover:text-zinc-900">
                About
              </Link>
              <Link href="/admin/products" className="hover:text-zinc-900">
                Products
              </Link>
              <Link href="/admin/factory" className="hover:text-zinc-900">
                Factory
              </Link>
              <Link href="/admin/blog" className="hover:text-zinc-900">
                Blog
              </Link>
              <Link href="/admin/contact" className="hover:text-zinc-900">
                Contact
              </Link>
            </nav>
          </div>

          {/* 第二排：Products 區的子選單捷徑 */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
            <span className="uppercase tracking-[0.18em] text-zinc-400">
              Products
            </span>
            <Link
              href="/admin/catalog"
              className="rounded-full border border-zinc-200 px-2 py-0.5 hover:border-zinc-400 hover:text-zinc-800"
            >
              Catalog
            </Link>
            <Link
              href="/admin/products/tags"
              className="rounded-full border border-zinc-200 px-2 py-0.5 hover:border-zinc-400 hover:text-zinc-800"
            >
              Tags
            </Link>
            <Link
              href="/admin/products"
              className="rounded-full border border-zinc-200 px-2 py-0.5 hover:border-zinc-400 hover:text-zinc-800"
            >
              Products
            </Link>
          </div>
        </div>
      </header>

      {/* 主要內容區（所有 /admin/... 子頁面都會被包在這裡） */}
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
