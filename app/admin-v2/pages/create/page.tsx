// app/admin-v2/pages/create/page.tsx
import { AdminPageHeader } from "@/app/admin/components/AdminPageHeader";
import { CreatePageFormNew } from "./CreatePageFormNew";

export default function CreatePagePage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminPageHeader title="新增頁面" description="建立頁面並直接編輯完整內容" />

      <main className="px-4 py-10 md:px-6">
        <CreatePageFormNew />
      </main>
    </div>
  );
}
