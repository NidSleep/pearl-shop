import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { getAdminClient } from "@/lib/supabase";

type CheckoutRateLimitResult =
  | { ok: true }
  | { ok: false; status: 429; retryAfterSeconds: number }
  | { ok: false; status: 503 };

/** Trust forwarding headers only on Vercel directly, or behind a trusted proxy. */
export function getClientIp(headers: Headers): string | null {
  const ip = (headers.get("x-forwarded-for")?.split(",")[0] ?? headers.get("x-real-ip"))?.trim();
  if (!ip || ip.length > 64 || ip.includes("%")) return null;

  const version = isIP(ip);
  if (version === 4) return ip;
  if (version !== 6) return null;

  const canonical = new URL(`http://[${ip}]/`).hostname.slice(1, -1);
  const mapped = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(canonical);
  if (!mapped) return canonical;

  const high = Number.parseInt(mapped[1], 16);
  const low = Number.parseInt(mapped[2], 16);
  return `${high >>> 8}.${high & 255}.${low >>> 8}.${low & 255}`;
}

function unavailable(reason: string): CheckoutRateLimitResult {
  // Never log upstream errors: they may contain identifiers or request details.
  console.error(`checkout rate limit: ${reason}`);
  return { ok: false, status: 503 };
}

export async function checkCheckoutRateLimit(request: Request): Promise<CheckoutRateLimitResult> {
  try {
    const secret = process.env.RATE_LIMIT_SECRET;
    if (!secret) return unavailable("missing secret");

    const ip = getClientIp(request.headers) ?? (process.env.NODE_ENV !== "production" ? "dev-local" : null);
    if (!ip) return unavailable("missing or invalid client IP");

    const key = createHmac("sha256", secret).update(ip).digest("hex");
    const signal = AbortSignal.timeout(3_000);
    const { data, error } = await getAdminClient()
      .rpc("check_checkout_rate_limit", { p_key: key })
      .abortSignal(signal);

    if (signal.aborted) return unavailable("timeout");
    if (error) return unavailable("RPC failed");

    // Validate the whole table response, including retry timing on allowed rows.
    if (!Array.isArray(data) || data.length !== 1) return unavailable("malformed result");
    const row: unknown = data[0];
    if (
      typeof row !== "object" || row === null ||
      !("allowed" in row) || typeof row.allowed !== "boolean" ||
      !("retry_after_seconds" in row) || typeof row.retry_after_seconds !== "number" ||
      !Number.isInteger(row.retry_after_seconds) || row.retry_after_seconds <= 0
    ) {
      return unavailable("malformed result");
    }

    if (row.allowed) return { ok: true };
    console.warn("checkout rate limit: limit exceeded");
    return { ok: false, status: 429, retryAfterSeconds: row.retry_after_seconds };
  } catch {
    return unavailable("unexpected failure");
  }
}
