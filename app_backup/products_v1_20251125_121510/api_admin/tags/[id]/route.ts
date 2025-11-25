// app/api/admin/tags/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = params.id;

  try {
    const formData = await req.formData();
    const action = String(formData.get("_action") ?? "update");

    if (action === "delete") {
      await prisma.tag.delete({ where: { id } });
    } else {
      const name = String(formData.get("name") ?? "").trim();
      const slug = String(formData.get("slug") ?? "").trim();

      if (!name || !slug) {
        return NextResponse.json(
          { ok: false, error: "Missing name or slug" },
          { status: 400 },
        );
      }

      await prisma.tag.update({
        where: { id },
        data: { name, slug },
      });
    }

    const redirectUrl = new URL("/admin/tags", req.url);
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    console.error("[TAG_UPDATE_ERROR]", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
