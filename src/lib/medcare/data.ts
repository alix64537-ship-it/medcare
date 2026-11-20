import type { Doctor, Specialty } from "./types";

export const DOCTORS: Doctor[] = [
  { id: "d1", name: "Сериков Арман Болатович", specialty: "Терапевт", experience: 12, clinic: "MedCare Алматы · пр. Абая, 52", rating: 4.9, reviews: 318, price: 9000 },
  { id: "d2", name: "Ким Елена Викторовна", specialty: "Терапевт", experience: 8, clinic: "MedCare Астана · Кабанбай батыра, 11", rating: 4.7, reviews: 204, price: 7500 },
  { id: "d3", name: "Жумабеков Нурлан Ерланович", specialty: "Кардиолог", experience: 18, clinic: "MedCare Алматы · пр. Абая, 52", rating: 4.9, reviews: 412, price: 14000 },
  { id: "d4", name: "Орлова Марина Сергеевна", specialty: "Кардиолог", experience: 10, clinic: "MedCare Астана · Кабанбай батыра, 11", rating: 4.8, reviews: 187, price: 12000 },
  { id: "d5", name: "Ахметова Динара Кайратовна", specialty: "Невролог", experience: 15, clinic: "MedCare Алматы · ул. Розыбакиева, 247", rating: 4.8, reviews: 265, price: 13000 },
  { id: "d6", name: "Лебедев Павел Андреевич", specialty: "Невролог", experience: 7, clinic: "MedCare Шымкент · пр. Тауке хана, 34", rating: 4.6, reviews: 98, price: 10000 },
  { id: "d7", name: "Исмаилова Айжан Маратовна", specialty: "Педиатр", experience: 14, clinic: "MedCare Алматы · ул. Розыбакиева, 247", rating: 5.0, reviews: 356, price: 10000 },
  { id: "d8", name: "Петренко Ольга Ивановна", specialty: "Педиатр", experience: 9, clinic: "MedCare Астана · Кабанбай батыра, 11", rating: 4.7, reviews: 142, price: 8500 },
];

export function getDoctor(id: string): Doctor | undefined {
  return DOCTORS.find((d) => d.id === id);
}

/** Highest-rated doctor of a specialty (ties → longer experience). */
export function bestDoctorFor(specialty: Specialty): Doctor {
  const list = DOCTORS.filter((d) => d.specialty === specialty).sort(
    (a, b) => b.rating - a.rating || b.experience - a.experience,
  );
  return (list[0] ?? DOCTORS[0]) as Doctor;
}

export const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
];
