// app/admin/homepage/page.tsx
import { prisma } from "@/lib/prisma";
import { HomepageSectionManager } from "./HomepageSectionManager";
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
        description="管理首頁各區塊的內容、順序與顯示狀態"
      />

      <HomepageSectionManager sections={sections} />
    </div>
  );
}
