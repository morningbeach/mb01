// app/admin/layout.tsx
import type { ReactNode } from "react";
import "../globals.css";
import { AdminNav } from "./components/AdminNav";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Top navigation (brand + main nav + sub nav) */}
      <AdminNav />

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {children}
      </main>
    </div>
  );
}
