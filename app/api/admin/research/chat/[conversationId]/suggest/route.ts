// app/api/admin/research/chat/[conversationId]/suggest/route.ts
// 文章角度建議 API

import { NextRequest, NextResponse } from 'next/server';
import { conversationAssistant } from '@/lib/research';

export const maxDuration = 60;

// POST: 獲取文章角度建議
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const body = await request.json();

    if (!body.moduleIds || !Array.isArray(body.moduleIds) || body.moduleIds.length === 0) {
      return NextResponse.json(
        { error: 'moduleIds array is required' },
        { status: 400 }
      );
    }

    const suggestions = await conversationAssistant.suggestArticleAngles(
      conversationId,
      body.moduleIds,
      body.targetAudience
    );

    return NextResponse.json({
      success: true,
      suggestions,
      moduleIds: body.moduleIds
    });
  } catch (error) {
    console.error('Error suggesting article angles:', error);
    return NextResponse.json(
      { error: 'Failed to suggest article angles' },
      { status: 500 }
    );
  }
}
