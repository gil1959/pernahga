/**
 * WhatsApp webhook receiver — Evolution API.
 * Forward ke Pega Engine.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody = await req.text();

  let payload = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("ok", { status: 200 });
  }

  const engineUrl = process.env.PEGA_ENGINE_URL || "http://localhost:18090";
  const engineToken = process.env.PEGA_ENGINE_TOKEN || "";
  
  if (engineToken) {
    fetch(`${engineUrl}/webhook/whatsapp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pega-engine-token": engineToken,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
    }).catch((err) => {
      console.warn("[wa-webhook] Forward to Pega Engine gagal:", err?.message || err);
    });
  }

  return new Response("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
}
