import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { productIds } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "請提供要刪除的產品 ID 列表" },
        { status: 400 }
      );
    }

    // 依序刪除關聯資料
    // 1. 刪除產品與標籤的關聯
    await prisma.productTag.deleteMany({
      where: { productId: { in: productIds } },
    });

    // 2. 刪除產品圖片關聯
    await prisma.productImage.deleteMany({
      where: { productId: { in: productIds } },
    });

    // 3. 刪除禮盒組合項目關聯
    await prisma.giftSetItem.deleteMany({
      where: { productId: { in: productIds } },
    });

    // 4. 刪除禮盒組合（如果產品是禮盒主體）
    await prisma.giftSet.deleteMany({
      where: { productId: { in: productIds } },
    });

    // 5. 最後刪除產品本身
    const result = await prisma.product.deleteMany({
      where: { id: { in: productIds } },
    });

    return NextResponse.json({
      success: true,
      message: `成功刪除 ${result.count} 個產品`,
      deletedCount: result.count,
    });
  } catch (error: any) {
    console.error("批量刪除產品失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "刪除失敗" },
      { status: 500 }
    );
  }
}
