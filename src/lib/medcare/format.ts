import type { BloodGroup, Rh } from "./types";

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, days: number): Date {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatDateLong(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", weekday: "short" }).format(
    parseISODate(iso),
  );
}

export function formatDayChip(iso: string): { weekday: string; day: string; month: string } {
  const d = parseISODate(iso);
  return {
    weekday: new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(d),
    day: String(d.getDate()),
    month: new Intl.DateTimeFormat("ru-RU", { month: "short" }).format(d),
  };
}

export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₸`;
}

export function formatBlood(group: BloodGroup, rh: Rh): string {
  if (!group) return "Не указана";
  return `${group} (${group === "I" ? "0" : group === "II" ? "A" : group === "III" ? "B" : "AB"}) Rh${rh || "?"}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function generateTicket(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `MC-${code}`;
}

export function generateId(): string {
  return `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
