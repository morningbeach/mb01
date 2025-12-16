// app/api/admin/research/drafts/[draftId]/expand/route.ts
// 展開草稿章節

import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120;

// POST: 展開指定章節（佔位符實作）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const { draftId } = await params;
    const body = await request.json();

    if (!body.sectionTitle) {
      return NextResponse.json(
        { error: 'sectionTitle is required' },
        { status: 400 }
      );
    }

    // TODO: 實際連接 AI 服務進行章節擴展
    const expandedContent = `## ${body.sectionTitle}\n\n這是 ${body.sectionTitle} 章節的擴展內容。\n\n實際部署時會連接 AI 服務生成內容。\n\n草稿 ID: ${draftId}`;

    return NextResponse.json({
      success: true,
      sectionTitle: body.sectionTitle,
      content: expandedContent
    });
  } catch (error) {
    console.error('Error expanding section:', error);
    return NextResponse.json(
      { error: 'Failed to expand section' },
      { status: 500 }
    );
  }
}
