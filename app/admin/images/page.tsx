// app/admin/images/page.tsx
import { R2ManagerClient } from "./r2-manager-client";
import { AdminPageHeader } from "../components/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function ImagesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="圖床管理"
        description="管理 Cloudflare R2 上的圖片檔案（支援資料夾、軟刪除、批次操作）"
      />
      <R2ManagerClient />
    </div>
  );
}
