// app/api/admin/research/v2/chat/start/route.ts
// 開始新對話 API

import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/research/core/chat-service';

// POST: 開始新對話
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, topic } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const conversationId = await chatService.startConversation(sessionId, topic);

    // 獲取初始訊息
    const messages = await chatService.getHistory(conversationId);

    return NextResponse.json({
      success: true,
      conversationId,
      messages
    });
  } catch (error: any) {
    console.error('Error starting conversation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start conversation' },
      { status: 500 }
    );
  }
}
