/**
 * GET  /api/user/connect/discord/start
 *   → Redirect user to Discord OAuth (bot + applications.commands scope).
 *   → State cookie prevents CSRF, encodes userId.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadActiveCreds, requireCapability, IntegrationDisabledError } from "@/lib/connect-helpers";
import crypto from "node:crypto";

const STATE_COOKIE = "discord_oauth_state";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  try {
    await requireCapability(userId, "DISCORD");
    const creds = await loadActiveCreds("DISCORD");
    const clientId = creds.publicFields.clientId;
    const redirectUri = creds.publicFields.redirectUri;
    if (!clientId || !redirectUri) throw new Error("Discord belum diconfig oleh admin");

    const state = crypto.randomBytes(16).toString("hex");
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "bot applications.commands identify",
      permissions: "274877959168", // send msgs, read msgs, embed links
      state,
      prompt: "consent",
    });
    const authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;

    const res = NextResponse.redirect(authUrl);
    // Sign state with userId so callback can verify ownership.
    const stateCookie = JSON.stringify({ state, userId });
    res.cookies.set(STATE_COOKIE, stateCookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return res;
  } catch (err: unknown) {
    if (err instanceof IntegrationDisabledError) {
      return NextResponse.redirect(new URL("/dashboard?error=discord_disabled", process.env.NEXTAUTH_URL || "https://pernahga.com"));
    }
    return NextResponse.redirect(new URL(`/dashboard?error=discord&msg=${encodeURIComponent(err instanceof Error ? err.message : "Gagal")}`, process.env.NEXTAUTH_URL || "https://pernahga.com"));
  }
}
