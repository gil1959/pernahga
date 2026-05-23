/**
 * POST /api/internal/charge-credits
 *   body: { userId, channel, taskType, costUsd, tokensIn, tokensOut, model }
 *
 * Pega Engine reports AI usage; we charge credits and append UsageLog.
 * Auth: x-pega-engine-token header.
 */
import { NextResponse } from "next/server";
import { chargeCredits, CreditError, type TaskType } from "@/lib/credit-engine";

function authOk(req: Request) {
  const token = req.headers.get("x-pega-engine-token") || "";
  return token && token === (process.env.PEGA_ENGINE_TOKEN || "");
}

export async function POST(req: Request) {
  if (!authOk(req)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const userId = String(body.userId || "");
  if (!userId) return NextResponse.json({ message: "userId required" }, { status: 400 });

  try {
    const result = await chargeCredits({
      userId,
      channel: String(body.channel || "whatsapp"),
      taskType: (body.taskType as TaskType) || "wa_reply",
      costUsd: Number(body.costUsd) || 0,
      tokensIn: Number(body.tokensIn) || undefined,
      tokensOut: Number(body.tokensOut) || undefined,
      model: body.model ? String(body.model) : undefined,
      meta: body.meta || undefined,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err: unknown) {
    if (err instanceof CreditError) {
      return NextResponse.json({ ok: false, code: err.code, message: err.message }, { status: 402 });
    }
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : "Gagal" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Quick health check
  if (!authOk(req)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
