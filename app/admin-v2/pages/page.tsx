// app/admin-v2/pages/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminPageHeader } from "@/app/admin/components/AdminPageHeader";
import { PageRow } from "./PageRow";

export const dynamic = "force-dynamic";

export default async function PagesManagementPage() {
  const pages = await prisma.sitePage.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminPageHeader
        title="頁面管理 (v2)"
        description="管理網站所有頁面、排序和顯示設定"
      />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {/* 新增頁面按鈕 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-zinc-600">
            共 {pages.length} 個頁面（{pages.filter((p) => p.isDefault).length} 個預設頁面）
          </div>
          <Link
            href="/admin-v2/pages/create"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            + 新增頁面
          </Link>
        </div>

        {/* 頁面列表 */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-600">
                  排序
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-600">
                  頁面
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-600">
                  類型
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-600">
                  前台顯示
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-600">
                  導覽列
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {pages.map((page, index) => (
                <PageRow key={page.id} page={page} index={index} totalPages={pages.length} />
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
