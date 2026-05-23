/**
 * UI labels for taskType + channel — surfaced in dashboard usage history.
 * Keeps Pega Engine task identifiers in sync with friendly names.
 */
import type { TaskType } from "@/lib/credit-engine";

export const TASK_LABEL: Record<TaskType, string> = {
  wa_reply: "Balasan WhatsApp",
  ig_dm_reply: "Balasan Instagram DM",
  tg_reply: "Balasan Telegram",
  email_reply: "Balasan Email",
  discord_reply: "Balasan Discord",
  caption_gen: "Generate Caption",
  post_publish: "Auto-Post Sosmed",
  image_gen: "Generate Gambar",
  video_script: "Generate Video Script",
  daily_briefing: "Briefing Berita Harian",
  lead_tag: "Lead Tagging",
  booking: "Booking Calendar",
  webhook_event: "Webhook Integration",
  other: "Aktivitas",
};

export function labelForTask(task?: string | null): string {
  if (!task) return TASK_LABEL.other;
  return TASK_LABEL[task as TaskType] || task;
}

/** Friendly estimate of credits-per-action (for upsell hints). */
export const CREDIT_ESTIMATES: Record<TaskType, string> = {
  wa_reply: "~1-3 kredit per balasan",
  ig_dm_reply: "~1-3 kredit per balasan",
  tg_reply: "~1-3 kredit per balasan",
  email_reply: "~2-5 kredit per balasan",
  discord_reply: "~1-3 kredit per balasan",
  caption_gen: "~2-4 kredit per caption",
  post_publish: "~3-5 kredit per post",
  image_gen: "~1 kredit (Pollinations) atau ~40 kredit (Imagen/Codex)",
  video_script: "~10-20 kredit per script",
  daily_briefing: "~5-10 kredit per briefing",
  lead_tag: "~1 kredit per tag",
  booking: "~1 kredit per booking event",
  webhook_event: "~1 kredit per event",
  other: "tergantung jenis aksi",
};
