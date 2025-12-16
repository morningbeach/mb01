// app/api/admin/research/modules/route.ts
// 研究模組 API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 獲取研究模組
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const moduleType = searchParams.get('type');
    const approved = searchParams.get('approved');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    if (sessionId) where.sessionId = sessionId;
    if (moduleType) where.moduleType = moduleType;
    if (approved !== null) where.humanApproved = approved === 'true';

    const [modules, total] = await Promise.all([
      prisma.researchModule.findMany({
        where,
        include: {
          sources: {
            include: { source: true }
          },
          _count: {
            select: { articleUsages: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.researchModule.count({ where })
    ]);

    return NextResponse.json({
      modules,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching research modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research modules' },
      { status: 500 }
    );
  }
}
