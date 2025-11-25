// app/api/admin/category-tree/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { buildNodePath } from "@/lib/category-tree-utils";

// 更新節點
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;
    
    console.log("=== CategoryNode Update Debug ===");
    console.log("ID:", id);
    console.log("Request Body:", JSON.stringify(body, null, 2));
    
    // 提取允許更新的欄位
    const {
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
    } = body;
    
    console.log("Extracted fields:", { slug, parentId, tagIds });
    
    // 構建更新數據對象
    const updateData: any = {};
    
    // 必填欄位 - 總是更新
    if (name_zh !== undefined) updateData.name_zh = name_zh;
    if (name_en !== undefined) updateData.name_en = name_en;
    if (displayMode !== undefined) updateData.displayMode = displayMode;
    
    // 可選欄位
    if (description_zh !== undefined) updateData.description_zh = description_zh;
    if (description_en !== undefined) updateData.description_en = description_en;
    if (order !== undefined) updateData.order = order;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (heroImage !== undefined) updateData.heroImage = heroImage;
    if (icon !== undefined) updateData.icon = icon;
    if (colorTheme !== undefined) updateData.colorTheme = colorTheme;
    if (tagIds !== undefined) updateData.tagIds = tagIds;
    if (seoTitle_zh !== undefined) updateData.seoTitle_zh = seoTitle_zh;
    if (seoTitle_en !== undefined) updateData.seoTitle_en = seoTitle_en;
    if (seoDescription_zh !== undefined) updateData.seoDescription_zh = seoDescription_zh;
    if (seoDescription_en !== undefined) updateData.seoDescription_en = seoDescription_en;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isLeaf !== undefined) updateData.isLeaf = isLeaf;
    if (isHidden !== undefined) updateData.isHidden = isHidden;
    if (showInMenu !== undefined) updateData.showInMenu = showInMenu;
    
    console.log("UpdateData before structure check:", JSON.stringify(updateData, null, 2));
    console.log("Checking structure change - slug:", slug, "parentId:", parentId);
    
    // 處理結構變更（slug 或 parentId）
    let needsChildUpdate = false;
    
    if (slug !== undefined || parentId !== undefined) {
      console.log("Structure change detected, calculating depth/path...");
      
      // 獲取當前節點信息
      const currentNode = await prisma.categoryNode.findUnique({
        where: { id },
        select: { parentId: true, slug: true },
      });
      
      if (!currentNode) {
        return NextResponse.json(
          { message: "節點不存在" },
          { status: 404 }
        );
      }
      
      // 確定最終的 parentId 和 slug
      const finalParentId = parentId !== undefined ? parentId : currentNode.parentId;
      const finalSlug = slug !== undefined ? slug : currentNode.slug;
      
      console.log("Final values - parentId:", finalParentId, "slug:", finalSlug);
      
      // 重新計算 depth 和 path
      let depth = 0;
      let path: string[] = [];
      
      if (finalParentId) {
        const parent = await prisma.categoryNode.findUnique({
          where: { id: finalParentId },
          select: { depth: true, path: true, slug: true },
        });
        
        if (parent) {
          depth = parent.depth + 1;
          path = [...parent.path, parent.slug];
        }
      }
      
      console.log("Calculated - depth:", depth, "path:", path);
      
      // 更新結構欄位
      updateData.depth = depth;
      updateData.path = path;
      if (slug !== undefined) updateData.slug = finalSlug;
      if (parentId !== undefined) updateData.parentId = finalParentId;
      
      // 如果 slug 或 parentId 改變，需要更新子節點
      if (finalSlug !== currentNode.slug || finalParentId !== currentNode.parentId) {
        needsChildUpdate = true;
      }
    } else {
      console.log("No structure change, skipping depth/path calculation");
    }

    // 執行更新
    console.log("=== FINAL UPDATE DATA ===");
    console.log("Keys:", Object.keys(updateData));
    console.log("Full data:", JSON.stringify(updateData, null, 2));
    
    const node = await prisma.categoryNode.update({
      where: { id },
      data: updateData,
    });
    
    console.log("✅ Update successful!");

    // 如果需要，更新子節點
    if (needsChildUpdate) {
      const children = await prisma.categoryNode.findMany({
        where: { parentId: id },
      });

      if (children.length > 0) {
        await updateChildrenDepthAndPath(id, node.depth, [...node.path, node.slug]);
      }
    }

    return NextResponse.json(node);
  } catch (error: any) {
    console.error("Error updating category node:", error);
    return NextResponse.json(
      { message: error.message || "更新失敗" },
      { status: 500 }
    );
  }
}

// 刪除節點
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // 檢查是否有子節點
    const children = await prisma.categoryNode.count({
      where: { parentId: id },
    });

    if (children > 0) {
      return NextResponse.json(
        { message: "無法刪除有子節點的分類，請先刪除所有子節點" },
        { status: 400 }
      );
    }

    await prisma.categoryNode.delete({
      where: { id },
    });

    return NextResponse.json({ message: "刪除成功" });
  } catch (error: any) {
    console.error("Error deleting category node:", error);
    return NextResponse.json(
      { message: error.message || "刪除失敗" },
      { status: 500 }
    );
  }
}

// 遞迴更新子節點的 depth 和 path
async function updateChildrenDepthAndPath(
  parentId: string,
  parentDepth: number,
  parentPath: string[]
) {
  const children = await prisma.categoryNode.findMany({
    where: { parentId },
  });

  for (const child of children) {
    const newDepth = parentDepth + 1;
    const newPath = [...parentPath, child.slug];

    await prisma.categoryNode.update({
      where: { id: child.id },
      data: {
        depth: newDepth,
        path: newPath,
      },
    });

    // 遞迴更新子節點的子節點
    await updateChildrenDepthAndPath(child.id, newDepth, newPath);
  }
}
