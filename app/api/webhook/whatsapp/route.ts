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
  const engineToken = process.env.PEGA_ENGINE_TOKEN || "5f7408d6baaec5a9e4a580be80f3f5ab38f6aead517926276c8d77762a650f6f";
  
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
