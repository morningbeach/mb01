// components/SiteShell.tsx
"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "../app/contexts/LanguageContext";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      <SiteHeader />
      <main className="flex flex-1 justify-center px-6 pb-20 pt-16 md:px-10 md:pt-24">
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function SiteHeader() {
  const { lang } = useLanguage();
  const [navItems, setNavItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch("/api/nav")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setNavItems(data))
      .catch(() => setNavItems([]));
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl grid-cols-3 items-center px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight">
            MorningBeach / Gifts
          </span>
        </Link>
        <nav className="flex items-center justify-center gap-6 text-sm text-zinc-600">
          {navItems.map((item: any) => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              className="hover:text-zinc-900"
            >
              {lang === "zh" ? (item.navLabel_zh || item.navLabel_en) : (item.navLabel_en || item.navLabel_zh)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-3">
          <LanguageSwitcher />
          <Link
            href="/admin"
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-100"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}

function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full border border-zinc-300 p-0.5">
      <button
        onClick={() => setLang("en")}
        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
          lang === "en"
            ? "bg-zinc-900 text-white"
            : "text-zinc-600 hover:text-zinc-900"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("zh")}
        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
          lang === "zh"
            ? "bg-zinc-900 text-white"
            : "text-zinc-600 hover:text-zinc-900"
        }`}
      >
        中
      </button>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-[11px] text-zinc-500 md:px-6">
        <span>© {new Date().getFullYear()} MorningBeach.</span>
        <span>Custom gifting · Packaging · Bags</span>
      </div>
    </footer>
  );
}
