// app/api/admin/research/v2/chat/route.ts
// 研究對話 API

import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/research/core/chat-service';

export const maxDuration = 60;

// POST: 發送訊息
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message } = body;

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'conversationId and message are required' },
        { status: 400 }
      );
    }

    const response = await chatService.chat(conversationId, message);

    return NextResponse.json({
      success: true,
      message: response
    });
  } catch (error: any) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}
