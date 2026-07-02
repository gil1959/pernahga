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

  const engineUrl = "https://engine.pernahga.com";
  const engineToken = process.env.PEGA_ENGINE_TOKEN || "";
  
  console.log(`[wa-webhook] ENV CHECK: Token length=${engineToken.length}, startsWith=${engineToken.slice(0,4)}`);

  if (engineToken) {
    try {
      const resp = await fetch(`${engineUrl}/webhook/whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pega-engine-token": engineToken,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000),
      });
      const text = await resp.text();
      console.log(`[wa-webhook] Forward ke Pega Engine status: ${resp.status}, response: ${text}`);
    } catch (err: any) {
      console.error("[wa-webhook] Forward to Pega Engine gagal. Details:", err?.message || err, err?.cause);
    }
  } else {
    console.error("[wa-webhook] PEGA_ENGINE_TOKEN tidak diset di Vercel env");
  }

  return new Response("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
}
