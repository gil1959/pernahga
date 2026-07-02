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
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    await requireCapability(userId, "WHATSAPP");
    const creds = await loadActiveCreds("WHATSAPP_EVOLUTION");
    const baseUrl = creds.publicFields.baseUrl?.replace(/\/+$/, "");
    const apiKey = creds.secrets.apiKey;
    const webhookUrl = creds.publicFields.webhookUrl;
    
    if (!baseUrl || !apiKey) {
      throw new Error("Evolution API belum diconfig oleh admin");
    }

    const instanceName = instanceNameFor(userId);

    // Force delete existing instance in case it is stuck
    try {
      await fetch(`${baseUrl}/instance/delete/${instanceName}`, {
        method: "DELETE",
        headers: { apikey: apiKey },
      });
      await fetch(`${baseUrl}/instance/logout/${instanceName}`, {
        method: "DELETE",
        headers: { apikey: apiKey },
      });
    } catch(e: any) { }

    // Create instance
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
    
    let createData;
    const rawCreateText = await createRes.text();
    try {
      createData = JSON.parse(rawCreateText);
    } catch (e) {
      throw new Error(`Evolution API Error: Failed to parse JSON (Status ${createRes.status}). ${rawCreateText.slice(0, 100)}`);
    }

    let qrBase64 = createData?.qrcode?.base64 || createData?.base64;
    let pairingCode = createData?.qrcode?.pairingCode;
    
    // In Evolution API v2, QR is often not returned in /create. 
    // We must trigger /connect then poll /qr.
    if (!qrBase64 && !createData?.response?.message?.[0]?.includes("already")) {
      await new Promise(r => setTimeout(r, 2000));
      // Trigger connect just in case
      await fetch(`${baseUrl}/instance/connect/${instanceName}`, {
        headers: { apikey: apiKey },
      });
      await new Promise(r => setTimeout(r, 1000));
      
      // Fetch QR explicitly
      const qrRes = await fetch(`${baseUrl}/instance/qr/${instanceName}`, {
        headers: { apikey: apiKey },
      });
      const qrData = await qrRes.json().catch(() => ({}));
      qrBase64 = qrData?.base64 || qrData?.qrcode?.base64 || qrBase64;
      pairingCode = qrData?.pairingCode || qrData?.qrcode?.pairingCode || pairingCode;
    }

    if (!createRes.ok && createData?.response?.message?.[0]?.includes("already")) {
      // Instance already exists
      const qrRes = await fetch(`${baseUrl}/instance/qr/${instanceName}`, {
        headers: { apikey: apiKey },
      });
      const qrData = await qrRes.json().catch(() => ({}));
      qrBase64 = qrData?.base64 || qrData?.qrcode?.base64;
      pairingCode = qrData?.pairingCode || qrData?.qrcode?.pairingCode;
    } else if (!createRes.ok) {
      throw new Error(`Evolution API: ${JSON.stringify(createData).slice(0, 200)}`);
    }

    if (!qrBase64) {
      throw new Error("Gagal generate QR Code dari server Evolution API.");
    }

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
    const rawStateText = await res.text();
    let data;
    try {
      data = JSON.parse(rawStateText);
    } catch (e) {
      throw new Error(`Evolution API Error: Failed to parse JSON on State (Status ${res.status}).`);
    }
    const state = data?.instance?.state || data?.state || "unknown";

    if (state === "open") {
      let ownerJid: string | null = null;
      try {
        const fetchInst = await fetch(`${baseUrl}/instance/fetchInstances?instanceName=${instanceName}`, {
          headers: { apikey: apiKey },
        });
        const arr = await fetchInst.json();
        const found = Array.isArray(arr) ? arr[0] : arr;
        ownerJid = found?.ownerJid || found?.instance?.owner || found?.instance?.ownerJid || null;
      } catch { }

      await prisma.$transaction([
        prisma.userConnection.updateMany({
          where: { userId, channel: "WHATSAPP", externalId: instanceName },
          data: {
            status: "ACTIVE",
            lastEventAt: new Date(),
            publicData: JSON.stringify({ instanceName, ownerJid }),
          },
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
