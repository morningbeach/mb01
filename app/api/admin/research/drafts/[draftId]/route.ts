// app/api/admin/research/drafts/[draftId]/route.ts
// 單一草稿 API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const maxDuration = 120;

// GET: 獲取草稿詳情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const { draftId } = await params;

    const draft = await prisma.articleDraft.findUnique({
      where: { id: draftId },
      include: {
        moduleUsages: {
          include: {
            module: true
          }
        },
        session: {
          select: {
            id: true,
            focusAreas: true
          }
        }
      }
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

// PATCH: 更新草稿
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const { draftId } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    // 可更新的欄位
    if (body.title_zh !== undefined) updateData.title_zh = body.title_zh;
    if (body.title_en !== undefined) updateData.title_en = body.title_en;
    if (body.content_zh !== undefined) {
      updateData.content_zh = body.content_zh;
      updateData.wordCount = body.content_zh.length;
    }
    if (body.content_en !== undefined) updateData.content_en = body.content_en;
    if (body.outline !== undefined) updateData.outline = body.outline;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.humanEdited !== undefined) updateData.humanEdited = body.humanEdited;

    const draft = await prisma.articleDraft.update({
      where: { id: draftId },
      data: updateData
    });

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}

// DELETE: 刪除草稿
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const { draftId } = await params;

    await prisma.$transaction([
      prisma.articleModuleUsage.deleteMany({
        where: { articleId: draftId }
      }),
      prisma.articleDraft.delete({
        where: { id: draftId }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}
