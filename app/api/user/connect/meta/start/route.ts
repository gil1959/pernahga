/**
 * GET  /api/user/connect/meta/start
 *   → Redirect user ke Facebook OAuth (IG Business + FB Page + Messaging).
 *   → State cookie nyimpen userId, prevent CSRF.
 *
 * Optional query: ?features=dm,post  → granular scope.
 *   - dm   = instagram_business_manage_messages
 *   - post = instagram_business_content_publish + pages_manage_posts
 *   - default: keduanya
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadActiveCreds, requireCapability, IntegrationDisabledError } from "@/lib/connect-helpers";
import crypto from "node:crypto";

const STATE_COOKIE = "meta_oauth_state";
const HOME_URL = process.env.NEXTAUTH_URL || "https://www.pernahga.com";

const BASE_SCOPES = [
  "instagram_business_basic",
  "pages_show_list",
  "pages_read_engagement",
];
const DM_SCOPES = ["instagram_business_manage_messages"];
const POST_SCOPES = [
  "instagram_business_content_publish",
  "pages_manage_posts",
];

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Minimal Starter tier — IG_DM ada di Starter+, IG_POST/FB_POST di Pro+.
    // Cek INSTAGRAM_DM dulu (paling longgar). Kalau user ga punya, throw.
    await requireCapability(userId, "INSTAGRAM_DM");

    const creds = await loadActiveCreds("META_BUSINESS");
    const appId = creds.publicFields.appId;
    const redirectUri = creds.publicFields.redirectUri;
    if (!appId || !redirectUri) {
      throw new Error("Meta Business belum diconfig oleh admin");
    }

    // Pilih scope berdasarkan ?features
    const url = new URL(req.url);
    const features = (url.searchParams.get("features") || "dm,post")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const scopes = new Set<string>(BASE_SCOPES);
    if (features.includes("dm")) DM_SCOPES.forEach((s) => scopes.add(s));
    if (features.includes("post")) POST_SCOPES.forEach((s) => scopes.add(s));

    const state = crypto.randomBytes(16).toString("hex");
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: Array.from(scopes).join(","),
      state,
    });
    // Pakai www.facebook.com (canonical) — dialog/oauth endpoint.
    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;

    const res = NextResponse.redirect(authUrl);
    res.cookies.set(STATE_COOKIE, JSON.stringify({ state, userId, features }), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return res;
  } catch (err: unknown) {
    if (err instanceof IntegrationDisabledError) {
      return NextResponse.redirect(`${HOME_URL}/dashboard?error=meta_disabled`);
    }
    return NextResponse.redirect(
      `${HOME_URL}/dashboard?error=meta&msg=${encodeURIComponent(err instanceof Error ? err.message : "Gagal")}`
    );
  }
}
