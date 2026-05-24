/**
 * POST /api/internal/connection-state
 *   body: {
 *     channel: "WHATSAPP" | "INSTAGRAM_DM" | "TELEGRAM" | ...,
 *     provider: "WHATSAPP_EVOLUTION" | ...,
 *     externalId: string,
 *     state: "open" | "close" | "connecting" | "removed" | ...
 *   }
 *
 * Called by Pega Engine when an upstream provider (Evolution API, Discord,
 * Telegram, etc.) reports a connection state change. We map the provider
 * state to UserConnection.status so the dashboard shows realtime AKTIF /
 * SIAP CONNECT / DISCONNECTED without requiring a manual refresh.
 *
 * Auth: x-pega-engine-token shared secret.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CapabilityChannel, ConnectionStatus } from "@prisma/client";

function authOk(req: Request) {
  const token = req.headers.get("x-pega-engine-token") || "";
  return token && token === (process.env.PEGA_ENGINE_TOKEN || "");
}

/**
 * Map upstream-provider state strings to internal UserConnectionStatus.
 * Anything unrecognized falls through to no-op (we leave the row alone).
 */
function mapState(state: string): {
  status: ConnectionStatus | null;
  capEnabled: boolean | null;
} {
  const s = state.toLowerCase();
  if (s === "open" || s === "active" || s === "connected") {
    return { status: "ACTIVE", capEnabled: true };
  }
  if (
    s === "close" ||
    s === "closed" ||
    s === "removed" ||
    s === "logged_out" ||
    s === "disconnected" ||
    s === "device_removed" ||
    s === "failed"
  ) {
    return { status: "REVOKED", capEnabled: false };
  }
  if (s === "connecting" || s === "qrcode" || s === "pending") {
    return { status: "REQUESTED", capEnabled: false };
  }
  return { status: null, capEnabled: null };
}

export async function POST(req: Request) {
  if (!authOk(req)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const channel = String(body.channel || "") as CapabilityChannel;
  const externalId = String(body.externalId || "");
  const state = String(body.state || "");

  if (!channel || !externalId || !state) {
    return NextResponse.json(
      { ok: false, message: "channel + externalId + state required" },
      { status: 400 }
    );
  }

  const conn = await prisma.userConnection.findFirst({
    where: { channel, externalId },
    orderBy: { createdAt: "desc" },
  });
  if (!conn) {
    return NextResponse.json({ ok: false, message: "no connection found" }, { status: 404 });
  }

  const mapped = mapState(state);
  if (!mapped.status) {
    return NextResponse.json({ ok: true, skipped: true, state });
  }

  await prisma.$transaction([
    prisma.userConnection.update({
      where: { id: conn.id },
      data: {
        status: mapped.status,
        lastEventAt: new Date(),
      },
    }),
    prisma.userCapability.upsert({
      where: { userId_channel: { userId: conn.userId, channel } },
      update:
        mapped.capEnabled !== null ? { enabled: mapped.capEnabled } : {},
      create: {
        userId: conn.userId,
        channel,
        enabled: mapped.capEnabled ?? false,
        grantedByPlan: false,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    userId: conn.userId,
    status: mapped.status,
  });
}
