/**
 * GET /api/connect/meta/callback
 *   → Facebook redirects here after user authorizes.
 *   → Exchange code → short-lived → long-lived (60 days) token.
 *   → Fetch /me/accounts → enumerate FB Pages + IG Business accounts.
 *   → Persist UserConnection per (channel × page):
 *       INSTAGRAM_DM   (if IG biz account exists)
 *       INSTAGRAM_POST (if IG biz account exists)
 *       FACEBOOK_POST  (every Page)
 *   → Auto-enable corresponding capabilities.
 *   → URL must match Meta App OAuth redirect URI:
 *     https://www.pernahga.com/api/connect/meta/callback
 */
import { NextResponse } from "next/server";
import { loadActiveCreds, saveUserConnection } from "@/lib/connect-helpers";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getUserPages,
  type MetaPage,
} from "@/lib/meta-client";
import type { CapabilityChannel } from "@prisma/client";

const STATE_COOKIE = "meta_oauth_state";
const HOME_URL = process.env.NEXTAUTH_URL || "https://www.pernahga.com";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");
  const errorReason = url.searchParams.get("error_reason");
  const errorDescription = url.searchParams.get("error_description");

  if (errorParam) {
    return NextResponse.redirect(
      `${HOME_URL}/dashboard?error=meta&msg=${encodeURIComponent(errorDescription || errorReason || errorParam)}`
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=meta_missing_code`);
  }

  // Verify state cookie
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(STATE_COOKIE)?.value;
  if (!stateCookie) {
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=meta_state_missing`);
  }
  let userId: string;
  let features: string[];
  try {
    const parsed = JSON.parse(stateCookie);
    if (parsed.state !== state) throw new Error("state mismatch");
    userId = parsed.userId;
    features = Array.isArray(parsed.features) ? parsed.features : ["dm", "post"];
  } catch {
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=meta_state_invalid`);
  }

  try {
    const creds = await loadActiveCreds("META_BUSINESS");
    const appId = creds.publicFields.appId;
    const redirectUri = creds.publicFields.redirectUri;
    const appSecret = creds.secrets.appSecret;
    if (!appId || !appSecret || !redirectUri) {
      throw new Error("Meta App credentials belum lengkap");
    }

    // 1. Exchange code → short-lived
    const shortToken = await exchangeCodeForToken({ code, redirectUri, appId, appSecret });

    // 2. Convert ke long-lived (~60 hari)
    const longToken = await getLongLivedToken({
      shortToken: shortToken.accessToken,
      appId,
      appSecret,
    });

    // 3. Ambil daftar Pages + IG Business account
    const pages = await getUserPages({ accessToken: longToken.accessToken });
    if (pages.length === 0) {
      return NextResponse.redirect(
        `${HOME_URL}/dashboard?error=meta&msg=${encodeURIComponent(
          "Akun kamu belum admin di FB Page mana pun. Bikin/atur FB Page dulu, lalu coba connect lagi."
        )}`
      );
    }

    // 4. Save connections per page × channel
    const wantDM = features.includes("dm");
    const wantPost = features.includes("post");
    const expiresAt = longToken.expiresIn
      ? new Date(Date.now() + longToken.expiresIn * 1000).toISOString()
      : null;
    let igAccountsCount = 0;

    for (const page of pages) {
      // FB Page (FACEBOOK_POST) — selalu disimpan kalau wantPost
      if (wantPost) {
        await saveUserConnection({
          userId,
          channel: "FACEBOOK_POST",
          provider: "META_BUSINESS",
          externalId: page.id,
          label: page.name,
          secrets: {
            pageAccessToken: page.accessToken,
            userAccessToken: longToken.accessToken,
          },
          publicData: {
            pageId: page.id,
            pageName: page.name,
            category: page.category,
            tokenExpiresAt: expiresAt,
            scope: shortToken.tokenType,
          },
          status: "ACTIVE",
        });
      }

      // IG Business account — kalau ada, simpan IG_DM dan/atau IG_POST
      if (page.instagramBusinessAccount) {
        igAccountsCount++;
        const ig = page.instagramBusinessAccount;
        const channels: CapabilityChannel[] = [];
        if (wantDM) channels.push("INSTAGRAM_DM");
        if (wantPost) channels.push("INSTAGRAM_POST");

        for (const channel of channels) {
          await saveUserConnection({
            userId,
            channel,
            provider: "META_BUSINESS",
            externalId: ig.id,
            label: `@${ig.username}`,
            secrets: {
              pageAccessToken: page.accessToken,
              userAccessToken: longToken.accessToken,
            },
            publicData: {
              igUserId: ig.id,
              igUsername: ig.username,
              igName: ig.name,
              profilePictureUrl: ig.profilePictureUrl,
              pageId: page.id,
              pageName: page.name,
              tokenExpiresAt: expiresAt,
            },
            status: "ACTIVE",
          });
        }
      }
    }

    // 5. Auto-enable capabilities
    const capsToEnable: CapabilityChannel[] = [];
    if (wantDM && igAccountsCount > 0) capsToEnable.push("INSTAGRAM_DM");
    if (wantPost && igAccountsCount > 0) capsToEnable.push("INSTAGRAM_POST");
    if (wantPost) capsToEnable.push("FACEBOOK_POST");

    for (const channel of capsToEnable) {
      await prisma.userCapability.upsert({
        where: { userId_channel: { userId, channel } },
        update: { enabled: true },
        create: { userId, channel, enabled: true, grantedByPlan: true },
      });
    }

    const igListLabel = pages
      .filter((p: MetaPage) => p.instagramBusinessAccount)
      .map((p) => p.instagramBusinessAccount?.username)
      .filter(Boolean)
      .join(",");

    const res = NextResponse.redirect(
      `${HOME_URL}/dashboard?connected=meta&pages=${pages.length}&ig=${encodeURIComponent(igListLabel)}`
    );
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (err: unknown) {
    return NextResponse.redirect(
      `${HOME_URL}/dashboard?error=meta&msg=${encodeURIComponent(err instanceof Error ? err.message : "Gagal")}`
    );
  }
}
