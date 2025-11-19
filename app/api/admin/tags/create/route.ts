// app/api/admin/tags/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get("name") || "").trim();
  const slug = String(form.get("slug") || "").trim();

  if (!name || !slug) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  await prisma.tag.create({
    data: { name, slug },
  });

  return NextResponse.redirect(new URL("/admin/tags", req.url));
}
