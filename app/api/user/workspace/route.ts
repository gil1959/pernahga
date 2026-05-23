import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/user/workspace
 * Returns the user's workspace virtual fields (business, persona, FAQ).
 *
 * PUT /api/user/workspace
 * Updates the workspace virtual fields. All fields optional.
 *
 * LOCKED v1.0 (2026-05-23) — read by Pega Engine to build per-user prompts.
 */
const ALLOWED_PERSONA = new Set(["SANTAI", "FORMAL", "CERIA", "PROFESIONAL", "CUSTOM"]);

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const u = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      businessName: true,
      businessDesc: true,
      businessIndustry: true,
      personaStyle: true,
      personaTone: true,
      personaSignature: true,
      operatingHours: true,
      faqEntries: true,
      onboardingDone: true,
    },
  });
  if (!u) return NextResponse.json({ message: "Not found" }, { status: 404 });

  let faq: Array<{ q: string; a: string }> = [];
  try {
    if (u.faqEntries) {
      const parsed = JSON.parse(u.faqEntries);
      if (Array.isArray(parsed)) {
        faq = parsed.filter((e) => e && typeof e.q === "string" && typeof e.a === "string");
      }
    }
  } catch {}

  return NextResponse.json({ ...u, faq });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (typeof body.businessName === "string") {
    data.businessName = body.businessName.trim().slice(0, 120) || null;
  }
  if (typeof body.businessDesc === "string") {
    data.businessDesc = body.businessDesc.trim().slice(0, 2000) || null;
  }
  if (typeof body.businessIndustry === "string") {
    data.businessIndustry = body.businessIndustry.trim().slice(0, 80) || null;
  }
  if (typeof body.personaStyle === "string" && ALLOWED_PERSONA.has(body.personaStyle)) {
    data.personaStyle = body.personaStyle;
  }
  if (typeof body.personaTone === "string") {
    data.personaTone = body.personaTone.trim().slice(0, 500) || null;
  }
  if (typeof body.personaSignature === "string") {
    data.personaSignature = body.personaSignature.trim().slice(0, 200) || null;
  }
  if (typeof body.operatingHours === "string") {
    data.operatingHours = body.operatingHours.trim().slice(0, 500) || null;
  }
  if (Array.isArray(body.faq)) {
    type FaqInput = { q: string; a: string };
    const cleaned = (body.faq as unknown[])
      .filter(
        (e): e is FaqInput =>
          !!e && typeof (e as { q?: unknown }).q === "string" && typeof (e as { a?: unknown }).a === "string"
      )
      .map((e) => ({ q: e.q.trim().slice(0, 300), a: e.a.trim().slice(0, 1500) }))
      .filter((e) => e.q && e.a)
      .slice(0, 100);
    data.faqEntries = cleaned.length > 0 ? JSON.stringify(cleaned) : null;
  }
  if (typeof body.onboardingDone === "boolean") {
    data.onboardingDone = body.onboardingDone;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: "Tidak ada field yang valid" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      businessName: true,
      businessDesc: true,
      businessIndustry: true,
      personaStyle: true,
      personaTone: true,
      personaSignature: true,
      operatingHours: true,
      onboardingDone: true,
    },
  });
  return NextResponse.json({ ok: true, ...updated });
}
