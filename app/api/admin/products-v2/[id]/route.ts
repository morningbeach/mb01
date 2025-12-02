import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - 取得單一產品
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        ProductTag: {
          include: { Tag: true },
        },
      },
    });

    if (!product || product.version !== 2) {
      return NextResponse.json(
        { success: false, message: "產品不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("取得產品失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "取得產品失敗" },
      { status: 500 }
    );
  }
}

// PUT - 更新產品
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    // 確保不能改變 version
    const { version, id, createdAt, updatedAt, tagIds, ...updateData } = body;

    // 檢查 SKU 是否與其他產品重複（排除自己）
    // 注意：要檢查非空字串，因為空字串和 null 都可能存在
    if (updateData.sku && updateData.sku.trim() !== '') {
      const existingProduct = await prisma.product.findFirst({
        where: {
          sku: updateData.sku.trim(),
          NOT: {
            id: params.id, // 排除當前正在更新的產品
          },
        },
      });

      if (existingProduct) {
        return NextResponse.json(
          { 
            success: false, 
            message: `SKU "${updateData.sku}" 已被其他產品使用\n產品名稱：${existingProduct.name}\n產品 ID：${existingProduct.id}`,
          },
          { status: 400 }
        );
      }
    }
    
    // 如果 SKU 是空字串，轉換為 null（避免空字串重複問題）
    if (updateData.sku === '' || (typeof updateData.sku === 'string' && updateData.sku.trim() === '')) {
      updateData.sku = null;
    }

    // 先刪除舊的 TAG 關聯，再建立新的
    await prisma.productTag.deleteMany({
      where: { productId: params.id },
    });

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...updateData,
        // 重新建立 TAG 關聯
        ProductTag: tagIds ? {
          create: tagIds.map((tagId: string) => ({
            tagId,
          })),
        } : undefined,
      },
      include: {
        ProductTag: {
          include: { Tag: true },
        },
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("更新產品失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "更新產品失敗" },
      { status: 500 }
    );
  }
}

// DELETE - 刪除產品
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 檢查產品是否存在
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "產品不存在" },
        { status: 404 }
      );
    }

    // 依序刪除關聯資料
    // 1. 刪除產品標籤關聯
    await prisma.productTag.deleteMany({
      where: { productId: params.id },
    });

    // 2. 刪除產品圖片關聯
    await prisma.productImage.deleteMany({
      where: { productId: params.id },
    });

    // 3. 刪除禮盒組合項目
    await prisma.giftSetItem.deleteMany({
      where: { productId: params.id },
    });

    // 4. 刪除禮盒組合
    await prisma.giftSet.deleteMany({
      where: { productId: params.id },
    });

    // 5. 最後刪除產品
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "產品已成功刪除",
    });
  } catch (error: any) {
    console.error("刪除產品失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "刪除產品失敗" },
      { status: 500 }
    );
  }
}
