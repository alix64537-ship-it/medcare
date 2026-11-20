import { describe, expect, it } from "vitest";

import { assessUrgency, detectSpecialty, runTriage } from "./triage";

describe("AI-триаж: срочность", () => {
  it("любой красный флаг даёт красный уровень", () => {
    expect(assessUrgency({ duration: "lt1", temperature: "normal", redFlags: ["dyspnea"] })).toBe("red");
  });
  it("температура выше 39 °C даёт красный уровень", () => {
    expect(assessUrgency({ duration: "lt1", temperature: "very_high", redFlags: [] })).toBe("red");
  });
  it("высокая температура без флагов — жёлтый", () => {
    expect(assessUrgency({ duration: "1-3", temperature: "high", redFlags: [] })).toBe("yellow");
  });
  it("симптомы больше недели — жёлтый", () => {
    expect(assessUrgency({ duration: "gt7", temperature: "normal", redFlags: [] })).toBe("yellow");
  });
  it("короткие симптомы без температуры — зелёный", () => {
    expect(assessUrgency({ duration: "lt1", temperature: "normal", redFlags: [] })).toBe("green");
  });
});

describe("AI-триаж: специалист", () => {
  it("тег «Давление и пульс» → кардиолог", () => {
    expect(detectSpecialty("", ["Давление и пульс"])).toBe("Кардиолог");
  });
  it("тег «Температура у ребёнка» → педиатр, даже вместе с другими", () => {
    expect(detectSpecialty("", ["Слабость и кашель", "Температура у ребёнка"])).toBe("Педиатр");
  });
  it("«болит голова» в тексте → невролог", () => {
    expect(detectSpecialty("Второй день болит голова", [])).toBe("Невролог");
  });
  it("по умолчанию → терапевт", () => {
    expect(detectSpecialty("Насморк", [])).toBe("Терапевт");
  });
});

describe("AI-триаж: анонимизация", () => {
  const input = { complaint: "кашель", tags: [], duration: "1-3" as const, temperature: "normal" as const, redFlags: [] };
  it("при анонимизации ФИО не попадает в анамнез", () => {
    const r = runTriage(input, { anonymize: true, patientName: "Иванов Иван" });
    expect(r.anamnesis).not.toContain("Иванов Иван");
  });
  it("без анонимизации ФИО есть в анамнезе", () => {
    const r = runTriage(input, { anonymize: false, patientName: "Иванов Иван" });
    expect(r.anamnesis).toContain("Иванов Иван");
  });
});
