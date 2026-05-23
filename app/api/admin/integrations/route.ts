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

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const providers = listProviders();
  const result = await Promise.all(
    providers.map(async (schema) => {
      const v = await getIntegration(schema.provider);
      return { schema, integration: v };
    })
  );
  return NextResponse.json({ providers: result });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const provider = body.provider as IntegrationProvider;
  if (!provider || !INTEGRATION_SCHEMAS[provider]) {
    return NextResponse.json({ message: "Provider tidak valid" }, { status: 400 });
  }
  const action = String(body.action || "save");

  if (action === "save") {
    const secrets: Record<string, string> = {};
    if (body.secrets && typeof body.secrets === "object") {
      for (const [k, v] of Object.entries(body.secrets)) {
        if (typeof v === "string" && v.trim().length > 0) secrets[k] = String(v);
      }
    }
    const publicFields: Record<string, string> = {};
    if (body.publicFields && typeof body.publicFields === "object") {
      for (const [k, v] of Object.entries(body.publicFields)) {
        publicFields[k] = String(v ?? "");
      }
    }
    const enabled = typeof body.enabled === "boolean" ? body.enabled : undefined;
    await upsertIntegration({ provider, secrets, publicFields, enabled, notes: body.notes });
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
}
