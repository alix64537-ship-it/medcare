import { describe, expect, it } from "vitest";

import { assessBP, calcBMI } from "./calculators";

describe("ИМТ", () => {
  it("70 кг / 175 см = 22.9, норма", () => {
    const r = calcBMI(70, 175);
    expect(r?.value).toBe(22.9);
    expect(r?.category).toBe("Нормальная масса тела");
  });
  it("95 кг / 175 см — ожирение I степени", () => {
    expect(calcBMI(95, 175)?.category).toBe("Ожирение I степени");
  });
  it("50 кг / 175 см — дефицит массы", () => {
    expect(calcBMI(50, 175)?.category).toBe("Дефицит массы тела");
  });
});

describe("Артериальное давление", () => {
  it("118/76 — оптимальное", () => {
    expect(assessBP(118, 76)?.category).toBe("Оптимальное давление");
  });
  it("145/85 — АГ 1 степени (берётся худшая категория)", () => {
    expect(assessBP(145, 85)?.category).toBe("Артериальная гипертензия 1 степени");
  });
  it("185/95 — АГ 3 степени", () => {
    expect(assessBP(185, 95)?.category).toBe("Артериальная гипертензия 3 степени");
  });
  it("85/55 — гипотензия", () => {
    expect(assessBP(85, 55)?.category).toBe("Пониженное давление (гипотензия)");
  });
  it("нижнее не может быть выше верхнего", () => {
    expect(assessBP(80, 120)).toBeNull();
  });
});
