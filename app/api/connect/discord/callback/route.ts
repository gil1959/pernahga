/**
 * GET /api/connect/discord/callback
 *   → Discord redirects here after user authorizes the bot.
 *   → Exchange code for token, fetch guild info, persist UserConnection.
 *   → URL must match what was registered in Discord Developer Portal:
 *     https://pernahga.com/api/connect/discord/callback
 */
import { NextResponse } from "next/server";
import { loadActiveCreds, saveUserConnection } from "@/lib/connect-helpers";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const STATE_COOKIE = "discord_oauth_state";
const HOME_URL = process.env.NEXTAUTH_URL || "https://pernahga.com";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const guildId = url.searchParams.get("guild_id");

  if (!code || !state) {
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=discord_missing_code`);
  }

  // Verify state cookie + extract userId
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(STATE_COOKIE)?.value;
  if (!stateCookie) {
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=discord_state_missing`);
  }
  let userId: string;
  try {
    const parsed = JSON.parse(stateCookie);
    if (parsed.state !== state) throw new Error("state mismatch");
    userId = parsed.userId;
  } catch {
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=discord_state_invalid`);
  }

  try {
    const creds = await loadActiveCreds("DISCORD");
    const clientId = creds.publicFields.clientId;
    const redirectUri = creds.publicFields.redirectUri;
    const clientSecret = creds.secrets.clientSecret;

    // Exchange code for token
    const tokenRes = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(tokenData.error_description || "Discord token exchange gagal");
    }

    // Fetch guild info if guild_id present
    let guildName = "Server Discord";
    if (guildId && creds.secrets.botToken) {
      const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
        headers: { Authorization: `Bot ${creds.secrets.botToken}` },
      });
      if (guildRes.ok) {
        const g = await guildRes.json();
        guildName = g.name;
      }
    }

    await saveUserConnection({
      userId,
      channel: "DISCORD",
      provider: "DISCORD",
      externalId: guildId || `oauth_${userId.slice(0, 8)}`,
      label: guildName,
      secrets: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
      },
      publicData: {
        guildId,
        guildName,
        scope: tokenData.scope,
      },
      status: "ACTIVE",
    });
    await prisma.userCapability.upsert({
      where: { userId_channel: { userId, channel: "DISCORD" } },
      update: { enabled: true },
      create: { userId, channel: "DISCORD", enabled: true, grantedByPlan: true },
    });

    const res = NextResponse.redirect(`${HOME_URL}/dashboard?connected=discord&guild=${encodeURIComponent(guildName)}`);
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (err: unknown) {
    return NextResponse.redirect(`${HOME_URL}/dashboard?error=discord&msg=${encodeURIComponent(err instanceof Error ? err.message : "Gagal")}`);
  }
}
