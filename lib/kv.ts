import { kv } from '@vercel/kv';

// Vercel KV client - automatically uses KV_REST_API_URL and KV_REST_API_TOKEN
// from environment variables when deployed to Vercel

// Session helper functions
export async function setSession(sessionId: string, data: any, expirationSeconds: number = 28800) {
  // 8 hours = 28800 seconds
  try {
    await kv.set(`admin:session:${sessionId}`, JSON.stringify(data), { ex: expirationSeconds });
    return true;
  } catch (error) {
    console.error('KV setSession error:', error);
    return false;
  }
}

export async function getSession(sessionId: string): Promise<any | null> {
  try {
    const data = await kv.get<string>(`admin:session:${sessionId}`);
    if (data) {
      return typeof data === 'string' ? JSON.parse(data) : data;
    }
    return null;
  } catch (error) {
    console.error('KV getSession error:', error);
    return null;
  }
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    await kv.del(`admin:session:${sessionId}`);
    return true;
  } catch (error) {
    console.error('KV deleteSession error:', error);
    return false;
  }
}

export { kv };
