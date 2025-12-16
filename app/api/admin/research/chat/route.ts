// app/api/admin/research/chat/route.ts
// AI 對話 API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60;

// POST: 發送訊息
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 如果沒有 conversationId，先建立對話
    let conversationId = body.conversationId;
    
    if (!conversationId) {
      if (!body.sessionId) {
        return NextResponse.json(
          { error: 'sessionId is required to start a new conversation' },
          { status: 400 }
        );
      }
      
      const conversation = await prisma.researchConversation.create({
        data: {
          sessionId: body.sessionId,
          topic: body.topic
        }
      });
      
      conversationId = conversation.id;
    }

    if (!body.message) {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 }
      );
    }

    // 儲存用戶訊息
    await prisma.researchMessage.create({
      data: {
        conversationId,
        role: 'USER',
        content: body.message
      }
    });

    // 簡單的回應（實際應該調用 AI）
    const aiResponse = await prisma.researchMessage.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: `收到您的問題：「${body.message}」\n\n這是一個 AI 研究助手的回應佔位符。實際部署時會連接到 AI 模型進行回應。`,
        isDraft: true
      }
    });

    return NextResponse.json({
      conversationId,
      content: aiResponse.content,
      messageId: aiResponse.id,
      isDraft: true
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
