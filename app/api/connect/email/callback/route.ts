/**
 * GET /api/connect/email/callback
 *   → Google redirects here after consent. Exchange code → access+refresh tokens,
 *     fetch user email, persist UserConnection.
 */
import { NextResponse } from "next/server";
import { loadActiveCreds, saveUserConnection } from "@/lib/connect-helpers";
import { cookies } from "next/headers";

const STATE_COOKIE = "google_oauth_state";
const HOME_URL = process.env.NEXTAUTH_URL || "https://pernahga.com";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=email_missing_code`);
  }

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(STATE_COOKIE)?.value;
  if (!stateCookie) {
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=email_state_missing`);
  }
  let userId: string;
  try {
    const parsed = JSON.parse(stateCookie);
    if (parsed.state !== state) throw new Error("state mismatch");
    userId = parsed.userId;
  } catch {
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=email_state_invalid`);
  }

  try {
    const creds = await loadActiveCreds("GOOGLE_OAUTH");
    const clientId = creds.publicFields.clientId;
    const redirectUri = creds.publicFields.redirectUri;
    const clientSecret = creds.secrets.clientSecret;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(tokenData.error_description || "Token exchange gagal");
    }

    // Fetch user email via userinfo
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userinfo = await userinfoRes.json();

    await saveUserConnection({
      userId,
      channel: "EMAIL",
      provider: "GOOGLE_OAUTH",
      externalId: userinfo.email || userinfo.sub,
      label: userinfo.email,
      secrets: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || "",
      },
      publicData: {
        email: userinfo.email,
        name: userinfo.name,
        picture: userinfo.picture,
        scope: tokenData.scope,
        expiresIn: tokenData.expires_in,
      },
      status: "ACTIVE",
    });

    const res = NextResponse.redirect(`${HOME_URL}/dashboard?connected=email&account=${encodeURIComponent(userinfo.email)}`);
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (err: unknown) {
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=email&msg=${encodeURIComponent(err instanceof Error ? err.message : "Gagal")}`);
  }
}
