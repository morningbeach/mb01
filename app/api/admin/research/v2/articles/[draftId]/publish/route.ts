// app/api/admin/research/v2/articles/[draftId]/publish/route.ts
// 發布文章到 Blog API

import { NextRequest, NextResponse } from 'next/server';
import { articleGenerator } from '@/lib/research/writing/article-generator';

// POST: 發布到 Blog
export async function POST(
  request: NextRequest,
  { params }: { params: { draftId: string } }
) {
  try {
    const body = await request.json();
    const { slug, coverImage, categoryId, publishNow = false } = body;

    const postId = await articleGenerator.publishToBlog(params.draftId, {
      slug,
      coverImage,
      categoryId,
      publishNow
    });

    return NextResponse.json({
      success: true,
      postId
    });
  } catch (error: any) {
    console.error('Error publishing article:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish article' },
      { status: 500 }
    );
  }
}
