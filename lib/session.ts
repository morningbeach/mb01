import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Session 有效期限：8 小時
const SESSION_EXPIRY_HOURS = 8;

// 生成唯一 ID
function generateId(): string {
  return crypto.randomUUID();
}

export async function createSession(userId: string, sessionId: string): Promise<boolean> {
  try {
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
    
    await prisma.adminSession.create({
      data: {
        id: generateId(),
        sessionId,
        userId,
        expiresAt,
      },
    });
    return true;
  } catch (error: any) {
    console.error('createSession error:', error?.message || error);
    console.error('Error code:', error?.code);
    console.error('Full error:', JSON.stringify(error, null, 2));
    return false;
  }
}

export async function getSession(sessionId: string): Promise<{ userId: string; createdAt: Date; role?: string } | null> {
  try {
    const session = await prisma.adminSession.findUnique({
      where: { sessionId },
      include: {
        AdminUser: {
          select: {
            role: true
          }
        }
      }
    });

    if (!session) {
      return null;
    }

    // 檢查是否過期
    if (session.expiresAt < new Date()) {
      // 刪除過期的 session
      await prisma.adminSession.delete({
        where: { sessionId },
      });
      return null;
    }

    return {
      userId: session.userId,
      createdAt: session.createdAt,
      role: session.AdminUser?.role,
    };
  } catch (error) {
    console.error('getSession error:', error);
    return null;
  }
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    await prisma.adminSession.delete({
      where: { sessionId },
    });
    return true;
  } catch (error) {
    console.error('deleteSession error:', error);
    return false;
  }
}

// 清理過期的 sessions（可定期執行）
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.adminSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  } catch (error) {
    console.error('cleanupExpiredSessions error:', error);
    return 0;
  }
}
