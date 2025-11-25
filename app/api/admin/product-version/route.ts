// app/api/admin/product-version/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminProductVersion, setAdminProductVersion } from "@/lib/product-version";

// GET: 取得當前版本
export async function GET() {
  const version = await getAdminProductVersion();
  return NextResponse.json({ version });
}

// POST: 設定版本
export async function POST(req: NextRequest) {
  const { version } = await req.json();
  
  if (version !== 1 && version !== 2) {
    return NextResponse.json(
      { error: "Invalid version" },
      { status: 400 }
    );
  }

  await setAdminProductVersion(version);
  return NextResponse.json({ success: true, version });
}
