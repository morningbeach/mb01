// app/api/admin/tags/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get("id") || "");
  const name = String(form.get("name") || "").trim();
  const slug = String(form.get("slug") || "").trim();

  if (!id || !name || !slug) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  await prisma.tag.update({
    where: { id },
    data: { name, slug },
  });

  return NextResponse.redirect(new URL("/admin/tags", req.url));
}
