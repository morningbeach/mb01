// app/api/admin/research/sessions/[sessionId]/collect/route.ts
// 執行資料收集

import { NextRequest, NextResponse } from 'next/server';
import { researchEngine } from '@/lib/research';

export const maxDuration = 120; // 資料收集可能需要較長時間

// POST: 執行資料收集
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    // 執行資料收集
    await researchEngine.collectSources(sessionId);
    
    // 獲取收集到的來源
    const session = await researchEngine.getSessionDetails(sessionId);
    const sources = session?.sources || [];

    return NextResponse.json({
      success: true,
      sourcesCollected: sources.length,
      sources,
      status: session?.status
    });
  } catch (error) {
    console.error('Error collecting research data:', error);
    return NextResponse.json(
      { error: 'Failed to collect research data', details: String(error) },
      { status: 500 }
    );
  }
}
