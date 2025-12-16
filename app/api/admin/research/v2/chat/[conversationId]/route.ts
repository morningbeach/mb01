// app/api/admin/research/v2/chat/[conversationId]/route.ts
// 對話詳情 API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chatService } from '@/lib/research/core/chat-service';

// GET: 獲取對話歷史
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const messages = await chatService.getHistory(params.conversationId);

    return NextResponse.json({
      success: true,
      messages
    });
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

// DELETE: 刪除對話
export async function DELETE(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    await prisma.researchConversation.delete({
      where: { id: params.conversationId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
