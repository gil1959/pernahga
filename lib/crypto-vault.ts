/**
 * AES-256-GCM symmetric encryption for credential vault.
 *
 * Master key (env: CRYPTO_MASTER_KEY) MUST be a 32-byte hex string (64 chars)
 * or 32-byte base64 string. Set in Vercel project env, NEVER commit.
 *
 * Format of encrypted value (base64):
 *   [12B IV] [16B AUTH_TAG] [N B CIPHERTEXT]
 *
 * LOCKED v1.0 (2026-05-23). Used by lib/integration-vault.ts.
 */
import crypto from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;

let cachedKey: Buffer | null = null;
function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const raw = process.env.CRYPTO_MASTER_KEY;
  if (!raw) {
    throw new Error(
      "CRYPTO_MASTER_KEY not set. Generate one with: openssl rand -hex 32"
    );
  }
  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, "hex");
  } else {
    try {
      key = Buffer.from(raw, "base64");
    } catch {
      throw new Error("CRYPTO_MASTER_KEY must be 32-byte hex or base64");
    }
  }
  if (key.length !== 32) {
    throw new Error(`CRYPTO_MASTER_KEY must decode to 32 bytes, got ${key.length}`);
  }
  cachedKey = key;
  return key;
}

export function encrypt(plaintext: string): string {
  if (!plaintext) return "";
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decrypt(ciphertext: string): string {
  if (!ciphertext) return "";
  const buf = Buffer.from(ciphertext, "base64");
  if (buf.length < IV_LEN + TAG_LEN) {
    throw new Error("Invalid ciphertext (too short)");
  }
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ct = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
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
