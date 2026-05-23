/**
 * Workspace Virtual — context loader for Pega Engine (Pega 2).
 *
 * When Pega 2 receives an incoming customer chat (WA/IG/TG/Email), it calls
 * `loadUserWorkspace(userId)` to assemble the per-user context bundle.
 * The bundle is then injected into the AI system prompt so each user's Pega
 * speaks in their voice and knows their FAQ.
 *
 * LOCKED v1.0 (2026-05-23). Source: MEMORY.md "Pega 2".
 */
import { prisma } from "@/lib/prisma";

export interface UserWorkspace {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  business: {
    name: string | null;
    desc: string | null;
    industry: string | null;
    operatingHours: string | null;
  };
  persona: {
    style: string;
    tone: string | null;
    signature: string | null;
  };
  faq: Array<{ q: string; a: string }>;
  capabilities: string[];
  subscription: {
    status: string;
    packageTitle: string;
    creditsTotal: number;
    creditsUsed: number;
    creditsRemaining: number;
  } | null;
}

export const PERSONA_STYLE_DESC: Record<string, string> = {
  SANTAI: "santai, akrab, sering pakai kata 'kak' atau 'bro' sesuai konteks",
  FORMAL: "formal, profesional, sapaan 'Anda', tata bahasa rapi",
  CERIA: "ceria, antusias, hangat, sesekali pakai tanda seru",
  PROFESIONAL: "profesional namun ramah, fokus solusi, sapaan 'Anda'",
  CUSTOM: "ikuti tone custom user",
};

export async function loadUserWorkspace(userId: string): Promise<UserWorkspace | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      capabilities: { where: { enabled: true }, select: { channel: true } },
      subscription: { include: { package: { select: { title: true } } } },
    },
  });
  if (!user) return null;

  let faq: Array<{ q: string; a: string }> = [];
  try {
    if (user.faqEntries) {
      const parsed = JSON.parse(user.faqEntries);
      if (Array.isArray(parsed)) {
        faq = parsed
          .filter((e) => e && typeof e.q === "string" && typeof e.a === "string")
          .map((e) => ({ q: e.q, a: e.a }))
          .slice(0, 100);
      }
    }
  } catch {
    // ignore malformed JSON
  }

  return {
    user: { id: user.id, name: user.name, email: user.email },
    business: {
      name: user.businessName,
      desc: user.businessDesc,
      industry: user.businessIndustry,
      operatingHours: user.operatingHours,
    },
    persona: {
      style: user.personaStyle,
      tone: user.personaTone,
      signature: user.personaSignature,
    },
    faq,
    capabilities: user.capabilities.map((c) => c.channel),
    subscription: user.subscription
      ? {
          status: user.subscription.status,
          packageTitle: user.subscription.package.title,
          creditsTotal: user.subscription.creditsTotal,
          creditsUsed: user.subscription.creditsUsed,
          creditsRemaining:
            user.subscription.creditsTotal - user.subscription.creditsUsed,
        }
      : null,
  };
}

/**
 * Render the workspace into an AI system prompt fragment.
 * Pega Engine concatenates this with the customer message + provider rules.
 */
export function buildSystemPrompt(ws: UserWorkspace): string {
  const lines: string[] = [];
  const businessName = ws.business.name?.trim() || ws.user.name?.trim() || "bisnis Anda";
  lines.push(`Kamu adalah Pega, asisten AI untuk ${businessName}.`);
  if (ws.business.desc) lines.push(`Tentang bisnis: ${ws.business.desc}`);
  if (ws.business.industry) lines.push(`Industri: ${ws.business.industry}`);
  if (ws.business.operatingHours) {
    lines.push(`Jam operasional: ${ws.business.operatingHours}`);
  }
  const personaDesc = PERSONA_STYLE_DESC[ws.persona.style] || PERSONA_STYLE_DESC.PROFESIONAL;
  lines.push(`Persona: ${personaDesc}.`);
  if (ws.persona.tone) lines.push(`Tone tambahan: ${ws.persona.tone}`);
  if (ws.persona.signature) lines.push(`Tutup pesan dengan: ${ws.persona.signature}`);
  if (ws.faq.length > 0) {
    lines.push("\nFAQ produk/layanan:");
    ws.faq.forEach((f, i) => {
      lines.push(`${i + 1}. T: ${f.q}\n   J: ${f.a}`);
    });
  }
  lines.push(
    "\nAturan:\n- Jangan janji yang ga ada di FAQ.\n- Kalau ga tahu, tawarkan eskalasi ke owner.\n- Pakai bahasa Indonesia sesuai persona di atas.\n- Singkat dan to the point untuk balasan chat."
  );
  return lines.join("\n");
}
