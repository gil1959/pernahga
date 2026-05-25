/**
 * GET /api/internal/discord-bot-creds
 *
 * Returns the active Discord bot token (decrypted from admin vault) for use
 * by Pega Engine to spin up the Discord gateway client.
 *
 * Auth: x-pega-engine-token header must match PEGA_ENGINE_TOKEN env.
 *
 * Source: MEMORY.md "Multi-Channel Connect Strategy LOCKED v1.0".
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
  if (!authOk(req)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const creds = await getDecryptedCredentials("DISCORD");
  if (!creds || !creds.enabled) {
    return NextResponse.json({ message: "Discord disabled" }, { status: 503 });
  }
  const botToken = creds.secrets?.botToken;
  if (!botToken) {
    return NextResponse.json({ message: "Bot token not configured" }, { status: 503 });
  }

  return NextResponse.json({
    botToken,
    clientId: creds.publicFields?.clientId || null,
  });
}
