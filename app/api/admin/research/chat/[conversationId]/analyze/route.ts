// app/api/admin/research/chat/[conversationId]/analyze/route.ts
// 分析模組 API

import { NextRequest, NextResponse } from 'next/server';
import { conversationAssistant } from '@/lib/research';

export const maxDuration = 60;

// POST: 分析指定模組
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

    const analysisType = body.analysisType || 'synthesize';
    const validTypes = ['compare', 'synthesize', 'expand', 'critique'];
    
    if (!validTypes.includes(analysisType)) {
      return NextResponse.json(
        { error: `analysisType must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const analysis = await conversationAssistant.analyzeModules(
      conversationId,
      body.moduleIds,
      analysisType as 'compare' | 'synthesize' | 'expand' | 'critique'
    );

    return NextResponse.json({
      success: true,
      analysis,
      analysisType,
      moduleIds: body.moduleIds
    });
  } catch (error) {
    console.error('Error analyzing modules:', error);
    return NextResponse.json(
      { error: 'Failed to analyze modules' },
      { status: 500 }
    );
  }
}
