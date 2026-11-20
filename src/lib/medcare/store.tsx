import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Context, type ReactNode } from "react";

import { bestDoctorFor } from "./data";
import { addDays, generateId, generateTicket, toISODate } from "./format";
import type { Appointment, PatientSnapshot, Privacy, Profile, Specialty, TriageResult, Urgency } from "./types";

export type Role = "patient" | "doctor";
export type PatientTab = "doctors" | "record" | "calc" | "ai";

export interface BookingDraft {
  doctorId: string;
  complaints: string;
  urgency: Urgency | null;
  anamnesis: string | null;
}

export interface MedCareData {
  profile: Profile;
  privacy: Privacy;
  appointments: Appointment[];
  lastTriage: TriageResult | null;
}

const STORAGE_KEY = "medcare:v1";

export const DEFAULT_PRIVACY: Privacy = {
  consentMedData: true,
  shareTriageWithDoctor: true,
  anonymizeAI: false,
  privateScreen: false,
};

export const EMPTY_PROFILE: Profile = {
  fullName: "",
  phone: "",
  bloodGroup: "",
  rh: "",
  chronic: "",
  allergies: "",
};

const DEMO_PROFILE: Profile = {
  fullName: "Нурланова Айгерим Маратовна",
  phone: "+7 701 234 56 78",
  bloodGroup: "II",
  rh: "+",
  chronic: "Хронический гастрит (ремиссия)",
  allergies: "Пенициллин",
};

export function snapshotOf(p: Profile): PatientSnapshot {
  return { fullName: p.fullName, phone: p.phone, bloodGroup: p.bloodGroup, rh: p.rh, chronic: p.chronic, allergies: p.allergies };
}

function createSeedData(): MedCareData {
  const today = new Date();
  const d = (offset: number) => toISODate(addDays(today, offset));
  const now = today.toISOString();
  return {
    profile: DEMO_PROFILE,
    privacy: DEFAULT_PRIVACY,
    lastTriage: null,
    appointments: [
      {
        id: "seed-own-1",
        doctorId: "d1",
        date: d(-12),
        time: "10:30",
        complaints: "Слабость, сухой кашель около недели, температура до 37,5 °C.",
        patient: snapshotOf(DEMO_PROFILE),
        own: true,
        urgency: "yellow",
        anamnesis:
          "Жалобы: Слабость и кашель.\nДлительность симптомов: 4–7 дней.\nТемпература тела: субфебрильная (37,1–38,0 °C).\n«Красные флаги»: не отмечены.\nAI-триаж: Жёлтый уровень срочности, рекомендован терапевт.",
        status: "completed",
        diagnosis: "ОРВИ, острый трахеит (J04.1)",
        prescriptions:
          "Обильное тёплое питьё до 2 л/сут. Ингаляции с физраствором 2 раза в день 5 дней. Парацетамол 500 мг при температуре выше 38,5 °C. Повторный осмотр при сохранении кашля более 10 дней.",
        ticket: "MC-7KQ2PX",
        createdAt: now,
        completedAt: now,
      },
      {
        id: "seed-q-1",
        doctorId: "d3",
        date: d(1),
        time: "09:30",
        complaints: "Давящая боль за грудиной при подъёме по лестнице, давление 165/100.",
        patient: { fullName: "Ермеков Даурен Асланович", phone: "+7 707 555 12 40", bloodGroup: "III", rh: "+", chronic: "Артериальная гипертензия", allergies: "" },
        own: false,
        urgency: "red",
        anamnesis:
          "Жалобы: Давление и пульс; давящая боль за грудиной при нагрузке.\nДлительность симптомов: 1–3 дня.\nТемпература тела: нормальная (до 37,0 °C).\n«Красные флаги»: острая, внезапная или нарастающая боль, одышка, нехватка воздуха.\nAI-триаж: Красный уровень срочности, рекомендован кардиолог.",
        status: "upcoming",
        ticket: "MC-R4D9TW",
        createdAt: now,
      },
      {
        id: "seed-q-2",
        doctorId: "d7",
        date: d(1),
        time: "11:00",
        complaints: "У сына (5 лет) температура 38,6 °C второй день, насморк.",
        patient: { fullName: "Смирнова Анна Олеговна (сын Михаил, 5 лет)", phone: "+7 778 300 44 21", bloodGroup: "I", rh: "-", chronic: "", allergies: "Ибупрофен" },
        own: false,
        urgency: "yellow",
        anamnesis:
          "Жалобы: Температура у ребёнка; насморк.\nДлительность симптомов: 1–3 дня.\nТемпература тела: высокая (38,1–39,0 °C).\n«Красные флаги»: не отмечены.\nAI-триаж: Жёлтый уровень срочности, рекомендован педиатр.",
        status: "upcoming",
        ticket: "MC-P8L3NA",
        createdAt: now,
      },
      {
        id: "seed-q-3",
        doctorId: "d5",
        date: d(2),
        time: "15:00",
        complaints: "Периодические головные боли к вечеру, плановая консультация.",
        patient: { fullName: "Абенова Сауле Тимуровна", phone: "+7 705 120 98 76", bloodGroup: "IV", rh: "+", chronic: "Мигрень", allergies: "" },
        own: false,
        urgency: "green",
        anamnesis: null,
        status: "upcoming",
        ticket: "MC-G2V6HM",
        createdAt: now,
      },
    ],
  };
}

function loadData(): MedCareData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedData();
    const parsed = JSON.parse(raw) as Partial<MedCareData>;
    return {
      profile: { ...EMPTY_PROFILE, ...parsed.profile },
      privacy: { ...DEFAULT_PRIVACY, ...parsed.privacy },
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
      lastTriage: parsed.lastTriage ?? null,
    };
  } catch {
    return createSeedData();
  }
}

interface NewAppointmentInput {
  doctorId: string;
  date: string;
  time: string;
  complaints: string;
  urgency: Urgency | null;
  anamnesis: string | null;
}

interface MedCareContextValue {
  hydrated: boolean;
  data: MedCareData;
  role: Role;
  setRole: (r: Role) => void;
  tab: PatientTab;
  setTab: (t: PatientTab) => void;
  specialtyFilter: Specialty | "all";
  setSpecialtyFilter: (s: Specialty | "all") => void;
  booking: BookingDraft | null;
  openBooking: (draft: BookingDraft) => void;
  closeBooking: () => void;
  bookFromTriage: (result: TriageResult) => void;
  settingsOpen: boolean;
  setSettingsOpen: (o: boolean) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  updatePrivacy: (patch: Partial<Privacy>) => void;
  setLastTriage: (t: TriageResult | null) => void;
  addAppointment: (input: NewAppointmentInput) => Appointment;
  cancelAppointment: (id: string) => void;
  completeAppointment: (id: string, diagnosis: string, prescriptions: string) => void;
  clearAll: () => void;
}

// Keep one context object across hot module reloads: when this file is re-executed during
// development, a fresh createContext() would orphan the already-mounted Provider and every
// consumer would read null ("useMedCare must be used inside MedCareProvider").
const globalStore = globalThis as typeof globalThis & {
  __medcareContext?: Context<MedCareContextValue | null>;
};
const MedCareContext =
  globalStore.__medcareContext ?? (globalStore.__medcareContext = createContext<MedCareContextValue | null>(null));

export function MedCareProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MedCareData>(() => ({
    profile: EMPTY_PROFILE,
    privacy: DEFAULT_PRIVACY,
    appointments: [],
    lastTriage: null,
  }));
  const [hydrated, setHydrated] = useState(false);
  const [role, setRole] = useState<Role>("patient");
  const [tab, setTab] = useState<PatientTab>("doctors");
  const [specialtyFilter, setSpecialtyFilter] = useState<Specialty | "all">("all");
  const [booking, setBooking] = useState<BookingDraft | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setData(loadData());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or unavailable */
    }
  }, [data, hydrated]);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setData((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
  }, []);

  const updatePrivacy = useCallback((patch: Partial<Privacy>) => {
    setData((d) => ({ ...d, privacy: { ...d.privacy, ...patch } }));
  }, []);

  const setLastTriage = useCallback((t: TriageResult | null) => {
    setData((d) => ({ ...d, lastTriage: t }));
  }, []);

  const addAppointment = useCallback(
    (input: NewAppointmentInput): Appointment => {
      const appt: Appointment = {
        id: generateId(),
        ...input,
        patient: snapshotOf(data.profile),
        own: true,
        status: "upcoming",
        ticket: generateTicket(),
        createdAt: new Date().toISOString(),
      };
      setData((d) => ({ ...d, appointments: [...d.appointments, appt] }));
      return appt;
    },
    [data.profile],
  );

  const cancelAppointment = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      appointments: d.appointments.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)),
    }));
  }, []);

  const completeAppointment = useCallback((id: string, diagnosis: string, prescriptions: string) => {
    setData((d) => ({
      ...d,
      appointments: d.appointments.map((a) =>
        a.id === id
          ? { ...a, status: "completed", diagnosis, prescriptions, completedAt: new Date().toISOString() }
          : a,
      ),
    }));
  }, []);

  const clearAll = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setData({ profile: EMPTY_PROFILE, privacy: DEFAULT_PRIVACY, appointments: [], lastTriage: null });
    setBooking(null);
  }, []);

  const openBooking = useCallback((draft: BookingDraft) => setBooking(draft), []);
  const closeBooking = useCallback(() => setBooking(null), []);

  const bookFromTriage = useCallback((result: TriageResult) => {
    const doctor = bestDoctorFor(result.specialty);
    setRole("patient");
    setTab("doctors");
    setSpecialtyFilter(result.specialty);
    setBooking({
      doctorId: doctor.id,
      complaints: result.anamnesis,
      urgency: result.urgency,
      anamnesis: result.anamnesis,
    });
  }, []);

  const value = useMemo<MedCareContextValue>(
    () => ({
      hydrated,
      data,
      role,
      setRole,
      tab,
      setTab,
      specialtyFilter,
      setSpecialtyFilter,
      booking,
      openBooking,
      closeBooking,
      bookFromTriage,
      settingsOpen,
      setSettingsOpen,
      updateProfile,
      updatePrivacy,
      setLastTriage,
      addAppointment,
      cancelAppointment,
      completeAppointment,
      clearAll,
    }),
    [hydrated, data, role, tab, specialtyFilter, booking, openBooking, closeBooking, bookFromTriage, settingsOpen, updateProfile, updatePrivacy, setLastTriage, addAppointment, cancelAppointment, completeAppointment, clearAll],
  );

  return <MedCareContext.Provider value={value}>{children}</MedCareContext.Provider>;
}

export function useMedCare(): MedCareContextValue {
  const ctx = useContext(MedCareContext);
  if (!ctx) throw new Error("useMedCare must be used inside MedCareProvider");
  return ctx;
}
