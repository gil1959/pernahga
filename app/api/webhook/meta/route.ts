/**
 * Meta webhook receiver — Instagram DM, comments, mentions.
 *
 * GET  /api/webhook/meta
 *   → Verification challenge dari Meta (hub.mode=subscribe).
 *   → Cek hub.verify_token vs env META_WEBHOOK_VERIFY_TOKEN.
 *   → Return hub.challenge as plain text.
 *
 * POST /api/webhook/meta
 *   → Event dari Meta (DM, comment, mention).
 *   → Verifikasi signature `X-Hub-Signature-256` pakai App Secret.
 *   → Forward fire-and-forget ke Pega Engine, lalu balas 200 dalam <5 detik.
 *
 * Source: MEMORY.md Multi-Channel Connect Strategy v1.0 + Meta App Review prep.
 * Docs: https://developers.facebook.com/docs/graph-api/webhooks
 */
import { NextResponse } from "next/server";
import { getDecryptedCredentials } from "@/lib/integration-vault";
import { verifyWebhookSignature } from "@/lib/meta-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET = verification handshake
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  // Read verify token from admin vault, NOT process.env.
  // Admin set it via /admin/integrations → META_BUSINESS → webhookVerifyToken.
  const creds = await getDecryptedCredentials("META_BUSINESS");
  const expected = creds?.publicFields?.webhookVerifyToken || "";
  if (!expected) {
    return NextResponse.json(
      { message: "Webhook verify token belum di-isi di /admin/integrations" },
      { status: 503 }
    );
  }
  if (mode === "subscribe" && token === expected && challenge) {
    // Meta requires plain text body, not JSON.
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

// POST = event delivery
export async function POST(req: Request) {
  // Read raw body for signature verification (parsed JSON breaks HMAC).
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  const creds = await getDecryptedCredentials("META_BUSINESS");
  const appSecret = creds?.secrets?.appSecret;

  if (!appSecret) {
    // Tetap balas 200 supaya Meta ga retry forever, tapi log warning.
    console.warn("[meta-webhook] App Secret tidak tersedia, skip verification");
  } else {
    const ok = verifyWebhookSignature({ rawBody, signature, appSecret });
    if (!ok) {
      console.warn("[meta-webhook] Signature mismatch", {
        receivedSig: signature?.slice(0, 16),
      });
      // Meta best practice: return 200 even on bad signature (avoid disable webhook).
      // Just don't process the payload.
      return new Response("ok", { status: 200 });
    }
  }

  // Parse payload
  let payload: unknown = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("ok", { status: 200 });
  }

  // Fire-and-forget dispatch ke Pega Engine.
  // Kalau gagal, JANGAN throw — Meta WAJIB dapet 200 dalam 5 detik atau
  // webhook bakal di-disable.
  const engineUrl = process.env.PEGA_ENGINE_URL || "http://localhost:18090";
  const engineToken = process.env.PEGA_ENGINE_TOKEN || "";
  if (engineToken) {
    // Jangan await — biar response 200 cepet ke Meta.
    fetch(`${engineUrl}/webhook/instagram`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pega-engine-token": engineToken,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
    }).catch((err) => {
      console.warn("[meta-webhook] Forward to Pega Engine gagal:", err?.message || err);
    });
  } else {
    console.info("[meta-webhook] Event diterima (engine token kosong, skip forward)", {
      object: (payload as { object?: string })?.object,
      entryCount: Array.isArray((payload as { entry?: unknown[] })?.entry)
        ? (payload as { entry: unknown[] }).entry.length
        : 0,
    });
  }

  // ACK Meta secepat mungkin.
  return new Response("ok", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
