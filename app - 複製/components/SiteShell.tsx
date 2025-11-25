// app/components/SiteShell.tsx
import Link from "next/link";
import { ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* 頂部導覽列 */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">
              MorningBeach / Gifts
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-xs text-zinc-600">
            <Link
              href="/products"
              className="hover:text-zinc-900"
            >
              Products
            </Link>
            <Link
              href="/catalog"
              className="hover:text-zinc-900"
            >
              Catalog
            </Link>
            <Link
              href="/admin"
              className="rounded-full border border-zinc-300 px-3 py-1 text-[11px] hover:bg-zinc-100"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* 主要內容 */}
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {children}
      </main>

      {/* 簡單 footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-[11px] text-zinc-500 md:px-6">
          <span>© {new Date().getFullYear()} MorningBeach.</span>
          <span>Custom gifting · Packaging · Bags</span>
        </div>
      </footer>
    </div>
  );
}
