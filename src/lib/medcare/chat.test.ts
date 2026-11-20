import { describe, expect, it } from "vitest";

import { doctorReply } from "./chat";
import type { Appointment } from "./types";

const appt = {
  diagnosis: "ОРВИ",
  prescriptions: "Парацетамол 500 мг при температуре выше 38,5 °C.",
} as Appointment;

describe("Автоответ врача", () => {
  it("на вопрос о дозировке повторяет назначения", () => {
    expect(doctorReply("Уточнить дозировку препарата", appt)).toContain("Парацетамол 500 мг");
  });
  it("на побочный эффект называет номер скорой 103", () => {
    expect(doctorReply("Появился побочный эффект", appt)).toContain("103");
  });
  it("при отсутствии улучшения предлагает повторный приём", () => {
    expect(doctorReply("Нет улучшения", appt)).toContain("Повторный приём");
  });
});
