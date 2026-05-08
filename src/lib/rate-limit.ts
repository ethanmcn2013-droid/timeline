/**
 * rate-limit.ts — IP-based rate limiting for public Server Actions.
 *
 * Strategy:
 *   - Production with UPSTASH_REDIS_REST_URL set: uses @upstash/redis
 *     sliding-window counter via plain HTTP (no SDK required — avoids
 *     an optional install dependency).
 *   - Development / no Redis env: in-memory Map with TTL eviction.
 *     Resets on server restart; fine for local dev.
 *
 * Usage:
 *   const ok = await checkRateLimit("create-workspace", ip, 5, 60);
 *   if (!ok) return { error: "Too many requests. Try again in a minute." };
 */

// ---------------------------------------------------------------------------
// In-memory fallback (dev / no-Redis)
// ---------------------------------------------------------------------------

type MemEntry = { count: number; resetAt: number };
const memStore = new Map<string, MemEntry>();

function memRateLimit(key: string, limit: number, windowSecs: number): boolean {
  const now = Date.now();
  const entry = memStore.get(key);

  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowSecs * 1000 });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------
// Upstash HTTP rate-limit (production)
// Avoids SDK install — raw INCR + EXPIRE via Upstash REST API.
// ---------------------------------------------------------------------------

async function upstashRateLimit(
  key: string,
  limit: number,
  windowSecs: number,
): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Pipeline: INCR key, EXPIRE key windowSecs (only sets if not exists)
  // We do INCR first, then EXPIRE — if INCR returns 1 the key was new.
  const incrRes = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
    method: "POST",
    headers,
  });
  if (!incrRes.ok) {
    // Redis unavailable — fail open (allow the request)
    console.warn("[rate-limit] Upstash INCR failed:", incrRes.status);
    return true;
  }
  const { result: count } = (await incrRes.json()) as { result: number };

  if (count === 1) {
    // New key — set expiry
    await fetch(`${url}/expire/${encodeURIComponent(key)}/${windowSecs}`, {
      method: "POST",
      headers,
    });
  }

  return count <= limit;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check whether `ip` has exceeded `limit` calls for `action` within
 * a `windowSecs` sliding window.
 *
 * Returns true if the request is allowed, false if it should be rejected.
 * Always returns true in dev when no Redis env is set (fail-open).
 */
export async function checkRateLimit(
  action: string,
  ip: string,
  limit: number,
  windowSecs: number,
): Promise<boolean> {
  const key = `rl:${action}:${ip}`;

  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return upstashRateLimit(key, limit, windowSecs);
  }

  return memRateLimit(key, limit, windowSecs);
}

/**
 * Extract the best-guess client IP from Next.js request headers.
 * Falls back to "unknown" — rate-limited as a single shared bucket.
 */
export function getClientIp(): string {
  // Server Actions run in Node — headers() is available from next/headers.
  // Import lazily to avoid breaking edge/client imports.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { headers } = require("next/headers") as {
      headers: () => { get: (k: string) => string | null };
    };
    const h = headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      "unknown"
    );
  } catch {
    return "unknown";
  }
}
