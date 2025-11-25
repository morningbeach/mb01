// app/api/admin/tags/delete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get("id") || "");

  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }

  // 刪關聯，再刪 Tag
  await prisma.productTag.deleteMany({ where: { tagId: id } });
  await prisma.blogTag.deleteMany({ where: { tagId: id } }).catch(() => {});

  await prisma.tag.delete({
    where: { id },
  });

  return NextResponse.redirect(new URL("/admin/tags", req.url));
}
