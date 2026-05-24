/**
 * Plan capability matrix — single source of truth.
 *
 * Maps each PernahGa SaaS tier (by Package.title) to the set of capabilities
 * a buyer is GRANTED by their plan. Admin can still toggle individual
 * capabilities on/off per user via /admin/users/<id>.
 *
 * Source of truth: foundation.md v2.0 (LOCKED). Do not silently expand
 * capabilities here without checking the chat checkpoint first.
 */
import type { CapabilityChannel } from "@prisma/client";

export type PlanKey = "Trial" | "Starter" | "Pro" | "Business" | "Enterprise";

export const PLAN_CAPABILITIES: Record<PlanKey, CapabilityChannel[]> = {
  Trial: [
    // Trial = Pro-level for 3 days.
    "PEGA_CHAT",
    "WHATSAPP",
    "INSTAGRAM_DM",
    "TELEGRAM",
    "INSTAGRAM_POST",
    "FACEBOOK_POST",
    "LINKEDIN_POST",
    "THREADS_POST",
    "TWITTER_POST",
    "BOOKING_CALENDAR",
    "IMAGE_GEN",
    "DAILY_NEWS_BRIEFING",
  ],
  Starter: [
    // CS bot 1 channel + caption gen + lead tagging + weekly report.
    // NO auto-posting medsos (LOCKED v2.0).
    "PEGA_CHAT",
    "WHATSAPP",
    "INSTAGRAM_DM",
    "TELEGRAM",
  ],
  Pro: [
    "PEGA_CHAT",
    "WHATSAPP",
    "INSTAGRAM_DM",
    "TELEGRAM",
    "EMAIL",
    "INSTAGRAM_POST",
    "FACEBOOK_POST",
    "LINKEDIN_POST",
    "THREADS_POST",
    "TWITTER_POST",
    "BOOKING_CALENDAR",
    "IMAGE_GEN",
    "DAILY_NEWS_BRIEFING",
  ],
  Business: [
    "PEGA_CHAT",
    "WHATSAPP",
    "INSTAGRAM_DM",
    "TELEGRAM",
    "EMAIL",
    "DISCORD",
    "INSTAGRAM_POST",
    "FACEBOOK_POST",
    "LINKEDIN_POST",
    "THREADS_POST",
    "TWITTER_POST",
    "TIKTOK_POST",
    "PINTEREST_POST",
    "BOOKING_CALENDAR",
    "IMAGE_GEN",
    "VIDEO_SCRIPT",
    "DAILY_NEWS_BRIEFING",
    "WEBHOOK_INTEGRATION",
  ],
  Enterprise: [
    "PEGA_CHAT",
    "WHATSAPP",
    "INSTAGRAM_DM",
    "TELEGRAM",
    "EMAIL",
    "DISCORD",
    "INSTAGRAM_POST",
    "FACEBOOK_POST",
    "LINKEDIN_POST",
    "THREADS_POST",
    "TWITTER_POST",
    "TIKTOK_POST",
    "PINTEREST_POST",
    "BOOKING_CALENDAR",
    "IMAGE_GEN",
    "VIDEO_SCRIPT",
    "DAILY_NEWS_BRIEFING",
    "WEBHOOK_INTEGRATION",
    "WHITE_LABEL",
  ],
};

/**
 * Plan credit configuration. monthlyCredits + refresh interval.
 */
export const PLAN_CREDITS: Record<PlanKey, { monthly: number; refreshDays: number; trialDays?: number }> = {
  Trial: { monthly: 200, refreshDays: 0, trialDays: 3 },
  Starter: { monthly: 500, refreshDays: 7 },
  Pro: { monthly: 2000, refreshDays: 5 },
  Business: { monthly: 6000, refreshDays: 3 },
  Enterprise: { monthly: 30000, refreshDays: 1 },
};

/**
 * Required name → minimum plan to unlock. Used by upgrade-modal to show
 * "Pasang otomatis Instagram tersedia mulai paket Pro".
 */
export const CAPABILITY_MIN_PLAN: Record<CapabilityChannel, PlanKey> = {
  WHATSAPP: "Starter",
  INSTAGRAM_DM: "Starter",
  TELEGRAM: "Starter",
  EMAIL: "Pro",
  DISCORD: "Business",
  INSTAGRAM_POST: "Pro",
  FACEBOOK_POST: "Pro",
  LINKEDIN_POST: "Pro",
  THREADS_POST: "Pro",
  TWITTER_POST: "Pro",
  TIKTOK_POST: "Business",
  PINTEREST_POST: "Business",
  BOOKING_CALENDAR: "Pro",
  IMAGE_GEN: "Pro",
  VIDEO_SCRIPT: "Business",
  DAILY_NEWS_BRIEFING: "Pro",
  WEBHOOK_INTEGRATION: "Business",
  WHITE_LABEL: "Enterprise",
  PEGA_CHAT: "Trial",
};

export const CAPABILITY_LABEL: Record<CapabilityChannel, string> = {
  WHATSAPP: "WhatsApp Customer Support",
  INSTAGRAM_DM: "Instagram DM Auto-Reply",
  TELEGRAM: "Telegram Bot",
  EMAIL: "Email Auto-Reply",
  DISCORD: "Discord Komunitas",
  INSTAGRAM_POST: "Auto-Posting Instagram",
  FACEBOOK_POST: "Auto-Posting Facebook",
  LINKEDIN_POST: "Auto-Posting LinkedIn",
  THREADS_POST: "Auto-Posting Threads",
  TWITTER_POST: "Auto-Posting X/Twitter",
  TIKTOK_POST: "Auto-Posting TikTok",
  PINTEREST_POST: "Auto-Posting Pinterest",
  BOOKING_CALENDAR: "Booking Calendar",
  IMAGE_GEN: "Image Generation",
  VIDEO_SCRIPT: "Video Script & Storyboard",
  DAILY_NEWS_BRIEFING: "Briefing Berita Harian",
  WEBHOOK_INTEGRATION: "Webhook Custom Integration",
  WHITE_LABEL: "White-Label Identity",
  PEGA_CHAT: "Chat Personal dengan Pega",
};

export function isPlanKey(s: string | undefined | null): s is PlanKey {
  return s === "Trial" || s === "Starter" || s === "Pro" || s === "Business" || s === "Enterprise";
}
