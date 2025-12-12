// components/SiteShell.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "../app/contexts/LanguageContext";
import { SiteFooter } from "./SiteFooter";

// ========================
// Main Site Shell Component
// ========================
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      <SiteHeader />
      <main className="flex flex-1 justify-center px-4 pb-16 pt-8 sm:px-6 sm:pt-12 md:px-10 md:pb-20 md:pt-24">
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

// ========================
// Navigation Data Management
// ========================
let cachedNavItems: any[] | null = null;
let navItemsPromise: Promise<any[]> | null = null;

function loadNavigationItems(): Promise<any[]> {
  // 返回已快取的資料
  if (cachedNavItems !== null) {
    return Promise.resolve(cachedNavItems);
  }

  // 返回進行中的請求
  if (navItemsPromise !== null) {
    return navItemsPromise;
  }

  // 發起新的 API 請求
  navItemsPromise = fetch("/api/nav")
    .then((res) => res.ok ? res.json() : [])
    .then((data) => {
      cachedNavItems = data;
      navItemsPromise = null;
      return data;
    })
    .catch((error) => {
      console.error("導覽項目載入失敗:", error);
      cachedNavItems = [];
      navItemsPromise = null;
      return [];
    });

  return navItemsPromise;
}

// ========================
// Site Header Component
// ========================
export function SiteHeader() {
  const { lang } = useLanguage();
  const [navItems, setNavItems] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 載入導覽項目
  useEffect(() => {
    loadNavigationItems().then(setNavItems);
  }, []);

  // 關閉手機選單
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-3 sm:px-4 sm:py-4 md:px-6">
        
        {/* 品牌 Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight">
            {lang === 'zh' ? '清晨沙灘 / mbpack.co' : 'Sky Word'}
          </span>
        </Link>

        {/* 桌面版導覽 */}
        <nav className="hidden items-center justify-center gap-6 text-sm text-zinc-600 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              className="hover:text-zinc-900 transition-colors"
            >
              {getNavigationLabel(item, lang)}
            </Link>
          ))}
        </nav>

        {/* 桌面版右側控制項 */}
        <div className="hidden items-center justify-end gap-3 md:flex">
          <LanguageSwitcher />
        </div>

        {/* 手機版控制項 */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <MobileMenuButton 
            isOpen={mobileMenuOpen} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          />
        </div>
      </div>

      {/* 手機版選單 */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        navItems={navItems} 
        onClose={closeMobileMenu}
        lang={lang}
      />
    </header>
  );
}

// ========================
// Mobile Menu Components
// ========================
function MobileMenuButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 transition-colors"
      aria-label="選單切換"
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  );
}

function MobileMenu({ 
  isOpen, 
  navItems, 
  onClose, 
  lang 
}: { 
  isOpen: boolean;
  navItems: any[];
  onClose: () => void;
  lang: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="border-t border-zinc-200 bg-white md:hidden">
      <nav className="flex flex-col px-4 py-2">
        {navItems.map((item) => (
          <Link
            key={item.slug}
            href={`/${item.slug}`}
            onClick={onClose}
            className="border-b border-zinc-100 py-3 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            {getNavigationLabel(item, lang)}
          </Link>
        ))}
      </nav>
    </div>
  );
}

// ========================
// Language Switcher Component
// ========================
function LanguageSwitcher() {
  const { lang, setLang, isTaiwan } = useLanguage();

  // 境外用戶：只顯示英文，不顯示切換按鈕
  if (!isTaiwan) {
    return (
      <div className="flex items-center gap-1 rounded-full border border-zinc-300 p-0.5">
        <span className="px-2.5 py-1 text-xs font-medium bg-zinc-900 text-white rounded-full">
          EN
        </span>
      </div>
    );
  }

  // 台灣境內：顯示完整切換按鈕
  return (
    <div className="flex items-center gap-1 rounded-full border border-zinc-300 p-0.5">
      <LanguageButton
        isActive={lang === "en"}
        onClick={() => setLang("en")}
        label="EN"
      />
      <LanguageButton
        isActive={lang === "zh"}
        onClick={() => setLang("zh")}
        label="中"
      />
    </div>
  );
}

function LanguageButton({ 
  isActive, 
  onClick, 
  label 
}: { 
  isActive: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        isActive
          ? "bg-zinc-900 text-white"
          : "text-zinc-600 hover:text-zinc-900"
      }`}
    >
      {label}
    </button>
  );
}

// ========================
// Utility Functions
// ========================
function getNavigationLabel(item: any, lang: string): string {
  if (lang === "zh") {
    return item.navLabel_zh || item.navLabel_en || item.slug;
  }
  return item.navLabel_en || item.navLabel_zh || item.slug;
} 
