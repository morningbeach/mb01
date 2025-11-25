"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utlis";

const mainNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/factory", label: "Factory" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/contact", label: "Contact" },
  { href: "/admin/settings", label: "Settings" },
];

type SubNavItem = { href: string; label: string };

function getSubNav(pathname: string): SubNavItem[] | null {
  // Homepage 區暫時不需要子選單
  if (pathname.startsWith("/admin/homepage")) return null;

  // Products 區（包含 catalog / tags / images）
  if (
    pathname.startsWith("/admin/products") ||
    pathname.startsWith("/admin/catalog") ||
    pathname.startsWith("/admin/tags") ||
    pathname.startsWith("/admin/images")
  ) {
    return [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/catalog", label: "Catalog layout" },
      { href: "/admin/tags", label: "Tags" },
      { href: "/admin/images", label: "Images" }, // 圖床管理
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
                      ? "bg-zinc-900 text-zinc-50"
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
