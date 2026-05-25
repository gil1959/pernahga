/**
 * GET /api/connect/threads/callback
 *   → Threads redirects here after authorize.
 *   → Exchange code → short-lived → long-lived (60d) token.
 *   → Save UserConnection (channel: THREADS_POST).
 */
import { NextResponse } from "next/server";
import { saveUserConnection } from "@/lib/connect-helpers";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import {
  exchangeThreadsCode,
  getThreadsLongLivedToken,
  getThreadsUser,
} from "@/lib/meta-client";

const STATE_COOKIE = "threads_oauth_state";
const HOME_URL = process.env.NEXTAUTH_URL || "https://www.pernahga.com";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (errorParam) {
    return NextResponse.redirect(
      `${HOME_URL}/dashboard?error=threads&msg=${encodeURIComponent(errorDescription || errorParam)}`
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=threads_missing_code`);
  }

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(STATE_COOKIE)?.value;
  if (!stateCookie) {
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=threads_state_missing`);
  }
  let userId: string;
  try {
    const parsed = JSON.parse(stateCookie);
    if (parsed.state !== state) throw new Error("state mismatch");
    userId = parsed.userId;
  } catch {
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=threads_state_invalid`);
  }

  try {
    const appId = process.env.META_THREADS_APP_ID;
    const appSecret = process.env.META_THREADS_APP_SECRET;
    const redirectUri =
      process.env.META_THREADS_REDIRECT_URI || `${HOME_URL}/api/connect/threads/callback`;
    if (!appId || !appSecret) {
      throw new Error("Threads env credentials belum diset (META_THREADS_APP_ID / SECRET)");
    }

    // 1. Tukar code → short-lived
    const shortToken = await exchangeThreadsCode({ code, redirectUri, appId, appSecret });

    // 2. Tukar ke long-lived (60d)
    const longToken = await getThreadsLongLivedToken({
      shortToken: shortToken.accessToken,
      appSecret,
    });

    // 3. Ambil profile Threads
    const profile = await getThreadsUser({
      accessToken: longToken.accessToken,
      userId: shortToken.userId,
    });

    const expiresAt = longToken.expiresIn
      ? new Date(Date.now() + longToken.expiresIn * 1000).toISOString()
      : null;

    await saveUserConnection({
      userId,
      channel: "THREADS_POST",
      provider: "META_BUSINESS",
      externalId: profile.id,
      label: `@${profile.username}`,
      secrets: {
        accessToken: longToken.accessToken,
      },
      publicData: {
        threadsUserId: profile.id,
        username: profile.username,
        name: profile.name,
        tokenExpiresAt: expiresAt,
      },
      status: "ACTIVE",
    });

    await prisma.userCapability.upsert({
      where: { userId_channel: { userId, channel: "THREADS_POST" } },
      update: { enabled: true },
      create: { userId, channel: "THREADS_POST", enabled: true, grantedByPlan: true },
    });

    const res = NextResponse.redirect(
      `${HOME_URL}/dashboard?connected=threads&handle=${encodeURIComponent(profile.username)}`
    );
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (err: unknown) {
    return NextResponse.redirect(
      `${HOME_URL}/dashboard?error=threads&msg=${encodeURIComponent(err instanceof Error ? err.message : "Gagal")}`
    );
  }
}
