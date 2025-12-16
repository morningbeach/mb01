// app/api/admin/research/v2/articles/titles/route.ts
// 標題建議 API

import { NextRequest, NextResponse } from 'next/server';
import { articleGenerator } from '@/lib/research/writing/article-generator';

// POST: 生成標題建議
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, moduleIds, style = 'mbpack' } = body;

    if (!sessionId || !moduleIds || moduleIds.length === 0) {
      return NextResponse.json(
        { error: 'sessionId and moduleIds are required' },
        { status: 400 }
      );
    }

    const titles = await articleGenerator.suggestTitles(sessionId, moduleIds, style);

    return NextResponse.json({
      success: true,
      titles
    });
  } catch (error: any) {
    console.error('Error generating titles:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate titles' },
      { status: 500 }
    );
  }
}
