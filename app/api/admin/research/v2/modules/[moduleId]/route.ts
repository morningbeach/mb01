// app/api/admin/research/v2/modules/[moduleId]/route.ts
// 研究模組 CRUD API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCitationScore, SourceForScoring } from '@/lib/research/core/citation-scorer';

// GET: 獲取模組詳情（包含所有來源及引用分數）
export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const module = await prisma.researchModule.findUnique({
      where: { id: params.moduleId },
      include: {
        sources: {
          include: {
            source: {
              select: {
                id: true,
                url: true,
                title: true,
                domain: true,
                authorityScore: true,
                originalityScore: true,
                relevanceScore: true,
                sourceType: true,
                region: true,
                language: true,
                keyPoints: true,
                summary: true
              }
            }
          }
        },
        session: {
          select: {
            id: true,
            topic: true
          }
        }
      }
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // 獲取 session 所有可用來源
    const allSources = await prisma.researchSource.findMany({
      where: { 
        sessionId: module.session.id,
        isExcluded: false
      },
      select: {
        id: true,
        url: true,
        title: true,
        domain: true,
        authorityScore: true,
        originalityScore: true,
        relevanceScore: true,
        sourceType: true,
        region: true,
        language: true,
        keyPoints: true,
        summary: true
      },
      orderBy: { authorityScore: 'desc' }
    });

    // 現有連結的來源 ID
    const linkedSourceIds = new Set(module.sources.map(s => s.source.id));

    // 計算所有來源的引用分數
    const sourcesWithCitation = allSources.map(source => {
      const citationInfo = calculateCitationScore(
        source as SourceForScoring,
        module.moduleType,
        module.tags
      );
      
      return {
        ...source,
        isLinked: linkedSourceIds.has(source.id),
        citationScore: citationInfo.citationScore,
        citationReason: citationInfo.citationReason,
        citationPriority: citationInfo.citationPriority,
        suggestedUsage: citationInfo.suggestedUsage
      };
    });

    // 按引用分數排序
    sourcesWithCitation.sort((a, b) => b.citationScore - a.citationScore);

    return NextResponse.json({ 
      module,
      allSources: sourcesWithCitation,
      stats: {
        totalSources: allSources.length,
        linkedSources: linkedSourceIds.size,
        highPriority: sourcesWithCitation.filter(s => s.citationPriority === 'high').length,
        mediumPriority: sourcesWithCitation.filter(s => s.citationPriority === 'medium').length
      }
    });
  } catch (error: any) {
    console.error('Error fetching module:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch module' },
      { status: 500 }
    );
  }
}

// PATCH: 更新模組
export async function PATCH(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const body = await request.json();
    const {
      title_zh,
      title_en,
      conclusion_zh,
      conclusion_en,
      insight_zh,
      insight_en,
      tags,
      humanApproved,
      humanNotes
    } = body;

    const updateData: Record<string, any> = {};
    
    if (title_zh !== undefined) updateData.title_zh = title_zh;
    if (title_en !== undefined) updateData.title_en = title_en;
    if (conclusion_zh !== undefined) updateData.conclusion_zh = conclusion_zh;
    if (conclusion_en !== undefined) updateData.conclusion_en = conclusion_en;
    if (insight_zh !== undefined) updateData.insight_zh = insight_zh;
    if (insight_en !== undefined) updateData.insight_en = insight_en;
    if (tags !== undefined) updateData.tags = tags;
    if (humanApproved !== undefined) updateData.humanApproved = humanApproved;
    if (humanNotes !== undefined) updateData.humanNotes = humanNotes;

    const module = await prisma.researchModule.update({
      where: { id: params.moduleId },
      data: updateData,
      include: {
        sources: {
          include: {
            source: {
              select: {
                id: true,
                url: true,
                title: true,
                domain: true,
                authorityScore: true,
                relevanceScore: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      module 
    });
  } catch (error: any) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update module' },
      { status: 500 }
    );
  }
}

// DELETE: 刪除模組
export async function DELETE(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    await prisma.researchModule.delete({
      where: { id: params.moduleId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete module' },
      { status: 500 }
    );
  }
}
