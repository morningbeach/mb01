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

// 全局快取導覽項目，避免重複請求
let cachedNavItems: any[] | null = null;
let navItemsPromise: Promise<any[]> | null = null;

function getNavItems(): Promise<any[]> {
  // 如果已有快取，直接返回
  if (cachedNavItems !== null) {
    return Promise.resolve(cachedNavItems);
  }

  // 如果正在請求中，返回同一個 Promise
  if (navItemsPromise !== null) {
    return navItemsPromise;
  }

  // 發起新請求
  navItemsPromise = fetch("/api/nav")
    .then((res) => res.ok ? res.json() : [])
    .then((data) => {
      cachedNavItems = data;
      navItemsPromise = null;
      return data;
    })
    .catch(() => {
      cachedNavItems = [];
      navItemsPromise = null;
      return [];
    });

  return navItemsPromise;
}

export function SiteHeader() {
  const { lang } = useLanguage();
  const [navItems, setNavItems] = React.useState<any[]>(() => cachedNavItems || []);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    getNavItems().then(setNavItems);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight">
            MorningBeach / Gifts
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center justify-center gap-6 text-sm text-zinc-600 md:flex">
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

        {/* Desktop Right Side */}
        <div className="hidden items-center justify-end gap-3 md:flex">
          <LanguageSwitcher />
          <Link
            href="/admin"
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-100"
          >
            Admin
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-200 bg-white md:hidden">
          <nav className="flex flex-col px-4 py-2">
            {navItems.map((item: any) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="border-b border-zinc-100 py-3 text-sm text-zinc-600 hover:text-zinc-900"
              >
                {lang === "zh" ? (item.navLabel_zh || item.navLabel_en) : (item.navLabel_en || item.navLabel_zh)}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-sm text-zinc-600 hover:text-zinc-900"
            >
              Admin
            </Link>
          </nav>
        </div>
      )}
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
