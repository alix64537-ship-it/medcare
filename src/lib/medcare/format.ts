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
  const [y = 1970, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
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

export function pluralYears(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "год";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "года";
  return "лет";
}

export function ageFrom(birthDate: string | undefined, now = new Date()): number | null {
  if (!birthDate) return null;
  const b = parseISODate(birthDate);
  if (Number.isNaN(b.getTime())) return null;
  let age = now.getFullYear() - b.getFullYear();
  const beforeBirthday = now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate());
  if (beforeBirthday) age--;
  return age >= 0 ? age : null;
}

export function formatAge(birthDate: string | undefined): string {
  const age = ageFrom(birthDate);
  return age === null ? "" : `${age} ${pluralYears(age)}`;
}

/** "Фамилия Имя Отчество" → "Имя". */
export function givenName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[1] ?? parts[0] ?? "";
}
