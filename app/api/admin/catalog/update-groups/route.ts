// app/api/admin/catalog/update-groups/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const frontCategoryId = formData.get("frontCategoryId")?.toString();
    if (!frontCategoryId) {
      return NextResponse.json(
        { ok: false, error: "Missing frontCategoryId" },
        { status: 400 }
      );
    }

    // 多筆欄位
    const ids = formData.getAll("groupId").map((v) => v.toString());
    const labels = formData.getAll("groupLabel").map((v) => v.toString());
    const descriptions = formData
      .getAll("groupDescription")
      .map((v) => v.toString());
    const tagIds = formData.getAll("groupTagId").map((v) => v.toString());
    const ordersRaw = formData.getAll("groupOrder").map((v) => v.toString());
    const deleteIds = new Set(
      formData.getAll("groupDelete").map((v) => v.toString())
    );

    const len = Math.max(
      ids.length,
      labels.length,
      descriptions.length,
      tagIds.length,
      ordersRaw.length
    );

    type IncomingGroup = {
      id?: string;
      label: string;
      description?: string;
      tagId: string;
      order: number;
      delete?: boolean;
    };

    const groups: IncomingGroup[] = [];

    for (let i = 0; i < len; i++) {
      const id = (ids[i] ?? "").trim();
      const label = (labels[i] ?? "").trim();
      const tagId = (tagIds[i] ?? "").trim();
      const description = (descriptions[i] ?? "").trim();
      const orderVal = parseInt(ordersRaw[i] ?? "", 10);
      const order = Number.isFinite(orderVal) ? orderVal : i;

      // label 或 tagId 沒填的行就跳過（視為空白）
      if (!label || !tagId) continue;

      const isDelete = id && deleteIds.has(id);

      groups.push({
        id: id || undefined,
        label,
        description: description || undefined,
        tagId,
        order,
        delete: isDelete,
      });
    }

    // 目前 DB 中的 group
    const existing = await prisma.frontCategoryTagGroup.findMany({
      where: { frontCategoryId },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((g) => g.id));

    // 逐一處理
    for (const g of groups) {
      // 刪除
      if (g.id && g.delete) {
        await prisma.frontCategoryTagGroup.delete({
          where: { id: g.id },
        });
        existingIds.delete(g.id);
        continue;
      }

      // 更新
      if (g.id) {
        await prisma.frontCategoryTagGroup.update({
          where: { id: g.id },
          data: {
            label: g.label,
            description: g.description ?? null,
            tagId: g.tagId,
            order: g.order,
          },
        });
        existingIds.delete(g.id);
        continue;
      }

      // 新增
      await prisma.frontCategoryTagGroup.create({
        data: {
          frontCategoryId,
          label: g.label,
          description: g.description ?? null,
          tagId: g.tagId,
          order: g.order,
        },
      });
    }

    // （可選）沒出現在表單裡的舊 group 要不要自動刪除？
    // for (const id of existingIds) {
    //   await prisma.frontCategoryTagGroup.delete({ where: { id } });
    // }

    // 重新驗證頁面 cache
    revalidatePath("/products");
    revalidatePath("/admin/catalog");
    revalidatePath(`/admin/catalog/${frontCategoryId}`);

    // ✅ 回去編輯頁，而不是顯示 JSON
    return NextResponse.redirect(
      new URL(`/admin/catalog/${frontCategoryId}`, req.url)
    );
  } catch (err) {
    console.error("[UPDATE_CATALOG_GROUPS_ERROR]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update tag groups" },
      { status: 500 }
    );
  }
}
