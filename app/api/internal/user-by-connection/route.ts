/**
 * GET /api/internal/user-by-connection?channel=WHATSAPP&externalId=628xxx
 *
 * Used by Pega Engine to look up which Pernahga user owns an inbound WA chat.
 * Returns user workspace + subscription + connection info.
 *
 * Auth: x-pega-engine-token header must match PEGA_ENGINE_TOKEN env.
 *
 * Source: MEMORY.md "Multi-Channel Connect Strategy LOCKED v1.0".
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loadUserWorkspace, buildSystemPrompt, buildPersonalSystemPrompt } from "@/lib/workspace-virtual";
import type { CapabilityChannel } from "@prisma/client";

function authOk(req: Request) {
  const token = req.headers.get("x-pega-engine-token") || "";
  const expected = process.env.PEGA_ENGINE_TOKEN || "";
  if (!expected) return false;
  return token === expected;
}

export async function GET(req: Request) {
  try {
    if (!authOk(req)) {
      console.error("[user-by-connection] Auth failed. Token header mismatch.");
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    
    const url = new URL(req.url);
    const channel = url.searchParams.get("channel") as CapabilityChannel | null;
    const externalId = url.searchParams.get("externalId");
    const instanceName = url.searchParams.get("instanceName");

    if (!channel) {
      console.error("[user-by-connection] channel required. Query:", url.search);
      return NextResponse.json({ message: "channel required" }, { status: 400 });
    }

    const where: Record<string, unknown> = { channel, status: "ACTIVE" };
    if (instanceName) where.externalId = instanceName;
    else if (externalId) where.externalId = externalId;
    else {
      console.error("[user-by-connection] externalId or instanceName required. Query:", url.search);
      return NextResponse.json({ message: "externalId or instanceName required" }, { status: 400 });
    }

    const conn = await prisma.userConnection.findFirst({
      where: where as never,
      select: {
        id: true,
        userId: true,
        channel: true,
        provider: true,
        externalId: true,
        label: true,
        publicData: true,
      },
    });
    
    if (!conn) {
      console.error(`[user-by-connection] Not found for where:`, where);
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const ws = await loadUserWorkspace(conn.userId);
    if (!ws) {
      console.error(`[user-by-connection] Workspace not found for userId: ${conn.userId}`);
      return NextResponse.json({ message: "User workspace not found" }, { status: 404 });
    }

    const systemPrompt = buildSystemPrompt(ws);
    const sub = await prisma.subscription.findUnique({
      where: { userId: conn.userId },
      select: { creditsTotal: true, creditsUsed: true, status: true, packageId: true },
    });
    const personalPrompt = buildPersonalSystemPrompt(ws, sub?.packageId);

    return NextResponse.json({
      userId: conn.userId,
      connection: {
        id: conn.id,
        channel: conn.channel,
        provider: conn.provider,
        externalId: conn.externalId,
        label: conn.label,
        publicData: conn.publicData ? JSON.parse(conn.publicData) : null,
      },
      workspace: ws,
      systemPrompt,
      personalPrompt,
      subscription: sub,
    });
  } catch (err: any) {
    console.error("[user-by-connection] FATAL ERROR:", err?.message || err, err?.stack);
    return NextResponse.json({ message: "Internal Server Error", error: err?.message }, { status: 500 });
  }
}
