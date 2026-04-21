/**
 * In-memory sliding window rate limiter
 * 
 * Uses a Map to track request counts per IP.
 * For production, swap with Upstash Redis (@upstash/ratelimit).
 * 
 * Default: 60 requests per 60 seconds per IP.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store — persists per process instance
const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

interface RateLimitOptions {
  limit?: number     // Max requests in window
  windowMs?: number  // Window size in ms
}

interface RateLimitResult {
  success: boolean   // true = allowed
  limit: number
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  { limit = 60, windowMs = 60_000 }: RateLimitOptions = {}
): RateLimitResult {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt < now) {
    // Start a new window
    const entry: RateLimitEntry = { count: 1, resetAt: now + windowMs }
    store.set(key, entry)
    return { success: true, limit, remaining: limit - 1, resetAt: entry.resetAt }
  }

  existing.count++

  if (existing.count > limit) {
    return { success: false, limit, remaining: 0, resetAt: existing.resetAt }
  }

  return {
    success: true,
    limit,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  }
}

/**
 * Extract the real client IP from request headers
 * Supports Cloudflare (CF-Connecting-IP), Vercel (x-real-ip), and x-forwarded-for
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  )
}
