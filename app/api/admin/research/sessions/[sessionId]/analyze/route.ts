// app/api/admin/research/sessions/[sessionId]/analyze/route.ts
// 分析資料並生成模組

import { NextRequest, NextResponse } from 'next/server';
import { researchEngine } from '@/lib/research';

export const maxDuration = 180; // AI 分析需要較長時間

// POST: 執行分析生成模組
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    // 執行模組生成
    await researchEngine.generateModules(sessionId);
    
    // 取得生成後的 session 詳情（包含 modules）
    const session = await researchEngine.getSessionDetails(sessionId);
    const modules = session?.modules || [];

    return NextResponse.json({
      success: true,
      modulesGenerated: modules.length,
      modules,
      status: session?.status
    });
  } catch (error) {
    console.error('Error analyzing research data:', error);
    return NextResponse.json(
      { error: 'Failed to analyze research data', details: String(error) },
      { status: 500 }
    );
  }
}
