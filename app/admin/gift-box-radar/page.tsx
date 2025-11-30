// app/admin/gift-box-radar/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import GiftBoxRadarClient from "./GiftBoxRadarClient";

export const metadata = {
  title: "Gift Box Radar | Admin",
  description: "全球禮盒設計趨勢掃描器",
};

export default async function GiftBoxRadarPage() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get("admin_session")?.value;

  if (!sessionId) {
    redirect("/admin");
  }

  const session = await getSession(sessionId);
  if (!session?.userId) {
    redirect("/admin");
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gift Box Radar Loading...</h1>
      <GiftBoxRadarClient />
    </div>
  );
}
