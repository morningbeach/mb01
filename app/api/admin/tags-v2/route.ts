import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 生成唯一 ID
function generateId(prefix: string = 'tag'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}-${timestamp}-${random}`;
}

// POST - 建立新標籤
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dimensionId, ...tagBody } = body;

    // 檢查 slug 是否重複
    if (tagBody.slug) {
      const existingTag = await prisma.tag.findFirst({
        where: { slug: tagBody.slug }
      });
      
      if (existingTag) {
        return NextResponse.json(
          { success: false, message: `標籤 slug "${tagBody.slug}" 已存在，請使用其他名稱` },
          { status: 400 }
        );
      }
    }

    const tagId = generateId('tag');
    const tagData = {
      ...tagBody,
      id: tagId,
      version: 2,
    };

    // 使用 transaction 同時創建標籤和維度關聯
    const result = await prisma.$transaction(async (tx) => {
      // 創建標籤
      const tag = await tx.tag.create({
        data: tagData,
      });

      // 如果有指定維度，創建維度-標籤關聯
      if (dimensionId) {
        // 先檢查維度是否存在
        const dimension = await tx.filterDimension.findUnique({
          where: { id: dimensionId }
        });
        
        if (dimension) {
          await tx.dimensionTagMapping.create({
            data: {
              dimensionId,
              tagId: tag.id,
              order: 999, // 放到最後
            }
          });
        }
      }

      return tag;
    });

    return NextResponse.json({ success: true, tag: result, dimensionId });
  } catch (error: any) {
    console.error("建立標籤失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "建立標籤失敗" },
      { status: 500 }
    );
  }
}

// GET - 取得所有 V2 標籤
export async function GET(req: NextRequest) {
  try {
    const tags = await prisma.tag.findMany({
      where: { version: 2 },
      include: {
        _count: {
          select: { ProductTag: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, tags });
  } catch (error: any) {
    console.error("取得標籤列表失敗:", error);
    return NextResponse.json(
      { success: false, message: error.message || "取得標籤列表失敗" },
      { status: 500 }
    );
  }
}
