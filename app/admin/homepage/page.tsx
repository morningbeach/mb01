// app/admin/homepage/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminPageHeader } from "../components/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const sections = await prisma.homeSection.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="首頁管理"
        description="管理首頁各區塊的內容與順序"
      />

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">區塊列表</h2>
        
        {sections.length === 0 ? (
          <p className="text-sm text-zinc-500">尚無區塊</p>
        ) : (
          <div className="space-y-3">
            {sections.map((section) => (
              <div
                key={section.id}
                className="flex items-center justify-between rounded border border-zinc-200 p-4"
              >
                <div className="flex items-center gap-4">
                  <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-medium">
                    {section.type}
                  </span>
                  <span className="text-sm">
                    順序: {section.order}
                  </span>
                  <span className={`text-xs ${section.enabled ? "text-green-600" : "text-zinc-400"}`}>
                    {section.enabled ? "✓ 啟用" : "○ 停用"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/homepage/${section.id}`}
                    className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
                  >
                    編輯
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-zinc-200">
          <p className="text-sm text-zinc-600 mb-4">
            <strong>注意：</strong> 區塊的新增、刪除、排序功能需要透過資料庫操作。
            編輯功能請點擊上方的「編輯」按鈕。
          </p>
          <Link
            href="/admin"
            className="text-sm text-blue-600 hover:underline"
          >
            ← 返回後台首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
