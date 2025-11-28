import { createClient } from 'redis';

const url = process.env.REDIS_URL || process.env.REDIS_TLS_URL || undefined;

// Reuse client in development to avoid multiple connections during HMR
declare global {
  // eslint-disable-next-line no-var
  var __redisClient: any;
}

let client: ReturnType<typeof createClient> | undefined = (global as any).__redisClient;
if (!client) {
  client = createClient({ url });
  client.on('error', (err) => console.error('Redis Client Error', err));
  // connect lazily
  client.connect().catch((e) => {
    console.error('Redis connect error:', e);
  });
  (global as any).__redisClient = client;
}

export default client;
