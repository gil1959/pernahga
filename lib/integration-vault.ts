/**
 * Integration Vault — admin-managed credential store + connectivity tests.
 *
 * Each provider has:
 *   - SECRET_FIELDS: encrypted at rest (bot tokens, client secrets, API keys)
 *   - PUBLIC_FIELDS: plaintext (redirect URLs, bot username, instance name)
 *   - testCredential(): live ping to the provider to validate
 *
 * Source: MEMORY.md "Multi-Channel Connect Strategy LOCKED v1.0".
 */
import type { IntegrationProvider, IntegrationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { encryptRecord, decryptRecord, maskSecret } from "@/lib/crypto-vault";

export interface ProviderSchema {
  provider: IntegrationProvider;
  displayName: string;
  description: string;
  /** Field keys that get encrypted at rest. */
  secretFields: Array<{ key: string; label: string; placeholder?: string; help?: string }>;
  /** Field keys stored plaintext (URLs, bot username, etc.). */
  publicFields: Array<{ key: string; label: string; placeholder?: string; help?: string }>;
}

export const INTEGRATION_SCHEMAS: Record<IntegrationProvider, ProviderSchema> = {
  DISCORD: {
    provider: "DISCORD",
    displayName: "Discord",
    description: "1-klik Add to Server via OAuth. User invite Pega bot ke server mereka.",
    secretFields: [
      { key: "botToken", label: "Bot Token", placeholder: "Bot xxx.yyy.zzz", help: "Discord Developer Portal → Bot → Reset Token" },
      { key: "clientSecret", label: "Client Secret", placeholder: "abc123…", help: "Discord Developer Portal → OAuth2 → General" },
    ],
    publicFields: [
      { key: "clientId", label: "Client ID", placeholder: "1234567890", help: "Discord Developer Portal → General Information" },
      { key: "redirectUri", label: "Redirect URI", placeholder: "https://pernahga.com/api/connect/discord/callback", help: "Daftarkan URL ini di Discord OAuth2 → Redirects" },
    ],
  },
  TELEGRAM_PEGA: {
    provider: "TELEGRAM_PEGA",
    displayName: "Telegram (Bot Pusat Pega)",
    description: "Bot @PegaPernahgaBot. User klik 'Add Pega' dan invite ke chat mereka. Opsi 1 multi-tenant.",
    secretFields: [
      { key: "botToken", label: "Bot Token", placeholder: "123456:ABC…", help: "@BotFather → /newbot → copy token" },
    ],
    publicFields: [
      { key: "botUsername", label: "Bot Username", placeholder: "PegaPernahgaBot", help: "Tanpa @, contoh PegaPernahgaBot" },
      { key: "webhookUrl", label: "Webhook URL", placeholder: "https://pernahga.com/api/webhook/telegram", help: "Endpoint terima update dari Telegram" },
    ],
  },
  GOOGLE_OAUTH: {
    provider: "GOOGLE_OAUTH",
    displayName: "Google OAuth (Email)",
    description: "Connect Gmail user via OAuth Google. Auto-reply email customer.",
    secretFields: [
      { key: "clientSecret", label: "Client Secret", placeholder: "GOCSPX-…", help: "Google Cloud Console → Credentials → OAuth client" },
    ],
    publicFields: [
      { key: "clientId", label: "Client ID", placeholder: "xxx.apps.googleusercontent.com" },
      { key: "redirectUri", label: "Redirect URI", placeholder: "https://pernahga.com/api/connect/email/callback" },
    ],
  },
  WHATSAPP_EVOLUTION: {
    provider: "WHATSAPP_EVOLUTION",
    displayName: "WhatsApp (Evolution API)",
    description: "Self-hosted Evolution API multi-tenant. User scan QR di dashboard, langsung aktif.",
    secretFields: [
      { key: "apiKey", label: "Master API Key", placeholder: "evolution-master-key", help: "Set di .env Evolution API (AUTHENTICATION_API_KEY)" },
    ],
    publicFields: [
      { key: "baseUrl", label: "Base URL", placeholder: "https://evo.pernahga.com", help: "URL Evolution API server. HTTPS wajib pas production." },
      { key: "webhookUrl", label: "Webhook URL", placeholder: "https://pernahga.com/api/webhook/whatsapp", help: "Endpoint terima event WA" },
    ],
  },
  META_BUSINESS: {
    provider: "META_BUSINESS",
    displayName: "Meta Business (IG/FB/Threads)",
    description: "IG Business + FB Page + Threads via Meta Embedded Signup. Butuh Meta Business Verification + app review.",
    secretFields: [
      { key: "appSecret", label: "App Secret", placeholder: "abc123…", help: "Meta Developers → App → Settings → Basic" },
    ],
    publicFields: [
      { key: "appId", label: "App ID", placeholder: "1234567890" },
      { key: "businessId", label: "Business ID", placeholder: "9876543210" },
      { key: "configId", label: "Embedded Signup Config ID", placeholder: "xxx", help: "Opsional sampai approval keluar" },
      { key: "redirectUri", label: "Redirect URI", placeholder: "https://pernahga.com/api/connect/meta/callback" },
    ],
  },
};

export function listProviders(): ProviderSchema[] {
  return Object.values(INTEGRATION_SCHEMAS);
}

export interface IntegrationView {
  provider: IntegrationProvider;
  displayName: string;
  enabled: boolean;
  status: IntegrationStatus;
  lastTestedAt: string | null;
  lastTestError: string | null;
  publicFields: Record<string, string>;
  /** Masked secrets — for admin display only. */
  maskedSecrets: Record<string, string>;
}

export async function getIntegration(provider: IntegrationProvider): Promise<IntegrationView | null> {
  const row = await prisma.integrationCredential.findUnique({ where: { provider } });
  const schema = INTEGRATION_SCHEMAS[provider];
  if (!schema) return null;
  if (!row) {
    return {
      provider,
      displayName: schema.displayName,
      enabled: false,
      status: "NOT_CONFIGURED",
      lastTestedAt: null,
      lastTestError: null,
      publicFields: Object.fromEntries(schema.publicFields.map((f) => [f.key, ""])),
      maskedSecrets: Object.fromEntries(schema.secretFields.map((f) => [f.key, ""])),
    };
  }
  let publicFields: Record<string, string> = {};
  let maskedSecrets: Record<string, string> = {};
  try {
    publicFields = JSON.parse(row.publicData || "{}");
  } catch {}
  try {
    const enc = JSON.parse(row.encryptedData || "{}");
    const decrypted = decryptRecord(enc);
    maskedSecrets = Object.fromEntries(
      schema.secretFields.map((f) => [f.key, decrypted[f.key] ? maskSecret(decrypted[f.key]) : ""])
    );
  } catch {}
  return {
    provider,
    displayName: schema.displayName,
    enabled: row.enabled,
    status: row.status,
    lastTestedAt: row.lastTestedAt?.toISOString() || null,
    lastTestError: row.lastTestError,
    publicFields,
    maskedSecrets,
  };
}

export async function getDecryptedCredentials(
  provider: IntegrationProvider
): Promise<{ secrets: Record<string, string>; publicFields: Record<string, string>; enabled: boolean } | null> {
  const row = await prisma.integrationCredential.findUnique({ where: { provider } });
  if (!row) return null;
  let publicFields: Record<string, string> = {};
  let secrets: Record<string, string> = {};
  try { publicFields = JSON.parse(row.publicData || "{}"); } catch {}
  try {
    const enc = JSON.parse(row.encryptedData || "{}");
    secrets = decryptRecord(enc);
  } catch {}
  return { secrets, publicFields, enabled: row.enabled };
}

export interface UpsertIntegrationInput {
  provider: IntegrationProvider;
  enabled?: boolean;
  /** New secret values. Leave empty/undefined to keep existing. */
  secrets?: Record<string, string>;
  publicFields?: Record<string, string>;
  notes?: string;
}

/**
 * Save credentials. Empty secret fields preserve existing values
 * (so admin doesn't have to re-enter everything every save).
 */
export async function upsertIntegration(input: UpsertIntegrationInput) {
  const schema = INTEGRATION_SCHEMAS[input.provider];
  if (!schema) throw new Error(`Unknown provider: ${input.provider}`);

  const existing = await prisma.integrationCredential.findUnique({
    where: { provider: input.provider },
  });
  const existingEnc: Record<string, string> = (() => {
    try { return JSON.parse(existing?.encryptedData || "{}"); } catch { return {}; }
  })();

  const newEnc: Record<string, string> = { ...existingEnc };
  if (input.secrets) {
    const incoming = encryptRecord(
      Object.fromEntries(
        Object.entries(input.secrets).filter(([, v]) => typeof v === "string" && v.length > 0)
      )
    );
    Object.assign(newEnc, incoming);
  }

  const publicFields = input.publicFields
    ? Object.fromEntries(
        Object.entries(input.publicFields).map(([k, v]) => [k, String(v ?? "").trim()])
      )
    : (() => { try { return JSON.parse(existing?.publicData || "{}"); } catch { return {}; } })();

  const data = {
    provider: input.provider,
    enabled: typeof input.enabled === "boolean" ? input.enabled : existing?.enabled ?? false,
    encryptedData: JSON.stringify(newEnc),
    publicData: JSON.stringify(publicFields),
    notes: input.notes ?? existing?.notes ?? null,
    status: "PENDING_TEST" as IntegrationStatus,
  };
  return prisma.integrationCredential.upsert({
    where: { provider: input.provider },
    create: data,
    update: data,
  });
}

/**
 * Live connectivity test. Pings the provider with current credentials and
 * returns ok+message. Updates `status`, `lastTestedAt`, `lastTestError`.
 */
export async function testIntegration(
  provider: IntegrationProvider
): Promise<{ ok: boolean; message: string; meta?: Record<string, unknown> }> {
  const creds = await getDecryptedCredentials(provider);
  if (!creds) {
    return { ok: false, message: "Belum ada credential tersimpan" };
  }
  const { secrets, publicFields } = creds;

  let result: { ok: boolean; message: string; meta?: Record<string, unknown> };
  try {
    switch (provider) {
      case "DISCORD":
        result = await testDiscord(secrets.botToken, publicFields.clientId);
        break;
      case "TELEGRAM_PEGA":
        result = await testTelegram(secrets.botToken);
        break;
      case "GOOGLE_OAUTH":
        result = await testGoogleOAuth(publicFields.clientId, secrets.clientSecret);
        break;
      case "WHATSAPP_EVOLUTION":
        result = await testEvolution(publicFields.baseUrl, secrets.apiKey);
        break;
      case "META_BUSINESS":
        result = await testMeta(publicFields.appId, secrets.appSecret);
        break;
      default:
        result = { ok: false, message: "Provider tidak dikenal" };
    }
  } catch (err: unknown) {
    result = { ok: false, message: err instanceof Error ? err.message : String(err) };
  }

  await prisma.integrationCredential.update({
    where: { provider },
    data: {
      status: result.ok ? "VALID" : "INVALID",
      lastTestedAt: new Date(),
      lastTestError: result.ok ? null : result.message.slice(0, 500),
    },
  });
  return result;
}

// ---- per-provider live tests ----

async function testDiscord(token: string, clientId: string) {
  if (!token) return { ok: false, message: "Bot token kosong" };
  const res = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) {
    return { ok: false, message: `Discord API ${res.status}: ${await res.text()}` };
  }
  const data = await res.json();
  return {
    ok: true,
    message: `Bot ${data.username}#${data.discriminator || data.global_name || ""} aktif`,
    meta: { botId: data.id, username: data.username, clientIdMatches: !clientId || data.id === clientId },
  };
}

async function testTelegram(token: string) {
  if (!token) return { ok: false, message: "Bot token kosong" };
  const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const data = await res.json();
  if (!data.ok) {
    return { ok: false, message: `Telegram API: ${data.description}` };
  }
  return {
    ok: true,
    message: `Bot @${data.result.username} aktif (${data.result.first_name})`,
    meta: { botId: data.result.id, username: data.result.username },
  };
}

async function testGoogleOAuth(clientId: string, clientSecret: string) {
  if (!clientId || !clientSecret) {
    return { ok: false, message: "Client ID dan Secret wajib diisi" };
  }
  // Format-only check (Google ga punya endpoint validate-credentials).
  // Real test happens at user OAuth flow.
  if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test(clientId)) {
    return { ok: false, message: "Format Client ID tidak valid (harus *.apps.googleusercontent.com)" };
  }
  if (clientSecret.length < 16) {
    return { ok: false, message: "Client Secret terlalu pendek" };
  }
  return { ok: true, message: "Format credential valid. Validasi penuh saat user OAuth pertama." };
}

async function testEvolution(baseUrl: string, apiKey: string) {
  if (!baseUrl || !apiKey) {
    return { ok: false, message: "Base URL dan API key wajib diisi" };
  }
  const url = baseUrl.replace(/\/+$/, "");
  // Evolution API has GET / which returns version info.
  const res = await fetch(`${url}/`, {
    headers: { apikey: apiKey },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    return { ok: false, message: `Evolution API ${res.status}` };
  }
  const data = await res.json().catch(() => ({}));
  return {
    ok: true,
    message: `Evolution API ${data.version || "ok"}`,
    meta: data,
  };
}

async function testMeta(appId: string, appSecret: string) {
  if (!appId || !appSecret) {
    return { ok: false, message: "App ID dan Secret wajib diisi" };
  }
  // Validate app credentials by exchanging client_credentials.
  const res = await fetch(
    `https://graph.facebook.com/oauth/access_token?client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(appSecret)}&grant_type=client_credentials`,
    { signal: AbortSignal.timeout(8000) }
  );
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    return { ok: false, message: `Meta: ${data.error?.message || res.status}` };
  }
  return { ok: true, message: "App credentials valid", meta: { tokenType: data.token_type } };
}
