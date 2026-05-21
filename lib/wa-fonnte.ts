/**
 * WhatsApp OTP sender via Fonnte.
 *
 * Token sources (in order):
 *   1. SiteSettings.fonnteToken (DB)
 *   2. ENV FONNTE_TOKEN (fallback for older deploys)
 *
 * Config knobs (DB only):
 *   - fonnteEnabled = "true" | "false"
 *   - fonnteToken   = device token from https://fonnte.com
 *
 * Notes:
 *  - Fonnte expects target as MSISDN without "+" sign (e.g. 6281234567890).
 *  - Returns provider-specific status; we throw on non-2xx.
 */
import { prisma } from "@/lib/prisma";

type FonnteResponse = {
  status?: boolean;
  detail?: string;
  reason?: string;
  process?: string;
  target?: string[];
  id?: string[];
  message?: string;
};

const FONNTE_API = "https://api.fonnte.com/send";

async function getFonnteConfig(): Promise<{ token: string; enabled: boolean }> {
  let token = process.env.FONNTE_TOKEN || "";
  let enabled = true;
  try {
    const rows = await prisma.siteSettings.findMany({
      where: { key: { in: ["fonnteToken", "fonnteEnabled"] } },
    });
    for (const r of rows) {
      if (r.key === "fonnteToken" && r.value) token = r.value;
      if (r.key === "fonnteEnabled") enabled = r.value !== "false";
    }
  } catch {
    /* ignore DB issues, fall back to ENV */
  }
  return { token, enabled };
}

/**
 * Normalize an Indonesian phone number to E.164-without-plus form expected by Fonnte.
 * Accepts inputs like "08123...", "+62 812-345...", "62812345...".
 * Throws if the result doesn't look like a valid Indonesian mobile number.
 */
export function normalizePhone(input: string): string {
  if (!input) throw new Error("Nomor HP tidak boleh kosong");
  let p = input.replace(/[^\d+]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0")) p = "62" + p.slice(1);
  if (!p.startsWith("62")) p = "62" + p;
  // Indonesian mobile: starts with 628, total length 11-15
  if (!/^628\d{8,12}$/.test(p)) {
    throw new Error("Nomor HP Indonesia tidak valid");
  }
  return p;
}

/**
 * Send a WhatsApp message via Fonnte.
 * @returns provider response when successful
 * @throws Error on configuration or transport failure
 */
export async function sendWhatsApp(
  target: string,
  message: string
): Promise<FonnteResponse> {
  const { token, enabled } = await getFonnteConfig();
  if (!enabled) {
    throw new Error("Pengiriman OTP WhatsApp dinonaktifkan oleh administrator.");
  }
  if (!token) {
    throw new Error(
      "Token Fonnte belum di-set. Hubungi administrator untuk mengaktifkan OTP WhatsApp."
    );
  }

  const phone = normalizePhone(target);

  const form = new URLSearchParams();
  form.append("target", phone);
  form.append("message", message);
  form.append("countryCode", "62");

  const res = await fetch(FONNTE_API, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  let data: FonnteResponse = {};
  try {
    data = await res.json();
  } catch {
    /* ignore parse errors */
  }

  if (!res.ok || data.status === false) {
    const reason = data.reason || data.detail || data.message || `HTTP ${res.status}`;
    throw new Error(`Gagal mengirim WhatsApp: ${reason}`);
  }

  return data;
}

/**
 * Send a 6-digit OTP via WhatsApp using a clean template.
 */
export async function sendPhoneOtp(target: string, otp: string): Promise<void> {
  const message =
    `*Pernahga*\n\n` +
    `Kode verifikasi nomor HP Anda:\n` +
    `*${otp}*\n\n` +
    `Berlaku 10 menit. Jangan bagikan kode ini ke siapapun.\n` +
    `Jika Anda tidak meminta kode ini, abaikan saja pesan ini.`;
  await sendWhatsApp(target, message);
}
