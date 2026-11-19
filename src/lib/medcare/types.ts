export type Specialty = "Терапевт" | "Кардиолог" | "Невролог" | "Педиатр";
export const SPECIALTIES: Specialty[] = ["Терапевт", "Кардиолог", "Невролог", "Педиатр"];

export type Urgency = "red" | "yellow" | "green";

export type BloodGroup = "I" | "II" | "III" | "IV" | "";
export type Rh = "+" | "-" | "";

export interface Doctor {
  id: string;
  name: string;
  specialty: Specialty;
  experience: number;
  clinic: string;
  rating: number;
  reviews: number;
  price: number;
}

export interface Profile {
  fullName: string;
  phone: string;
  bloodGroup: BloodGroup;
  rh: Rh;
  chronic: string;
  allergies: string;
}

export interface Privacy {
  consentMedData: boolean;
  shareTriageWithDoctor: boolean;
  anonymizeAI: boolean;
  privateScreen: boolean;
}

export type Duration = "lt1" | "1-3" | "4-7" | "gt7";
export type Temperature = "normal" | "subfebrile" | "high" | "very_high";
export type RedFlag = "acute_pain" | "dyspnea" | "severe_weakness";

export interface TriageInput {
  complaint: string;
  tags: string[];
  duration: Duration;
  temperature: Temperature;
  redFlags: RedFlag[];
}

export interface TriageResult {
  urgency: Urgency;
  specialty: Specialty;
  tests: string[];
  anamnesis: string;
  complaintSummary: string;
  createdAt: string;
}

export interface PatientSnapshot {
  fullName: string;
  phone: string;
  bloodGroup: BloodGroup;
  rh: Rh;
  chronic: string;
  allergies: string;
}

export type AppointmentStatus = "upcoming" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  complaints: string;
  patient: PatientSnapshot;
  own: boolean;
  urgency: Urgency | null;
  anamnesis: string | null;
  status: AppointmentStatus;
  diagnosis?: string;
  prescriptions?: string;
  ticket: string;
  createdAt: string;
  completedAt?: string;
}
