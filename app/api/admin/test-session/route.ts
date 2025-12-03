import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
  };

  // Test 1: Database connection
  try {
    const userCount = await prisma.adminUser.count();
    results.tests.push({ name: 'DB Connection', status: 'OK', userCount });
  } catch (e: any) {
    results.tests.push({ name: 'DB Connection', status: 'FAIL', error: e.message });
  }

  // Test 2: Find user
  try {
    const user = await prisma.adminUser.findFirst();
    results.tests.push({ 
      name: 'Find User', 
      status: user ? 'OK' : 'NO_USER', 
      userId: user?.id,
      email: user?.email 
    });
  } catch (e: any) {
    results.tests.push({ name: 'Find User', status: 'FAIL', error: e.message });
  }

  // Test 3: Create session
  try {
    const testUser = await prisma.adminUser.findFirst();
    if (testUser) {
      const testSessionId = 'test_' + crypto.randomBytes(16).toString('hex');
      await prisma.adminSession.create({
        data: {
          id: crypto.randomUUID(),
          sessionId: testSessionId,
          userId: testUser.id,
          expiresAt: new Date(Date.now() + 60000), // 1 minute
        },
      });
      // Clean up
      await prisma.adminSession.delete({ where: { sessionId: testSessionId } });
      results.tests.push({ name: 'Create Session', status: 'OK' });
    } else {
      results.tests.push({ name: 'Create Session', status: 'SKIP', reason: 'No user found' });
    }
  } catch (e: any) {
    results.tests.push({ name: 'Create Session', status: 'FAIL', error: e.message, code: e.code });
  }

  return NextResponse.json(results);
}
