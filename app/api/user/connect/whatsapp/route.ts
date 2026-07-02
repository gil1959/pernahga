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
    console.error("[WA Connect] Unauthorized request");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  console.log(`[WA Connect] Start connect for userId: ${userId}`);

  try {
    await requireCapability(userId, "WHATSAPP");
    const creds = await loadActiveCreds("WHATSAPP_EVOLUTION");
    const baseUrl = creds.publicFields.baseUrl?.replace(/\/+$/, "");
    const apiKey = creds.secrets.apiKey;
    const webhookUrl = creds.publicFields.webhookUrl;
    
    console.log(`[WA Connect] BaseURL: ${baseUrl}, WebhookURL: ${webhookUrl}, ApiKey exists: ${!!apiKey}`);

    if (!baseUrl || !apiKey) {
      console.error("[WA Connect] Configuration missing.");
      throw new Error("Evolution API belum diconfig oleh admin");
    }

    const instanceName = instanceNameFor(userId);
    console.log(`[WA Connect] Instance Name: ${instanceName}`);

    // Force delete existing instance in case it is stuck
    try {
      console.log(`[WA Connect] Calling DELETE /instance/delete/${instanceName}`);
      const delRes = await fetch(`${baseUrl}/instance/delete/${instanceName}`, {
        method: "DELETE",
        headers: { apikey: apiKey },
      });
      const delText = await delRes.text();
      console.log(`[WA Connect] Delete response: ${delRes.status} - ${delText}`);
      
      const logoutRes = await fetch(`${baseUrl}/instance/logout/${instanceName}`, {
        method: "DELETE",
        headers: { apikey: apiKey },
      });
      console.log(`[WA Connect] Logout response: ${logoutRes.status}`);
    } catch(e: any) {
      console.log(`[WA Connect] Delete ignore error:`, e.message);
    }

    // Create instance
    console.log(`[WA Connect] Calling POST /instance/create`);
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
    
    const rawCreateText = await createRes.text();
    console.log(`[WA Connect] Create Status: ${createRes.status}`);
    console.log(`[WA Connect] Create Response Body: ${rawCreateText.slice(0, 1000)}`);

    let createData;
    try {
      createData = JSON.parse(rawCreateText);
    } catch (e) {
      console.error("[WA Connect] Failed to parse create JSON");
      throw new Error(`Evolution API Error: Failed to parse JSON (Status ${createRes.status}).`);
    }

    let qrBase64 = createData?.qrcode?.base64 || createData?.base64;
    let pairingCode = createData?.qrcode?.pairingCode;
    
    if (!qrBase64 && !createData?.response?.message?.[0]?.includes("already")) {
      console.log(`[WA Connect] QR missing from create response. Waiting 2.5s to fetch via /connect...`);
      await new Promise(r => setTimeout(r, 2500));
      console.log(`[WA Connect] Calling GET /instance/connect/${instanceName}`);
      
      const conn = await fetch(`${baseUrl}/instance/connect/${instanceName}`, {
        headers: { apikey: apiKey },
      });
      const connText = await conn.text();
      console.log(`[WA Connect] Connect Status: ${conn.status}`);
      console.log(`[WA Connect] Connect Response Body: ${connText.slice(0, 1000)}`);
      
      let connData;
      try {
        connData = JSON.parse(connText);
      } catch (e) {
        console.error("[WA Connect] Failed to parse connect JSON");
      }
      
      qrBase64 = connData?.base64 || connData?.qrcode?.base64 || qrBase64;
      pairingCode = connData?.pairingCode || connData?.qrcode?.pairingCode || pairingCode;
    }

    if (!createRes.ok && createData?.response?.message?.[0]?.includes("already")) {
      console.log(`[WA Connect] Instance already exists. Fetching /connect directly.`);
      const conn = await fetch(`${baseUrl}/instance/connect/${instanceName}`, {
        headers: { apikey: apiKey },
      });
      const connData = await conn.json().catch(() => ({}));
      qrBase64 = connData?.base64 || connData?.qrcode?.base64;
      pairingCode = connData?.pairingCode || connData?.qrcode?.pairingCode;
    } else if (!createRes.ok) {
      throw new Error(`Evolution API: ${JSON.stringify(createData).slice(0, 200)}`);
    }

    console.log(`[WA Connect] Final QR status -> Base64 present: ${!!qrBase64}, PairingCode: ${pairingCode}`);

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
    console.error(`[WA Connect] Final Catch Error:`, err);
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
