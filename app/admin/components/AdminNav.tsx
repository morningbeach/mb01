"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utlis";
import { useState, useRef, useEffect } from "react";

// 定義導航項目類型
type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

const mainNav: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/contact-inquiries", label: "客戶詢價" },
  {
    href: "/admin/products-v2",
    label: "產品系統",
    children: [
      { href: "/admin/products-v2", label: "📦 管理產品" },
      { href: "/admin/category-tree", label: "🌳 管理分類樹" },
      { href: "/admin/tags-v2", label: "🏷️ 管理 Tags" },
    ],
  },
  {
    href: "/admin/trend-scanner",
    label: "AI Studio",
    children: [
      { href: "/admin/products-v2/batch", label: "⚡ Batch Processing" },
      { href: "/admin/trend-scanner", label: "📊 Trend Scanner" },
      { href: "/admin/gift-box-radar", label: "🎁 Gift Box Radar" },
    ],
  },
  {
    href: "/admin/homepage",
    label: "首頁編輯器",
    children: [
      { href: "/admin/homepage", label: "🏠 首頁編輯器" },
      { href: "/admin/footer", label: "🦶 頁腳編輯器" },
    ],
  },
  {
    href: "/admin/pages",
    label: "頁面管理",
    children: [
      { href: "/admin/pages", label: "📄 頁面管理" },
      { href: "/admin/blog", label: "📝 Blog" },
    ],
  },
  {
    href: "/admin/images",
    label: "圖片",
    children: [
      { href: "/admin/images", label: "🖼️ 圖床管理器" },
      { href: "/admin/test-gallery", label: "🎨 相簿測試器" },
    ],
  },
];

function LogoutButton() {
  const [loading, setLoading] = useState(false);
  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    window.location.href = '/admin/login';
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="ml-4 rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-60"
    >
      {loading ? '...' : 'Logout'}
    </button>
  );
}

// 下拉選單項目組件
function DropdownNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 判斷是否當前區域活躍
  const isActive = item.children
    ? item.children.some(child => pathname === child.href || pathname.startsWith(child.href + "/"))
    : pathname === item.href || pathname.startsWith(item.href + "/");

  // 點擊外部關閉
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={cn(
          "transition-colors hover:text-zinc-900",
          isActive && "font-semibold text-zinc-900"
        )}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1 transition-colors hover:text-zinc-900",
          isActive && "font-semibold text-zinc-900"
        )}
      >
        {item.label}
        <svg
          className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
          {item.children.map((child) => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-2.5 text-sm transition-colors hover:bg-zinc-100",
                  childActive ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-600"
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="text-xs font-semibold tracking-[0.2em] text-zinc-900">
            MB ADMIN
          </div>
          <span className="hidden text-xs text-zinc-400 md:inline">
            · MorningBeach Packaging
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-xs text-zinc-600 md:flex">
          {mainNav.map((item) => (
            <DropdownNavItem key={item.href} item={item} pathname={pathname} />
          ))}
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
