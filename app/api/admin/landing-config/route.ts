import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const config = await prisma.siteSetting.findUnique({
      where: { key: "landing-v2-config" },
    });

    const cases = await prisma.caseProject.findMany({
      where: { isPublished: true },
      select: { id: true, title_zh: true, coverImage: true, slug: true },
      orderBy: { createdAt: "desc" },
    });

    const blogs = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, coverImage: true, slug: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      config: config?.value || {},
      cases,
      blogs,
    });
  } catch (error) {
    console.error("Error fetching landing config:", error);
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { config } = body;

    // 先檢查是否存在
    const existing = await prisma.siteSetting.findUnique({
      where: { key: "landing-v2-config" },
    });

    let updated;
    if (existing) {
      // 更新
      updated = await prisma.siteSetting.update({
        where: { key: "landing-v2-config" },
        data: { value: config, updatedAt: new Date() },
      });
    } else {
      // 建立新的（用 key 作為 id 避免衝突）
      updated = await prisma.siteSetting.create({
        data: {
          id: "landing-v2-config",
          key: "landing-v2-config",
          value: config,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating landing config:", error);
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
  }
}
