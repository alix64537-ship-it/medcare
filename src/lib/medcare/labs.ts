import type { LabKey, LabValues } from "./types";

export type LabStatus = "normal" | "low" | "high";
export type LabSeverity = "ok" | "mild" | "severe";

interface LabDef {
  key: LabKey;
  name: string;
  unit: string;
  min: number;
  max: number;
  /** Values beyond these bounds are flagged red. */
  severeLow?: number;
  severeHigh?: number;
  example: number;
  low: string;
  high: string;
  normal: string;
}

/** Adult reference ranges (general, sex-independent approximation). */
export const LAB_DEFS: LabDef[] = [
  {
    key: "hgb", name: "Гемоглобин", unit: "г/л", min: 120, max: 160, severeLow: 90, severeHigh: 180, example: 112,
    low: "Признак анемии: возможен дефицит железа, B12 или кровопотеря. Рекомендуется ферритин и консультация терапевта.",
    high: "Возможны обезвоживание, курение или заболевания крови/лёгких. Повторите анализ и обсудите с терапевтом.",
    normal: "Кислородная функция крови в норме.",
  },
  {
    key: "wbc", name: "Лейкоциты", unit: "×10⁹/л", min: 4, max: 9, severeLow: 2, severeHigh: 15, example: 10.8,
    low: "Снижение иммунной защиты: бывает после вирусных инфекций или на фоне лекарств. Требует контроля.",
    high: "Чаще всего признак воспаления или инфекции. Оцените вместе с СРБ и симптомами.",
    normal: "Признаков воспаления по лейкоцитам нет.",
  },
  {
    key: "esr", name: "СОЭ", unit: "мм/ч", min: 2, max: 15, severeHigh: 30, example: 24,
    low: "Низкая СОЭ обычно не имеет клинического значения.",
    high: "Неспецифический маркер воспаления. Повышается при инфекциях, анемии, беременности.",
    normal: "Неспецифических признаков воспаления нет.",
  },
  {
    key: "glucose", name: "Глюкоза (натощак)", unit: "ммоль/л", min: 3.3, max: 5.5, severeLow: 2.8, severeHigh: 7, example: 5.1,
    low: "Гипогликемия: слабость, потливость, дрожь. Нужна консультация эндокринолога.",
    high: "Возможны преддиабет или сахарный диабет. Рекомендуется гликированный гемоглобин (HbA1c).",
    normal: "Углеводный обмен в норме.",
  },
  {
    key: "cholesterol", name: "Общий холестерин", unit: "ммоль/л", min: 3, max: 5.2, severeHigh: 6.2, example: 6.4,
    low: "Низкий холестерин встречается редко: возможны нарушения питания или работы щитовидной железы.",
    high: "Повышен риск атеросклероза. Рекомендуется липидный профиль и консультация кардиолога.",
    normal: "Сердечно-сосудистый риск по холестерину не повышен.",
  },
  {
    key: "crp", name: "С-реактивный белок", unit: "мг/л", min: 0, max: 5, severeHigh: 30, example: 12,
    low: "",
    high: "Маркер острого воспаления. Значения выше 30 мг/л часто указывают на бактериальную инфекцию.",
    normal: "Острого воспаления не выявлено.",
  },
];

export interface LabInterpretation {
  key: LabKey;
  name: string;
  unit: string;
  value: number;
  range: string;
  status: LabStatus;
  severity: LabSeverity;
  label: string;
  explanation: string;
}

function fmt(n: number): string {
  return String(n).replace(".", ",");
}

export function interpretLab(key: LabKey, value: number): LabInterpretation {
  const def = LAB_DEFS.find((d) => d.key === key) as LabDef;
  const range = def.min === 0 ? `< ${fmt(def.max)}` : `${fmt(def.min)}–${fmt(def.max)}`;
  let status: LabStatus = "normal";
  let severity: LabSeverity = "ok";
  if (value < def.min) {
    status = "low";
    severity = def.severeLow !== undefined && value < def.severeLow ? "severe" : "mild";
  } else if (value > def.max) {
    status = "high";
    severity = def.severeHigh !== undefined && value >= def.severeHigh ? "severe" : "mild";
  }
  const label = status === "normal" ? "Норма" : status === "low" ? "Понижен" : "Повышен";
  const explanation = status === "normal" ? def.normal : status === "low" ? def.low : def.high;
  return { key, name: def.name, unit: def.unit, value, range, status, severity, label, explanation };
}

export function interpretLabs(values: LabValues): LabInterpretation[] {
  return LAB_DEFS.filter((d) => typeof values[d.key] === "number" && Number.isFinite(values[d.key])).map((d) =>
    interpretLab(d.key, values[d.key] as number),
  );
}

export const EXAMPLE_LAB_VALUES: LabValues = Object.fromEntries(LAB_DEFS.map((d) => [d.key, d.example])) as LabValues;
