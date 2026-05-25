/**
 * GET /api/connect/threads/start
 *   → Redirect user ke Threads OAuth.
 *   → Threads pakai app terpisah dari IG/FB Meta (graph.threads.net).
 *   → Credentials via env: META_THREADS_APP_ID + META_THREADS_APP_SECRET.
 *   → Redirect URI: https://www.pernahga.com/api/connect/threads/callback
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireCapability } from "@/lib/connect-helpers";
import crypto from "node:crypto";

const STATE_COOKIE = "threads_oauth_state";
const HOME_URL = process.env.NEXTAUTH_URL || "https://www.pernahga.com";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    await requireCapability(userId, "THREADS_POST");

    const appId = process.env.META_THREADS_APP_ID;
    const redirectUri =
      process.env.META_THREADS_REDIRECT_URI || `${HOME_URL}/api/connect/threads/callback`;
    if (!appId) {
      throw new Error("Threads belum diconfig (env META_THREADS_APP_ID)");
    }

    const state = crypto.randomBytes(16).toString("hex");
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "threads_basic,threads_content_publish",
      state,
    });
    const authUrl = `https://threads.net/oauth/authorize?${params.toString()}`;

    const res = NextResponse.redirect(authUrl);
    res.cookies.set(STATE_COOKIE, JSON.stringify({ state, userId }), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return res;
  } catch (err: unknown) {
    return NextResponse.redirect(
      `${HOME_URL}/dashboard?error=threads&msg=${encodeURIComponent(err instanceof Error ? err.message : "Gagal")}`
    );
  }
}
