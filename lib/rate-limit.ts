// Simple in-memory sliding-window rate limiter for API routes.
// Keyed by caller identity (uid or IP). Per-key counters live in a Map that
// is pruned opportunistically — good enough for a single-node deployment.

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 10_000

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfterSec: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k)
    }
  }

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfterSec: Math.ceil(windowMs / 1000) }
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  return { ok: true, remaining: limit - existing.count, retryAfterSec: Math.ceil(windowMs / 1000) }
}

// Best-effort caller key: uid from a verified identity, else client IP.
export function clientKeyFromReq(req: Request, uid?: string): string {
  if (uid) return `uid:${uid}`
  const fwd = req.headers.get("x-forwarded-for") ?? ""
  const ip = fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
  return `ip:${ip}`
}
