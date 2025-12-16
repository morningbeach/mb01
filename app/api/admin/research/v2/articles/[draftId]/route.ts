// app/api/admin/research/v2/articles/[draftId]/route.ts
// 單一草稿 API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 獲取草稿詳情
export async function GET(
  request: NextRequest,
  { params }: { params: { draftId: string } }
) {
  try {
    const draft = await prisma.articleDraft.findUnique({
      where: { id: params.draftId },
      include: {
        session: true,
        moduleUsages: {
          include: {
            module: true
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
  } catch (error: any) {
    console.error('Error fetching draft:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

// PATCH: 更新草稿
export async function PATCH(
  request: NextRequest,
  { params }: { params: { draftId: string } }
) {
  try {
    const body = await request.json();

    const draft = await prisma.articleDraft.update({
      where: { id: params.draftId },
      data: {
        ...(body.title_zh !== undefined && { title_zh: body.title_zh }),
        ...(body.title_en !== undefined && { title_en: body.title_en }),
        ...(body.content_zh !== undefined && { content_zh: body.content_zh }),
        ...(body.content_en !== undefined && { content_en: body.content_en }),
        ...(body.excerpt_zh !== undefined && { excerpt_zh: body.excerpt_zh }),
        ...(body.excerpt_en !== undefined && { excerpt_en: body.excerpt_en }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.tags !== undefined && { tags: body.tags })
      }
    });

    return NextResponse.json({ draft });
  } catch (error: any) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update draft' },
      { status: 500 }
    );
  }
}

// DELETE: 刪除草稿
export async function DELETE(
  request: NextRequest,
  { params }: { params: { draftId: string } }
) {
  try {
    await prisma.articleDraft.delete({
      where: { id: params.draftId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting draft:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete draft' },
      { status: 500 }
    );
  }
}
