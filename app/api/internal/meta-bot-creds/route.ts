/**
 * GET /api/internal/meta-bot-creds
 *
 * Returns the active Meta Business app credentials (decrypted) for use by
 * Pega Engine to verify webhooks, refresh tokens, and call Graph API on
 * behalf of users.
 *
 * Auth: x-pega-engine-token header must match PEGA_ENGINE_TOKEN env.
 */
import { NextResponse } from "next/server";
import { getDecryptedCredentials } from "@/lib/integration-vault";

function authOk(req: Request) {
  const token = req.headers.get("x-pega-engine-token") || "";
  const expected = process.env.PEGA_ENGINE_TOKEN || "";
  if (!expected) return false;
  return token === expected;
}

export async function GET(req: Request) {
  if (!authOk(req)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const creds = await getDecryptedCredentials("META_BUSINESS");
  if (!creds || !creds.enabled) {
    return NextResponse.json({ message: "Meta Business disabled" }, { status: 503 });
  }

  const appId = creds.publicFields?.appId;
  const appSecret = creds.secrets?.appSecret;
  if (!appId || !appSecret) {
    return NextResponse.json({ message: "Meta credentials belum lengkap" }, { status: 503 });
  }

  // Threads pakai App terpisah, ambil dari provider THREADS_BUSINESS.
  const threadsCreds = await getDecryptedCredentials("THREADS_BUSINESS");
  const threadsBlock = threadsCreds && threadsCreds.enabled
    ? {
        appId: threadsCreds.publicFields?.appId || null,
        appSecret: threadsCreds.secrets?.appSecret || null,
        redirectUri: threadsCreds.publicFields?.redirectUri || null,
      }
    : null;

  return NextResponse.json({
    appId,
    appSecret,
    businessId: creds.publicFields?.businessId || null,
    configId: creds.publicFields?.configId || null,
    redirectUri: creds.publicFields?.redirectUri || null,
    webhookVerifyToken: creds.publicFields?.webhookVerifyToken || null,
    threads: threadsBlock,
  });
}
