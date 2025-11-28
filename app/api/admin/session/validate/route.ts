import { NextResponse } from "next/server";
import { getSession } from "@/lib/kv";
export const runtime = "nodejs";

export async function GET(req: Request) {
  // read cookie header
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|; )admin_session=([^;]+)/);
  const sid = match ? decodeURIComponent(match[1]) : null;
  if (!sid) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  const session = await getSession(sid);
  if (!session) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  return NextResponse.json({ valid: true, session }, { status: 200 });
}
