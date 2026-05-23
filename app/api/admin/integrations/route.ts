import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  listProviders,
  getIntegration,
  upsertIntegration,
  testIntegration,
  INTEGRATION_SCHEMAS,
} from "@/lib/integration-vault";
import type { IntegrationProvider } from "@prisma/client";

/**
 * GET  /api/admin/integrations         → list all providers + status
 * POST /api/admin/integrations         → upsert credentials, action=save|test|toggle
 *
 * Admin-only. Source: MEMORY.md "Multi-Channel Connect Strategy LOCKED v1.0".
 */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("CRYPTO_MASTER_KEY")) {
    return "CRYPTO_MASTER_KEY env belum diset di Vercel. Buka Vercel → Settings → Environment Variables, tambahkan CRYPTO_MASTER_KEY (32-byte hex), lalu redeploy.";
  }
  if (msg.includes("P2002") || msg.includes("Unique constraint")) {
    return "Konflik data. Coba refresh halaman.";
  }
  if (msg.includes("P1001") || msg.includes("P1002")) {
    return "Database tidak terhubung. Cek koneksi Neon Postgres.";
  }
  if (msg.includes("IntegrationCredential") && msg.includes("does not exist")) {
    return "Tabel IntegrationCredential belum ada. Vercel deploy mungkin belum selesai sync schema. Coba redeploy.";
  }
  return msg;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const providers = listProviders();
    const result = await Promise.all(
      providers.map(async (schema) => {
        try {
          const v = await getIntegration(schema.provider);
          return { schema, integration: v };
        } catch (err: unknown) {
          return {
            schema,
            integration: null,
            loadError: friendlyError(err),
          };
        }
      })
    );
    // Surface vault key health for the UI
    const cryptoKeyOk = Boolean(process.env.CRYPTO_MASTER_KEY);
    return NextResponse.json({ providers: result, cryptoKeyOk });
  } catch (err: unknown) {
    return NextResponse.json(
      { message: friendlyError(err), cryptoKeyOk: Boolean(process.env.CRYPTO_MASTER_KEY) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Body JSON tidak valid" }, { status: 400 });
  }

  const provider = body.provider as IntegrationProvider;
  if (!provider || !INTEGRATION_SCHEMAS[provider]) {
    return NextResponse.json({ message: "Provider tidak valid" }, { status: 400 });
  }
  const action = String(body.action || "save");

  try {
    if (action === "save") {
      const secrets: Record<string, string> = {};
      if (body.secrets && typeof body.secrets === "object") {
        for (const [k, v] of Object.entries(body.secrets as Record<string, unknown>)) {
          if (typeof v === "string" && v.trim().length > 0) secrets[k] = String(v);
        }
      }
      const publicFields: Record<string, string> = {};
      if (body.publicFields && typeof body.publicFields === "object") {
        for (const [k, v] of Object.entries(body.publicFields as Record<string, unknown>)) {
          publicFields[k] = String(v ?? "");
        }
      }
      const enabled = typeof body.enabled === "boolean" ? (body.enabled as boolean) : undefined;
      await upsertIntegration({ provider, secrets, publicFields, enabled, notes: body.notes as string | undefined });
      const view = await getIntegration(provider);
      return NextResponse.json({ ok: true, integration: view });
    }

    if (action === "test") {
      const result = await testIntegration(provider);
      const view = await getIntegration(provider);
      return NextResponse.json({ ok: result.ok, message: result.message, meta: result.meta, integration: view });
    }

    if (action === "toggle") {
      const enabled = Boolean(body.enabled);
      await upsertIntegration({ provider, enabled });
      const view = await getIntegration(provider);
      return NextResponse.json({ ok: true, integration: view });
    }

    return NextResponse.json({ message: "Action tidak dikenal" }, { status: 400 });
  } catch (err: unknown) {
    console.error("[admin/integrations]", action, provider, err);
    return NextResponse.json({ ok: false, message: friendlyError(err) }, { status: 500 });
  }
}
