// app/api/admin/research/v2/sessions/[sessionId]/route.ts
// 單一研究任務 API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 獲取研究任務詳情
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await prisma.researchSession.findUnique({
      where: { id: params.sessionId },
      include: {
        sources: {
          orderBy: { authorityScore: 'desc' }
        },
        modules: {
          orderBy: { createdAt: 'desc' },
          include: {
            sources: {
              include: { source: true }
            }
          }
        },
        conversations: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        articles: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            modules: true,
            sources: true,
            conversations: true,
            articles: true
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// PATCH: 更新研究任務
export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const body = await request.json();
    
    const session = await prisma.researchSession.update({
      where: { id: params.sessionId },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.topic && { topic: body.topic }),
        ...(body.focusAreas && { focusAreas: body.focusAreas }),
        ...(body.humanNotes !== undefined && { humanNotes: body.humanNotes }),
        ...(body.humanReviewedAt && { humanReviewedAt: new Date() }),
        // 深度研究提示
        ...(body.researchPromptId !== undefined && { researchPromptId: body.researchPromptId }),
        ...(body.customQuestions && { customQuestions: body.customQuestions }),
        // 市場篩選
        ...(body.marketType && { marketType: body.marketType }),
        ...(body.targetAudience && { targetAudience: body.targetAudience }),
        ...(body.industryTags && { industryTags: body.industryTags })
      }
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE: 刪除研究任務
export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    await prisma.researchSession.delete({
      where: { id: params.sessionId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
