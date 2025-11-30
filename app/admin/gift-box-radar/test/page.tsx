// app/admin/gift-box-radar/test-page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function TestPage() {
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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Test Page Works!</h1>
      <p>Session ID: {sessionId}</p>
      <p>User ID: {session.userId}</p>
    </div>
  );
}
