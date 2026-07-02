/**
 * POST /api/user/connect/whatsapp/start
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadActiveCreds, saveUserConnection, requireCapability, IntegrationDisabledError } from "@/lib/connect-helpers";
import { prisma } from "@/lib/prisma";

function instanceNameFor(userId: string) {
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

    // Force delete existing instance in case it is stuck
    try {
      await fetch(`${baseUrl}/instance/delete/${instanceName}`, { method: "DELETE", headers: { apikey: apiKey } });
    } catch(e) { }

    // Create instance (Evolution v1.8.7 will instantly return QR Base64)
    const createRes = await fetch(`${baseUrl}/instance/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: apiKey },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        webhook: webhookUrl ? webhookUrl : undefined,
        webhook_events: ["QRCODE_UPDATED", "CONNECTION_UPDATE", "MESSAGES_UPSERT"]
      }),
    });
    
    let createData;
    const rawCreateText = await createRes.text();
    try { createData = JSON.parse(rawCreateText); } 
    catch (e) { throw new Error(`Evolution API Error: Failed to parse JSON. ${rawCreateText.slice(0, 100)}`); }

    let qrBase64 = createData?.qrcode?.base64 || createData?.base64;
    let pairingCode = createData?.qrcode?.pairingCode || createData?.pairingCode;
    
    // Fallback just in case instance already created
    if (!qrBase64 && !createRes.ok && createData?.response?.message?.[0]?.includes("already exists")) {
      const connRes = await fetch(`${baseUrl}/instance/connect/${instanceName}`, { headers: { apikey: apiKey } });
      const connData = await connRes.json().catch(() => ({}));
      qrBase64 = connData?.base64 || connData?.qrcode?.base64;
      pairingCode = connData?.pairingCode || connData?.qrcode?.pairingCode;
    }

    if (!qrBase64) throw new Error("Gagal generate QR Code dari server Evolution API. Pastikan Baileys siap.");

    await saveUserConnection({
      userId,
      channel: "WHATSAPP",
      provider: "WHATSAPP_EVOLUTION",
      externalId: instanceName,
      label: "WhatsApp (scan QR)",
      status: "REQUESTED",
      publicData: { instanceName },
    });

    return NextResponse.json({
      ok: true,
      instanceName,
      qrCode: qrBase64,
      pairingCode: pairingCode || null,
      expiresIn: 60,
    });
  } catch (err: unknown) {
    if (err instanceof IntegrationDisabledError) return NextResponse.json({ message: "WhatsApp belum diaktifkan oleh admin." }, { status: 503 });
    return NextResponse.json({ message: err instanceof Error ? err.message : "Gagal" }, { status: 500 });
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

    const res = await fetch(`${baseUrl}/instance/connectionState/${instanceName}`, { headers: { apikey: apiKey } });
    let data;
    try { data = await res.json(); } catch (e) { throw new Error(`Evolution API Error: Failed to parse state JSON.`); }
    const state = data?.instance?.state || data?.state || "unknown";

    if (state === "open") {
      let ownerJid: string | null = null;
      try {
        const fetchInst = await fetch(`${baseUrl}/instance/fetchInstances?instanceName=${instanceName}`, { headers: { apikey: apiKey } });
        const arr = await fetchInst.json();
        const found = Array.isArray(arr) ? arr[0] : arr;
        ownerJid = found?.ownerJid || found?.instance?.owner || found?.instance?.ownerJid || null;
      } catch { }

      await prisma.$transaction([
        prisma.userConnection.updateMany({
          where: { userId, channel: "WHATSAPP", externalId: instanceName },
          data: { status: "ACTIVE", lastEventAt: new Date(), publicData: JSON.stringify({ instanceName, ownerJid }) },
        }),
        prisma.userCapability.upsert({
          where: { userId_channel: { userId, channel: "WHATSAPP" } },
          update: { enabled: true },
          create: { userId, channel: "WHATSAPP", enabled: true, grantedByPlan: true },
        }),
        prisma.userCapability.upsert({
          where: { userId_channel: { userId, channel: "PEGA_CHAT" } },
          update: { enabled: true, grantedByPlan: true },
          create: { userId, channel: "PEGA_CHAT", enabled: true, grantedByPlan: true },
        }),
      ]);
    }
    return NextResponse.json({ ok: true, state });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Gagal" }, { status: 500 });
  }
}
