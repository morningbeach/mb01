// app/api/admin/catalog/update-groups/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const action = formData.get("_action")?.toString() ?? "";
    const frontCategoryId = formData.get("frontCategoryId")?.toString();

    if (!frontCategoryId) {
      return NextResponse.json(
        { ok: false, error: "Missing frontCategoryId" },
        { status: 400 },
      );
    }

    // 共用的 helper：用 tagSlug 找 Tag.id
    async function resolveTagIdFromSlug(tagSlug: string) {
      const slug = tagSlug.trim();
      if (!slug) return null;

      const tag = await prisma.tag.findUnique({
        where: { slug },
        select: { id: true },
      });

      return tag?.id ?? null;
    }

    if (action === "create") {
      const label = (formData.get("label")?.toString() ?? "").trim();
      const description =
        (formData.get("description")?.toString() ?? "").trim() || null;
      const tagSlug = (formData.get("tagSlug")?.toString() ?? "").trim();
      const orderRaw = (formData.get("order")?.toString() ?? "").trim();
      const order = orderRaw ? Number(orderRaw) : 0;

      if (!label || !tagSlug) {
        return NextResponse.json(
          { ok: false, error: "Label and tagSlug are required" },
          { status: 400 },
        );
      }

      const tagId = await resolveTagIdFromSlug(tagSlug);
      if (!tagId) {
        return NextResponse.json(
          { ok: false, error: `Tag not found for slug: ${tagSlug}` },
          { status: 400 },
        );
      }

      await prisma.frontCategoryTagGroup.create({
        data: {
          frontCategoryId,
          label,
          description,
          tagId,
          order,
        },
      });
    } else if (action === "update") {
      const id = formData.get("id")?.toString();
      if (!id) {
        return NextResponse.json(
          { ok: false, error: "Missing group id" },
          { status: 400 },
        );
      }

      const label = (formData.get("label")?.toString() ?? "").trim();
      const description =
        (formData.get("description")?.toString() ?? "").trim() || null;
      const tagSlug = (formData.get("tagSlug")?.toString() ?? "").trim();
      const orderRaw = (formData.get("order")?.toString() ?? "").trim();
      const order = orderRaw ? Number(orderRaw) : 0;

      if (!label || !tagSlug) {
        return NextResponse.json(
          { ok: false, error: "Label and tagSlug are required" },
          { status: 400 },
        );
      }

      const tagId = await resolveTagIdFromSlug(tagSlug);
      if (!tagId) {
        return NextResponse.json(
          { ok: false, error: `Tag not found for slug: ${tagSlug}` },
          { status: 400 },
        );
      }

      await prisma.frontCategoryTagGroup.update({
        where: { id },
        data: {
          label,
          description,
          tagId,
          order,
        },
      });
    } else if (action === "delete") {
      const id = formData.get("id")?.toString();
      if (!id) {
        return NextResponse.json(
          { ok: false, error: "Missing group id" },
          { status: 400 },
        );
      }

      await prisma.frontCategoryTagGroup.delete({
        where: { id },
      });
    } else {
      return NextResponse.json(
        { ok: false, error: `Unsupported action: ${action}` },
        { status: 400 },
      );
    }

    // 重新驗證頁面 cache
    revalidatePath("/products");
    revalidatePath("/admin/catalog");
    revalidatePath(`/admin/catalog/${frontCategoryId}`);

    // 回到該分類的編輯頁
    return NextResponse.redirect(
      new URL(`/admin/catalog/${frontCategoryId}`, req.url),
    );
  } catch (err) {
    console.error("[UPDATE_CATALOG_GROUPS_ERROR]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update tag groups" },
      { status: 500 },
    );
  }
}
