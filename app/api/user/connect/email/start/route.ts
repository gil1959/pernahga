/**
 * GET /api/user/connect/email/start
 *   → Redirect user to Google OAuth consent (Gmail send/modify scope).
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadActiveCreds, requireCapability, IntegrationDisabledError } from "@/lib/connect-helpers";
import crypto from "node:crypto";

const STATE_COOKIE = "google_oauth_state";
const HOME_URL = process.env.NEXTAUTH_URL || "https://pernahga.com";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  try {
    await requireCapability(userId, "EMAIL");
    const creds = await loadActiveCreds("GOOGLE_OAUTH");
    const clientId = creds.publicFields.clientId;
    const redirectUri = creds.publicFields.redirectUri;
    if (!clientId || !redirectUri) throw new Error("Google OAuth belum diconfig oleh admin");

    const state = crypto.randomBytes(16).toString("hex");
    const scope = [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.readonly",
      "openid",
      "email",
      "profile",
    ].join(" ");
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope,
      access_type: "offline",
      prompt: "consent",
      state,
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

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
    if (err instanceof IntegrationDisabledError) {
      return NextResponse.redirect(`${HOME_URL}/dashboard?error=email_disabled`);
    }
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=email&msg=${encodeURIComponent(err instanceof Error ? err.message : "Gagal")}`);
  }
}
