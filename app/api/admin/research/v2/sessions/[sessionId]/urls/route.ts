// app/api/admin/research/v2/sessions/[sessionId]/urls/route.ts
// 追加研究 URL API

import { NextRequest, NextResponse } from 'next/server';
import { researchService } from '@/lib/research/core/research-service';

export const maxDuration = 120;

// POST: 追加 URL 進行研究
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    const result = await researchService.addUrls(params.sessionId, urls);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error adding URLs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add URLs' },
      { status: 500 }
    );
  }
}
