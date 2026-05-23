/**
 * POST /api/user/connect/whatsapp/start
 *   → Create Evolution API instance for current user, returns QR code.
 *
 * GET  /api/user/connect/whatsapp/status?instanceName=...
 *   → Poll connection status (CONNECTING|OPEN|CLOSE).
 *
 * Uses admin-saved Evolution credentials from IntegrationCredential.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadActiveCreds, saveUserConnection, requireCapability, IntegrationDisabledError } from "@/lib/connect-helpers";
import { prisma } from "@/lib/prisma";

function instanceNameFor(userId: string) {
  // Stable per-user instance name. Evolution API uses this as the routing key.
  return `pernahga_${userId.slice(0, 16)}`;
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  try {
    await requireCapability(userId, "WHATSAPP");
    const creds = await loadActiveCreds("WHATSAPP_EVOLUTION");
    const baseUrl = creds.publicFields.baseUrl?.replace(/\/+$/, "");
    const apiKey = creds.secrets.apiKey;
    const webhookUrl = creds.publicFields.webhookUrl;
    if (!baseUrl || !apiKey) throw new Error("Evolution API belum diconfig oleh admin");

    const instanceName = instanceNameFor(userId);

    // Create instance (idempotent — Evolution returns existing if already created)
    const createRes = await fetch(`${baseUrl}/instance/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: apiKey },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        webhook: webhookUrl ? {
          url: webhookUrl,
          events: ["QRCODE_UPDATED", "CONNECTION_UPDATE", "MESSAGES_UPSERT"],
        } : undefined,
      }),
    });
    let createData = await createRes.json();

    if (!createRes.ok && createData?.response?.message?.[0]?.includes("already")) {
      // Try connect endpoint to fetch fresh QR.
      const conn = await fetch(`${baseUrl}/instance/connect/${instanceName}`, {
        headers: { apikey: apiKey },
      });
      createData = await conn.json();
    } else if (!createRes.ok) {
      throw new Error(`Evolution API: ${JSON.stringify(createData).slice(0, 200)}`);
    }

    // Save initial connection row (REQUESTED until QR scanned).
    await saveUserConnection({
      userId,
      channel: "WHATSAPP",
      provider: "WHATSAPP_EVOLUTION",
      externalId: instanceName,
      label: "WhatsApp (scan QR)",
      status: "REQUESTED",
      publicData: { instanceName },
    });

    const qrCode = createData?.qrcode?.base64 || createData?.qrcode?.code || createData?.base64;
    return NextResponse.json({
      ok: true,
      instanceName,
      qrCode, // data URL or base64 string
      pairingCode: createData?.qrcode?.pairingCode || null,
      expiresIn: 60, // seconds; client should refresh after this
    });
  } catch (err: unknown) {
    if (err instanceof IntegrationDisabledError) {
      return NextResponse.json(
        { message: "WhatsApp belum diaktifkan oleh admin. Tunggu admin enable." },
        { status: 503 }
      );
    }
    const status = (err as { status?: number })?.status || 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : "Gagal" }, { status });
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const url = new URL(req.url);
  const instanceName = url.searchParams.get("instanceName") || instanceNameFor(userId);

  try {
    const creds = await loadActiveCreds("WHATSAPP_EVOLUTION");
    const baseUrl = creds.publicFields.baseUrl?.replace(/\/+$/, "");
    const apiKey = creds.secrets.apiKey;

    const res = await fetch(`${baseUrl}/instance/connectionState/${instanceName}`, {
      headers: { apikey: apiKey },
    });
    const data = await res.json();
    const state = data?.instance?.state || data?.state || "unknown";

    // Auto-promote to ACTIVE when state=open
    if (state === "open") {
      await prisma.userConnection.updateMany({
        where: { userId, channel: "WHATSAPP", externalId: instanceName },
        data: { status: "ACTIVE", lastEventAt: new Date() },
      });
    }

    return NextResponse.json({ ok: true, state });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Gagal" }, { status: 500 });
  }
}
