// app/api/admin/homepage/sections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const defaultHeroPayload = {
  title_zh: "定制高端禮盒",
  title_en: "Custom Premium Gift Boxes",
  subtitle_zh: "為全球品牌提供精緻包裝解決方案",
  subtitle_en: "Crafting Elegant Packaging for Global Brands",
  heroImageUrl: "/cdn/hero/hero-giftbox.jpg",
  ctaText_zh: "探索產品",
  ctaText_en: "Explore Products",
  ctaLink: "/products",
};

// 新增 Section
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, enabled, order } = body;

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    const section = await prisma.homeSection.create({
      data: {
        type,
        order: Number.isFinite(order) ? order : 100,
        enabled: enabled ?? true,
        payload: type === "HERO" ? defaultHeroPayload : {},
      },
    });

    revalidatePath("/admin/homepage");
    revalidatePath("/");

    return NextResponse.json(section);
  } catch (error) {
    console.error("Create section error:", error);
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}

// 更新 Section
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, enabled, order } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const section = await prisma.homeSection.update({
      where: { id: Number(id) },
      data: {
        enabled: enabled ?? undefined,
        order: Number.isFinite(order) ? order : undefined,
      },
    });

    revalidatePath("/admin/homepage");
    revalidatePath("/");

    return NextResponse.json(section);
  } catch (error) {
    console.error("Update section error:", error);
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
  }
}

// 刪除 Section
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.homeSection.delete({
      where: { id: Number(id) },
    });

    revalidatePath("/admin/homepage");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete section error:", error);
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
  }
}
