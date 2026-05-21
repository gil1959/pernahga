/**
 * Request helpers — extract client IP and run IP ban / dedup checks.
 *
 * Headers checked in order (Vercel + Cloudflare + plain):
 *   - x-real-ip
 *   - x-forwarded-for (first hop)
 *   - cf-connecting-ip
 */
import { prisma } from "@/lib/prisma";

export function getClientIp(headers: Headers): string | null {
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return null;
}

/**
 * Returns true if `ip` is allowed to register (no prior registration OR
 * whitelisted by admin).
 */
export async function ipAllowedForRegistration(ip: string | null): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  if (!ip) {
    // Cannot determine IP — allow but log a warning. (Better than blocking
    // legitimate users behind misconfigured proxies.)
    return { allowed: true };
  }
  const row = await prisma.registeredIp.findUnique({ where: { ip } });
  if (!row) return { allowed: true };
  if (row.isWhitelist) return { allowed: true };
  return {
    allowed: false,
    reason:
      "Alamat IP Anda sudah terdaftar. Hanya 1 akun per perangkat/jaringan. Silakan login atau hubungi admin jika ini kesalahan.",
  };
}

/**
 * Persist IP claim post-successful registration.
 */
export async function recordRegisteredIp(ip: string | null, userId: string): Promise<void> {
  if (!ip) return;
  await prisma.registeredIp.upsert({
    where: { ip },
    update: { userId },
    create: { ip, userId },
  });
}
