// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MB Packaging · Gift Box & Packaging Studio",
  description:
    "Factory-direct gift box and packaging solutions for brands and corporate teams in China, Taiwan and worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f5f5f7] text-slate-900">
        {/* HEADER */}
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur">
          <div className="page-shell flex items-center justify-between py-3">
            {/* LOGO */}
            <Link
              href="/"
              className="text-xs font-semibold tracking-[0.22em] text-slate-900"
            >
              MB PACKAGING
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
              <Link href="/" className="hover:text-slate-900">
                首頁
              </Link>
              <Link href="/about" className="hover:text-slate-900">
                關於我們
              </Link>

              {/* 產品 + 子選單 */}
              <div className="group relative">
                <button className="flex items-center gap-1 text-slate-600 hover:text-slate-900">
                  <span>產品</span>
                  <span className="text-[10px]">▾</span>
                </button>
                <div className="pointer-events-none absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 bg-white py-2 text-sm shadow-lg opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
                  <Link
                    href="/catalog?category=GIFT"
                    className="block px-4 py-2 hover:bg-slate-50"
                  >
                    禮品
                  </Link>
                  <Link
                    href="/catalog?category=GIFT_BOX"
                    className="block px-4 py-2 hover:bg-slate-50"
                  >
                    禮品盒
                  </Link>
                  <Link
                    href="/catalog?category=GIFT_SET"
                    className="block px-4 py-2 hover:bg-slate-50"
                  >
                    禮品套組
                  </Link>
                </div>
              </div>

              <Link href="/factory" className="hover:text-slate-900">
                工廠介紹
              </Link>
              <Link href="/blog" className="hover:text-slate-900">
                Blog
              </Link>
            </nav>

            {/* Desktop contact button */}
            <div className="hidden md:block">
              <Link
                href="/contact"
                className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-800 hover:border-slate-500 hover:bg-slate-50"
              >
                聯絡我們
              </Link>
            </div>

            {/* Mobile quick nav */}
            <div className="flex items-center gap-3 md:hidden">
              <Link
                href="/catalog"
                className="text-xs font-medium text-slate-700"
              >
                Catalog
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-800"
              >
                Contact
              </Link>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="page-shell pb-10 pt-6 sm:pt-8">{children}</main>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="page-shell flex flex-col gap-2 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} MB Packaging Studio. All rights
              reserved.
            </span>
            <span>
              Gift box &amp; packaging solutions · Factory-direct in China &amp;
              Taiwan.
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
