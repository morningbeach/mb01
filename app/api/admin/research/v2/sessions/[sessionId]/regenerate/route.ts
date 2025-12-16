// app/api/admin/research/v2/sessions/[sessionId]/regenerate/route.ts
// 重新生成研究模組 API

import { NextRequest, NextResponse } from 'next/server';
import { researchService } from '@/lib/research/core/research-service';

export const maxDuration = 120;

// POST: 重新生成模組
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const count = await researchService.regenerateModules(params.sessionId);

    return NextResponse.json({
      success: true,
      modulesGenerated: count
    });
  } catch (error: any) {
    console.error('Error regenerating modules:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to regenerate modules' },
      { status: 500 }
    );
  }
}
