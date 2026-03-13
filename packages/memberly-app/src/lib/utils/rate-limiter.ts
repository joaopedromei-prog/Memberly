/**
 * In-memory rate limiter (Story 8.10)
 * No external dependencies — uses Map with TTL
 */
export class RateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();
  private checkCount = 0;

  constructor(
    private maxRequests = 30,
    private windowMs = 60_000
  ) {}

  check(key: string): { allowed: boolean; retryAfter?: number } {
    this.checkCount++;
    if (this.checkCount % 100 === 0) this.cleanup();

    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true };
    }

    if (entry.count < this.maxRequests) {
      entry.count++;
      return { allowed: true };
    }

    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.resetAt) this.store.delete(key);
    }
  }
}

// Singleton for webhook rate limiting: 30 req/min per IP
export const webhookLimiter = new RateLimiter(30, 60_000);
