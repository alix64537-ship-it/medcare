import type { Urgency } from "./types";
import type { Tone } from "./calculators";

export const URGENCY_STYLE: Record<Urgency, { badge: string; dot: string; panel: string; label: string; short: string }> = {
  red: {
    badge: "bg-urgent-soft text-urgent-ink border-urgent/30",
    dot: "bg-urgent",
    panel: "bg-urgent-soft border-urgent/40 text-urgent-ink",
    label: "Красный · срочно",
    short: "Срочный",
  },
  yellow: {
    badge: "bg-warning-soft text-warning-ink border-warning/40",
    dot: "bg-warning",
    panel: "bg-warning-soft border-warning/50 text-warning-ink",
    label: "Жёлтый · средний",
    short: "Средний",
  },
  green: {
    badge: "bg-success-soft text-success-ink border-success/30",
    dot: "bg-success",
    panel: "bg-success-soft border-success/40 text-success-ink",
    label: "Зелёный · плановый",
    short: "Плановый",
  },
};

export const TONE_STYLE: Record<Tone, string> = {
  success: "bg-success-soft text-success-ink border-success/30",
  warning: "bg-warning-soft text-warning-ink border-warning/40",
  urgent: "bg-urgent-soft text-urgent-ink border-urgent/30",
  info: "bg-info-soft text-info-ink border-info/30",
};

export const LAB_SEVERITY_STYLE: Record<"ok" | "mild" | "severe", { badge: string; dot: string }> = {
  ok: { badge: "bg-success-soft text-success-ink border-success/30", dot: "bg-success" },
  mild: { badge: "bg-warning-soft text-warning-ink border-warning/40", dot: "bg-warning" },
  severe: { badge: "bg-urgent-soft text-urgent-ink border-urgent/30", dot: "bg-urgent" },
};
