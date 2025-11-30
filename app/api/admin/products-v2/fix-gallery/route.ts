import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - 修正產品 gallery 中重複的封面圖
export async function POST(req: NextRequest) {
  try {
    // 取得所有 V2 產品
    const products = await prisma.product.findMany({
      where: { version: 2 },
      select: {
        id: true,
        name: true,
        name_zh: true,
        coverImage: true,
        images: true,
      },
    });

    const results: any[] = [];
    let fixedCount = 0;

    for (const product of products) {
      const productName = product.name_zh || product.name || product.id;
      
      // 檢查 images 陣列是否包含 coverImage
      if (product.coverImage && product.images && product.images.length > 0) {
        const hasDuplicate = product.images.includes(product.coverImage);
        
        if (hasDuplicate) {
          // 移除重複的封面圖
          const cleanedImages = product.images.filter(img => img !== product.coverImage);
          
          // 更新資料庫
          await prisma.product.update({
            where: { id: product.id },
            data: { images: cleanedImages },
          });
          
          results.push({
            id: product.id,
            name: productName,
            originalCount: product.images.length,
            newCount: cleanedImages.length,
            fixed: true,
          });
          
          fixedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `修正了 ${fixedCount} 個產品的重複圖片`,
      totalProducts: products.length,
      fixedCount,
      details: results,
    });

  } catch (error: any) {
    console.error("修正圖片失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "修正失敗" },
      { status: 500 }
    );
  }
}

// GET - 檢查有多少產品有重複圖片問題
export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { version: 2 },
      select: {
        id: true,
        name: true,
        name_zh: true,
        coverImage: true,
        images: true,
      },
    });

    const problemProducts: any[] = [];

    for (const product of products) {
      if (product.coverImage && product.images && product.images.length > 0) {
        if (product.images.includes(product.coverImage)) {
          problemProducts.push({
            id: product.id,
            name: product.name_zh || product.name,
            coverImage: product.coverImage,
            imagesCount: product.images.length,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalProducts: products.length,
      problemCount: problemProducts.length,
      problemProducts,
    });

  } catch (error: any) {
    console.error("檢查失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "檢查失敗" },
      { status: 500 }
    );
  }
}
