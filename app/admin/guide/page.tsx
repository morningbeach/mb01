// app/admin/guide/page.tsx
import { Suspense } from "react";
import { AdminPageHeader } from "../components/AdminPageHeader";
import SystemGuideClient from "./SystemGuideClient";

export const dynamic = "force-dynamic";

export default function AdminGuidePage() {
  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="系統指南"
        title="前後台說明中心"
        description="最新版本的 MB 包裝工廠操作手冊，涵蓋前台、後台、部署與維運流程。"
      />

      <Suspense fallback={<GuideSkeleton />}>
        <SystemGuideClient />
      </Suspense>
    </div>
  );
}

function GuideSkeleton() {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white/60 p-8 text-sm text-zinc-500">
      正在載入說明文件…
    </div>
  );
}
