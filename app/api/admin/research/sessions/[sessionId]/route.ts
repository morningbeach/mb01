// app/api/admin/research/sessions/[sessionId]/route.ts
// 單一研究任務 API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60;

// GET: 獲取研究任務詳情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    const session = await prisma.researchSession.findUnique({
      where: { id: sessionId },
      include: {
        modules: {
          orderBy: { createdAt: 'desc' }
        },
        sources: {
          orderBy: { createdAt: 'desc' }
        },
        conversations: {
          include: {
            _count: { select: { messages: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        articles: {
          orderBy: { updatedAt: 'desc' }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // 轉換格式以符合前端期望
    return NextResponse.json({ 
      session: {
        ...session,
        drafts: session.articles // 前端使用 drafts
      }
    });
  } catch (error) {
    console.error('Error fetching research session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research session' },
      { status: 500 }
    );
  }
}

// PATCH: 更新研究任務
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.focusAreas) updateData.focusAreas = body.focusAreas;

    const session = await prisma.researchSession.update({
      where: { id: sessionId },
      data: updateData
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error updating research session:', error);
    return NextResponse.json(
      { error: 'Failed to update research session' },
      { status: 500 }
    );
  }
}

// DELETE: 刪除研究任務
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // 先刪除相關資料（按照依賴順序）
    await prisma.$transaction([
      prisma.researchMessage.deleteMany({
        where: { conversation: { sessionId } }
      }),
      prisma.researchConversation.deleteMany({
        where: { sessionId }
      }),
      prisma.articleModuleUsage.deleteMany({
        where: { article: { sessionId } }
      }),
      prisma.articleDraft.deleteMany({
        where: { sessionId }
      }),
      prisma.researchModuleSource.deleteMany({
        where: { module: { sessionId } }
      }),
      prisma.researchModule.deleteMany({
        where: { sessionId }
      }),
      prisma.researchSource.deleteMany({
        where: { sessionId }
      }),
      prisma.researchSession.delete({
        where: { id: sessionId }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting research session:', error);
    return NextResponse.json(
      { error: 'Failed to delete research session' },
      { status: 500 }
    );
  }
}
