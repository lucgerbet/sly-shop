import { NextRequest } from "next/server";

// Best-effort, in-memory sliding-window limiter. On Vercel's serverless
// runtime each invocation may land on a cold or different instance, so this
// does NOT provide a real distributed guarantee — a determined attacker
// spreading requests across instances/regions won't be fully stopped by it.
// What it does reliably stop: a script hammering one route in a tight loop
// against a warm instance, which is the actual shape of the abuse these
// unauthenticated routes are exposed to (spamming Resend/Stripe/the CRM).
// For a hard guarantee, move this to a shared store (Upstash Redis + Vercel
// KV, or similar) — deliberately not added here since it needs a new
// external service/credentials this repo doesn't have configured.
const hits = new Map<string, number[]>();

export function isRateLimited(req: NextRequest, opts: { limit: number; windowMs: number }): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  const key = `${req.nextUrl.pathname}:${ip}`;
  const now = Date.now();
  const windowStart = now - opts.windowMs;

  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);
  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so this Map doesn't grow unbounded on a long-lived
  // warm instance — cheap enough to run on every call given the small size.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => t <= windowStart)) hits.delete(k);
    }
  }

  return recent.length > opts.limit;
}
