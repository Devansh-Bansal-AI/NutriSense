// Simple in-memory rate limiter for Next.js API Routes (Serverless)
// Note: In a real production app deployed to Vercel/Edge, a distributed store like Redis (Upstash) is required.

type TokenBucket = {
  tokens: number;
  lastRefill: number;
};

const store = new Map<string, TokenBucket>();

export function rateLimit(
  ip: string,
  limit: number = 30, // max requests
  windowMs: number = 60000 // per minute
): { success: boolean; limit: number; remaining: number } {
  const now = Date.now();
  const bucket = store.get(ip) || { tokens: limit, lastRefill: now };

  // Refill tokens
  const timePassed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(timePassed / (windowMs / limit));
  
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(limit, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    store.set(ip, bucket);
    return { success: true, limit, remaining: bucket.tokens };
  }

  return { success: false, limit, remaining: 0 };
}
