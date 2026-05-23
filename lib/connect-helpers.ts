/**
 * Connect endpoint helpers — shared logic for /api/user/connect/* routes.
 * Loads admin-managed integration credentials, ensures provider is enabled,
 * and persists UserConnection rows.
 */
import { prisma } from "@/lib/prisma";
import { getDecryptedCredentials } from "@/lib/integration-vault";
import type { CapabilityChannel, IntegrationProvider } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/crypto-vault";

export class IntegrationDisabledError extends Error {
  status = 503;
  constructor(public provider: IntegrationProvider) {
    super(`Provider ${provider} belum diaktifkan oleh admin`);
  }
}

export async function loadActiveCreds(provider: IntegrationProvider) {
  const creds = await getDecryptedCredentials(provider);
  if (!creds || !creds.enabled) throw new IntegrationDisabledError(provider);
  return creds;
}

/** Has the user already activated this channel? */
export async function getUserConnections(userId: string, channel?: CapabilityChannel) {
  return prisma.userConnection.findMany({
    where: { userId, ...(channel && { channel }) },
    orderBy: { createdAt: "desc" },
  });
}

export async function saveUserConnection(args: {
  userId: string;
  channel: CapabilityChannel;
  provider: IntegrationProvider;
  externalId: string;
  label?: string;
  secrets?: Record<string, string>;
  publicData?: Record<string, unknown>;
  status?: "ACTIVE" | "REQUESTED";
}) {
  const encryptedData = args.secrets
    ? JSON.stringify(
        Object.fromEntries(
          Object.entries(args.secrets)
            .filter(([, v]) => typeof v === "string" && v.length > 0)
            .map(([k, v]) => [k, encrypt(v)])
        )
      )
    : null;
  const publicData = args.publicData ? JSON.stringify(args.publicData) : null;
  return prisma.userConnection.upsert({
    where: {
      userId_channel_provider_externalId: {
        userId: args.userId,
        channel: args.channel,
        provider: args.provider,
        externalId: args.externalId,
      },
    },
    create: {
      userId: args.userId,
      channel: args.channel,
      provider: args.provider,
      externalId: args.externalId,
      label: args.label,
      encryptedData,
      publicData,
      status: args.status || "ACTIVE",
      lastEventAt: new Date(),
    },
    update: {
      label: args.label,
      encryptedData,
      publicData,
      status: args.status || "ACTIVE",
      lastEventAt: new Date(),
    },
  });
}

export function decryptConnectionSecrets(enc: string | null): Record<string, string> {
  if (!enc) return {};
  try {
    const parsed = JSON.parse(enc) as Record<string, string>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      try { out[k] = decrypt(v); } catch { out[k] = ""; }
    }
    return out;
  } catch {
    return {};
  }
}

/** Capability gate — user must have UserCapability.enabled = true on this channel. */
export async function requireCapability(userId: string, channel: CapabilityChannel) {
  const cap = await prisma.userCapability.findUnique({
    where: { userId_channel: { userId, channel } },
  });
  if (!cap?.enabled) {
    const err = new Error(`Channel ${channel} belum aktif di plan Anda`);
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return cap;
}
