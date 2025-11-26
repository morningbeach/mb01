"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utlis";

const mainNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/category-tree", label: "Category Tree V2" },
  { href: "/admin/products-v2", label: "Products V2" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/images", label: "Images" },
];

type SubNavItem = { href: string; label: string };

function getSubNav(pathname: string): SubNavItem[] | null {
  // Homepage 區暫時不需要子選單
  if (pathname.startsWith("/admin/homepage")) return null;

  // Blog 區
  if (pathname.startsWith("/admin/blog")) {
    return [
      { href: "/admin/blog", label: "文章列表" },
      { href: "/admin/blog/new", label: "新增文章" },
      { href: "/blog", label: "前台預覽" },
    ];
  }

  // Pages 區 (PROCESS / FAQ / CASE)
  if (pathname.startsWith("/admin/pages")) {
    return [
      { href: "/admin/pages", label: "頁面列表" },
      { href: "/admin/pages/process", label: "PROCESS 編輯" },
      { href: "/admin/pages/faq", label: "FAQ 編輯" },
      { href: "/admin/pages/case", label: "CASE 編輯" },
    ];
  }

  // Category Tree V2 區
  if (pathname.startsWith("/admin/category-tree")) {
    return [
      { href: "/admin/category-tree", label: "樹狀分類管理" },
      { href: "/catalog-tree", label: "前台預覽" },
      { href: "/catalog-tree/tree-view", label: "完整樹狀圖" },
    ];
  }

  // Products V2 區
  if (
    pathname.startsWith("/admin/products-v2") ||
    pathname.startsWith("/admin/catalog-v2") ||
    pathname.startsWith("/admin/tags-v2")
  ) {
    return [
      { href: "/admin/products-v2", label: "商品管理 V2" },
      { href: "/admin/catalog-v2", label: "分類管理 V2" },
      { href: "/admin/tags-v2", label: "標籤管理 V2" },
    ];
  }

  // 其他暫時不顯示子選單
  return null;
}

export function AdminNav() {
  const pathname = usePathname();
  const subNav = getSubNav(pathname);

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
      {/* 第一排：品牌 + 主選單 */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold tracking-[0.2em] text-zinc-900">
            MB ADMIN
          </div>
          <span className="hidden text-xs text-zinc-400 md:inline">
            · MorningBeach Packaging
          </span>
        </div>

        <nav className="hidden items-center gap-5 text-xs text-zinc-600 md:flex">
          {mainNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-zinc-900",
                  active && "font-semibold text-zinc-900"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 第二排：子選單（只有特定區域顯示） */}
      {subNav && (
        <div className="border-t border-zinc-200 bg-zinc-50/80">
          <div className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-4 py-2.5 text-xs md:px-6">
            {subNav.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-1 transition-colors",
                    active
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
