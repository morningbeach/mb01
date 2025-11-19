// components/SiteShell.tsx
import type { ReactNode } from "react";
import Link from "next/link";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white text-zinc-900">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12 md:px-6 md:pt-16">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <div className="text-lg font-semibold tracking-tight">MB Packaging</div>
        <nav className="hidden gap-8 text-sm text-zinc-600 md:flex">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <Link href="/about" className="hover:text-black">
            About
          </Link>
          <Link href="/products" className="hover:text-black">
            Products
          </Link>
          <Link href="/factory" className="hover:text-black">
            Factory
          </Link>
          <Link href="/blog" className="hover:text-black">
            Blog
          </Link>
          <Link href="/contact" className="hover:text-black">
            Contact
          </Link>
        </nav>
        <Link
          href="/contact"
          className="rounded-full bg-black px-4 py-1.5 text-sm text-white hover:bg-zinc-800"
        >
          Get a Quote
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
      © 2025 MB Packaging — Premium Gift Box Manufacturer.
    </footer>
  );
}
