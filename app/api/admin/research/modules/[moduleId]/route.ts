// app/api/admin/research/modules/[moduleId]/route.ts
// 單一研究模組 API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 獲取模組詳情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;

    const module = await prisma.researchModule.findUnique({
      where: { id: moduleId },
      include: {
        sources: {
          include: { source: true }
        },
        session: {
          select: {
            id: true,
            status: true
          }
        },
        articleUsages: {
          include: {
            article: {
              select: {
                id: true,
                title_zh: true,
                status: true
              }
            }
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

    return NextResponse.json({ module });
  } catch (error) {
    console.error('Error fetching research module:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research module' },
      { status: 500 }
    );
  }
}

// PATCH: 更新模組（人工審核/編輯）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const body = await request.json();

    const updateData: any = {};

    // 可更新的欄位
    if (body.title_zh !== undefined) updateData.title_zh = body.title_zh;
    if (body.title_en !== undefined) updateData.title_en = body.title_en;
    if (body.conclusion_zh !== undefined) updateData.conclusion_zh = body.conclusion_zh;
    if (body.conclusion_en !== undefined) updateData.conclusion_en = body.conclusion_en;
    if (body.insight_zh !== undefined) updateData.insight_zh = body.insight_zh;
    if (body.insight_en !== undefined) updateData.insight_en = body.insight_en;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.humanApproved !== undefined) updateData.humanApproved = body.humanApproved;
    if (body.humanEdited !== undefined) updateData.humanEdited = body.humanEdited;
    if (body.humanNotes !== undefined) updateData.humanNotes = body.humanNotes;
    if (body.isReusable !== undefined) updateData.isReusable = body.isReusable;

    const module = await prisma.researchModule.update({
      where: { id: moduleId },
      data: updateData
    });

    return NextResponse.json({ module });
  } catch (error) {
    console.error('Error updating research module:', error);
    return NextResponse.json(
      { error: 'Failed to update research module' },
      { status: 500 }
    );
  }
}

// DELETE: 刪除模組
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;

    await prisma.$transaction([
      prisma.researchModuleSource.deleteMany({
        where: { moduleId }
      }),
      prisma.articleModuleUsage.deleteMany({
        where: { moduleId }
      }),
      prisma.researchModule.delete({
        where: { id: moduleId }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting research module:', error);
    return NextResponse.json(
      { error: 'Failed to delete research module' },
      { status: 500 }
    );
  }
}
