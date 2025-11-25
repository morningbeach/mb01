// app/api/admin/category-tree/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFullTree, updateNodeDepths, buildNodePath } from "@/lib/category-tree-utils";

// GET: 取得完整樹狀結構
export async function GET() {
  try {
    const tree = await getFullTree(prisma);
    return NextResponse.json({ tree });
  } catch (error) {
    console.error("Get tree error:", error);
    return NextResponse.json(
      { error: "Failed to get tree" },
      { status: 500 }
    );
  }
}

// POST: 建立新節點
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const {
      slug,
      name_zh,
      name_en,
      description_zh,
      description_en,
      parentId,
      displayMode = "grid",
      order = 0,
      coverImage,
      heroImage,
      icon,
      colorTheme,
      tagIds = [],
      seoTitle_zh,
      seoTitle_en,
      seoDescription_zh,
      seoDescription_en,
      isActive = true,
      isLeaf = false,
      isHidden = false,
      showInMenu = true,
    } = data;

    // 計算深度
    let depth = 0;
    if (parentId) {
      const parent = await prisma.categoryNode.findUnique({
        where: { id: parentId },
      });
      depth = (parent?.depth ?? -1) + 1;
    }

    // 建構路徑
    const pathSlugs = parentId ? await buildNodePath(prisma, parentId) : [];
    pathSlugs.push(slug);

    const node = await prisma.categoryNode.create({
      data: {
        slug,
        name_zh,
        name_en,
        description_zh,
        description_en,
        parentId,
        displayMode,
        order,
        coverImage,
        heroImage,
        icon,
        colorTheme,
        tagIds,
        seoTitle_zh,
        seoTitle_en,
        seoDescription_zh,
        seoDescription_en,
        isActive,
        isLeaf,
        isHidden,
        showInMenu,
        depth,
        path: pathSlugs,
        productIds: [],
      },
    });

    return NextResponse.json({ node });
  } catch (error) {
    console.error("Create node error:", error);
    return NextResponse.json(
      { error: "Failed to create node" },
      { status: 500 }
    );
  }
}
