/**
 * POST /api/internal/tg-bind
 *   body: { payload: "u_xxxx", chatId: "12345", telegramUser: {first_name, username, ...} }
 *
 * Called by Pega Engine when user clicks /start <payload> on @PegaAssistantBot.
 * Promotes the REQUESTED UserConnection (created when user clicked Connect)
 * into ACTIVE with real chat_id as externalId.
 *
 * Auth: x-pega-engine-token shared secret.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function authOk(req: Request) {
  const token = req.headers.get("x-pega-engine-token") || "";
  return token && token === (process.env.PEGA_ENGINE_TOKEN || "");
}

export async function POST(req: Request) {
  if (!authOk(req)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const payload = String(body.payload || "");
  const chatId = String(body.chatId || "");
  const tgUser = body.telegramUser || {};
  if (!payload || !chatId) return NextResponse.json({ ok: false, message: "payload+chatId required" }, { status: 400 });

  // Payload format set by /api/user/connect/telegram (variant=option1):
  //   "u_<userId-prefix-12chars>"
  // We stored the original UserConnection row with externalId === payload, status=REQUESTED.
  const pending = await prisma.userConnection.findFirst({
    where: { channel: "TELEGRAM", externalId: payload, status: "REQUESTED" },
    orderBy: { createdAt: "desc" },
  });
  if (!pending) return NextResponse.json({ ok: false, message: "No pending bind for payload" }, { status: 404 });

  const label = tgUser.username
    ? `@${tgUser.username}`
    : (tgUser.first_name || "Telegram user");

  await prisma.$transaction([
    prisma.userConnection.update({
      where: { id: pending.id },
      data: {
        status: "ACTIVE",
        externalId: chatId, // replace payload with real chat_id (used for inbound lookup)
        label,
        publicData: JSON.stringify({
          variant: "option1",
          chatId,
          tgUserId: tgUser.id,
          tgUsername: tgUser.username || null,
          tgFirstName: tgUser.first_name || null,
        }),
        lastEventAt: new Date(),
      },
    }),
    prisma.userCapability.upsert({
      where: { userId_channel: { userId: pending.userId, channel: "TELEGRAM" } },
      update: { enabled: true, grantedByPlan: true },
      create: { userId: pending.userId, channel: "TELEGRAM", enabled: true, grantedByPlan: true },
    }),
    prisma.userCapability.upsert({
      where: { userId_channel: { userId: pending.userId, channel: "PEGA_CHAT" } },
      update: { enabled: true, grantedByPlan: true },
      create: { userId: pending.userId, channel: "PEGA_CHAT", enabled: true, grantedByPlan: true },
    }),
  ]);

  return NextResponse.json({ ok: true, userId: pending.userId, chatId });
}
