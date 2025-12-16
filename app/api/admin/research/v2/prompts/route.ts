// app/api/admin/research/v2/prompts/route.ts
// 深度研究提示 API

import { NextRequest, NextResponse } from 'next/server';
import { 
  defaultPrompts, 
  recommendPrompts, 
  getPromptCategories,
  type ResearchPrompt 
} from '@/lib/research/prompts/deep-research-prompts';

// GET: 獲取提示列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const topic = searchParams.get('topic');
    const focusAreas = searchParams.get('focusAreas')?.split(',') || [];

    let prompts: ResearchPrompt[] = defaultPrompts;

    // 按分類篩選
    if (category && category !== 'all') {
      prompts = prompts.filter(p => p.category === category);
    }

    // 如果有主題，返回推薦的提示
    if (topic) {
      prompts = recommendPrompts(topic, focusAreas);
    }

    // 獲取分類統計
    const categories = getPromptCategories();

    return NextResponse.json({
      prompts,
      categories,
      total: prompts.length
    });

  } catch (error: any) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}
