/**
 * AES-256-GCM symmetric encryption for credential vault.
 *
 * Master key (env: CRYPTO_MASTER_KEY) MUST be a 32-byte hex string (64 chars)
 * or 32-byte base64 string. Set in Vercel project env, NEVER commit.
 *
 * Format of encrypted value (base64):
 *   [12B IV] [16B AUTH_TAG] [N B CIPHERTEXT]
 *
 * Plaintext fallback: if CRYPTO_MASTER_KEY is not set, values are stored
 * with a "plain:" prefix instead of crashing. Production should always
 * set the key. Decrypt() auto-detects both formats.
 *
 * LOCKED v1.0 (2026-05-23). Used by lib/integration-vault.ts.
 */
import crypto from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;
const PLAIN_PREFIX = "plain:";

let cachedKey: Buffer | null = null;
let keyLookupAttempted = false;
function getKey(): Buffer | null {
  if (cachedKey) return cachedKey;
  if (keyLookupAttempted) return null;
  keyLookupAttempted = true;
  const raw = process.env.CRYPTO_MASTER_KEY;
  if (!raw) return null;
  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, "hex");
  } else {
    try {
      key = Buffer.from(raw, "base64");
    } catch {
      return null;
    }
  }
  if (key.length !== 32) return null;
  cachedKey = key;
  return key;
}

export function isCryptoKeyAvailable(): boolean {
  return getKey() !== null;
}

export function encrypt(plaintext: string): string {
  if (!plaintext) return "";
  const key = getKey();
  if (!key) {
    // Fallback: plaintext storage with prefix marker so decrypt knows.
    return PLAIN_PREFIX + Buffer.from(plaintext, "utf8").toString("base64");
  }
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decrypt(ciphertext: string): string {
  if (!ciphertext) return "";
  if (ciphertext.startsWith(PLAIN_PREFIX)) {
    return Buffer.from(ciphertext.slice(PLAIN_PREFIX.length), "base64").toString("utf8");
  }
  const buf = Buffer.from(ciphertext, "base64");
  if (buf.length < IV_LEN + TAG_LEN) {
    throw new Error("Invalid ciphertext (too short)");
  }
  const key = getKey();
  if (!key) {
    // No key — old encrypted data unreadable. Return empty so UI shows blank.
    return "";
  }
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ct = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ct, undefined, "utf8") + decipher.final("utf8");
}

/** Encrypt all string values in a record. Non-string values pass through. */
export function encryptRecord(rec: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(rec)) {
    if (v == null || v === "") continue;
    out[k] = encrypt(String(v));
  }
  return out;
}

export function decryptRecord(encMap: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(encMap)) {
    try {
      out[k] = decrypt(v);
    } catch {
      out[k] = "";
    }
  }
  return out;
}

/** Mask a secret for display (e.g. "sk-…6309"). */
export function maskSecret(plain: string, keepStart = 3, keepEnd = 4): string {
  if (!plain) return "";
  if (plain.length <= keepStart + keepEnd) return "***";
  return `${plain.slice(0, keepStart)}…${plain.slice(-keepEnd)}`;
}
