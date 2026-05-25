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

  return NextResponse.json({
    appId,
    appSecret,
    businessId: creds.publicFields?.businessId || null,
    configId: creds.publicFields?.configId || null,
    redirectUri: creds.publicFields?.redirectUri || null,
    webhookVerifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN || null,
    threads: {
      appId: process.env.META_THREADS_APP_ID || null,
      appSecret: process.env.META_THREADS_APP_SECRET || null,
      redirectUri: process.env.META_THREADS_REDIRECT_URI || null,
    },
  });
}
