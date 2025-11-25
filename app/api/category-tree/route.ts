// app/api/category-tree/route.ts - 前台 API
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 遞迴載入完整樹狀結構（僅前台可見節點）
async function loadFullTree(maxDepth = 10) {
  const rootNodes = await prisma.categoryNode.findMany({
    where: {
      depth: 0,
      isActive: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  async function loadChildren(node: any, currentDepth: number): Promise<any> {
    if (currentDepth >= maxDepth) {
      return { ...node, children: [] };
    }

    const children = await prisma.categoryNode.findMany({
      where: {
        parentId: node.id,
        isActive: true,
        isHidden: false, // 前台過濾隱藏節點
      },
      orderBy: {
        order: 'asc',
      },
    });

    const childrenWithSubChildren = await Promise.all(
      children.map(child => loadChildren(child, currentDepth + 1))
    );

    return {
      ...node,
      children: childrenWithSubChildren,
    };
  }

  const treesWithChildren = await Promise.all(
    rootNodes.map(node => loadChildren(node, 0))
  );

  // 返回根節點，前台過濾 isHidden
  return treesWithChildren.filter(node => !node.isHidden);
}

export async function GET() {
  try {
    const tree = await loadFullTree();
    return NextResponse.json({ tree });
  } catch (error) {
    console.error("Failed to fetch category tree:", error);
    return NextResponse.json(
      { error: "Failed to fetch category tree" },
      { status: 500 }
    );
  }
}
