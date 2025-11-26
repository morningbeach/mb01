import { NextRequest, NextResponse } from "next/server";

const GUIDE_PASSWORD = "ilovemb1126";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (password === GUIDE_PASSWORD) {
      const response = NextResponse.json({ success: true });
      
      // 設定 cookie，有效期 7 天
      response.cookies.set("guide_auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      
      return response;
    }
    
    return NextResponse.json(
      { success: false, error: "密碼錯誤" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "請求錯誤" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get("guide_auth");
  
  if (authCookie?.value === "authenticated") {
    return NextResponse.json({ authenticated: true });
  }
  
  return NextResponse.json({ authenticated: false });
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("guide_auth");
  return response;
}
