// app/api/admin/tags/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ ok: true, tags });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();

    if (!name || !slug) {
      return NextResponse.json(
        { ok: false, error: "Missing name or slug" },
        { status: 400 },
      );
    }

    await prisma.tag.create({
      data: { name, slug },
    });

    const redirectUrl = new URL("/admin/tags", req.url);
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    console.error("[TAG_CREATE_ERROR]", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
