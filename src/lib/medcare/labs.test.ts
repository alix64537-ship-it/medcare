import { describe, expect, it } from "vitest";

import { interpretLab, interpretLabs } from "./labs";

describe("Расшифровка анализов", () => {
  it("гемоглобин 135 г/л — норма", () => {
    expect(interpretLab("hgb", 135).status).toBe("normal");
  });
  it("гемоглобин 112 г/л — понижен, жёлтый", () => {
    const r = interpretLab("hgb", 112);
    expect([r.status, r.severity]).toEqual(["low", "mild"]);
  });
  it("гемоглобин 85 г/л — понижен, красный", () => {
    expect(interpretLab("hgb", 85).severity).toBe("severe");
  });
  it("лейкоциты 10,8 — повышены, жёлтый", () => {
    const r = interpretLab("wbc", 10.8);
    expect([r.status, r.severity]).toEqual(["high", "mild"]);
  });
  it("глюкоза 7,0 ммоль/л — повышена, красный", () => {
    expect(interpretLab("glucose", 7).severity).toBe("severe");
  });
  it("холестерин 5,2 — ещё норма, 6,2 — красный", () => {
    expect(interpretLab("cholesterol", 5.2).status).toBe("normal");
    expect(interpretLab("cholesterol", 6.2).severity).toBe("severe");
  });
  it("СРБ 12 мг/л — повышен, жёлтый", () => {
    expect(interpretLab("crp", 12).severity).toBe("mild");
  });
  it("пустые показатели не попадают в расшифровку", () => {
    expect(interpretLabs({ hgb: 130 }).map((r) => r.key)).toEqual(["hgb"]);
  });
});
