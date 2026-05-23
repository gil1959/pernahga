/**
 * GET /api/user/connect/telegram/option1
 *   → Returns deep link to add the central Pega bot to user's chat/group.
 *   → Pre-creates a UserConnection row (status REQUESTED). Activated when
 *     bot receives /start in user's chat (webhook handler).
 *
 * POST /api/user/connect/telegram/option2
 *   → Body: { botToken } from user's own BotFather bot
 *   → Validates token, registers webhook, persists encrypted token.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadActiveCreds, saveUserConnection, requireCapability, IntegrationDisabledError } from "@/lib/connect-helpers";
import { encrypt } from "@/lib/crypto-vault";
import { prisma } from "@/lib/prisma";

const TELEGRAM_BOT_API = "https://api.telegram.org";

async function setBotWebhook(token: string, webhookUrl: string, secretToken: string) {
  const url = `${TELEGRAM_BOT_API}/bot${token}/setWebhook`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secretToken,
      allowed_updates: ["message", "callback_query", "my_chat_member"],
    }),
  });
  return res.json();
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const url = new URL(req.url);
  const variant = url.searchParams.get("variant") || "option1";

  try {
    await requireCapability(userId, "TELEGRAM");
    const creds = await loadActiveCreds("TELEGRAM_PEGA");
    const botUsername = creds.publicFields.botUsername;
    if (!botUsername) throw new Error("Bot Pega belum diconfig oleh admin");

    if (variant === "option1") {
      // Use unique start payload as identifier — bot extracts it from /start <payload>
      const startPayload = `u_${userId.slice(0, 12)}`;
      const startGroupUrl = `https://t.me/${botUsername}?startgroup=${startPayload}`;
      const startChatUrl = `https://t.me/${botUsername}?start=${startPayload}`;

      await saveUserConnection({
        userId,
        channel: "TELEGRAM",
        provider: "TELEGRAM_PEGA",
        externalId: startPayload,
        label: `@${botUsername} (Bot Pega)`,
        status: "REQUESTED",
        publicData: { variant: "option1", startPayload, botUsername },
      });

      return NextResponse.json({
        ok: true,
        startGroupUrl,
        startChatUrl,
        botUsername,
        startPayload,
      });
    }

    return NextResponse.json({ message: "Variant tidak dikenal" }, { status: 400 });
  } catch (err: unknown) {
    if (err instanceof IntegrationDisabledError) {
      return NextResponse.json(
        { message: "Telegram belum diaktifkan oleh admin." },
        { status: 503 }
      );
    }
    const status = (err as { status?: number })?.status || 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Gagal" }, { status });
  }
}

export async function POST(req: Request) {
  // Option 2: user paste their own BotFather token
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  try {
    await requireCapability(userId, "TELEGRAM");
    const body = await req.json();
    const token = String(body.botToken || "").trim();
    if (!token || !/^\d+:[\w-]+$/.test(token)) {
      return NextResponse.json({ message: "Format bot token tidak valid" }, { status: 400 });
    }

    // Validate via getMe
    const meRes = await fetch(`${TELEGRAM_BOT_API}/bot${token}/getMe`);
    const me = await meRes.json();
    if (!me.ok) {
      return NextResponse.json({ message: `Telegram: ${me.description}` }, { status: 400 });
    }
    const botInfo = me.result;

    // Register webhook to our own endpoint (per-user routed via secret)
    const secretToken = `u_${userId}_${Math.random().toString(36).slice(2, 10)}`;
    const webhookUrl = `${process.env.NEXTAUTH_URL || "https://pernahga.com"}/api/webhook/telegram`;
    const wh = await setBotWebhook(token, webhookUrl, secretToken);
    if (!wh.ok) {
      return NextResponse.json({ message: `Set webhook gagal: ${wh.description}` }, { status: 400 });
    }

    await saveUserConnection({
      userId,
      channel: "TELEGRAM",
      provider: "TELEGRAM_PEGA",
      externalId: String(botInfo.id),
      label: `@${botInfo.username} (Brand Anda)`,
      secrets: { botToken: token, webhookSecret: secretToken },
      publicData: {
        variant: "option2",
        botUsername: botInfo.username,
        botFirstName: botInfo.first_name,
      },
      status: "ACTIVE",
    });

    return NextResponse.json({
      ok: true,
      botUsername: botInfo.username,
      message: `Bot @${botInfo.username} aktif`,
    });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Gagal" }, { status: 500 });
  }
}
