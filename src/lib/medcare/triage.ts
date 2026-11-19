import type { Duration, RedFlag, Specialty, Temperature, TriageInput, TriageResult, Urgency } from "./types";

export const QUICK_TAGS: { label: string; specialty: Specialty }[] = [
  { label: "Давление и пульс", specialty: "Кардиолог" },
  { label: "Головная боль и головокружение", specialty: "Невролог" },
  { label: "Температура у ребёнка", specialty: "Педиатр" },
  { label: "Слабость и кашель", specialty: "Терапевт" },
];

export const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: "lt1", label: "Менее суток" },
  { value: "1-3", label: "1–3 дня" },
  { value: "4-7", label: "4–7 дней" },
  { value: "gt7", label: "Более недели" },
];

export const TEMPERATURE_OPTIONS: { value: Temperature; label: string; hint: string }[] = [
  { value: "normal", label: "Нормальная", hint: "до 37,0 °C" },
  { value: "subfebrile", label: "Субфебрильная", hint: "37,1–38,0 °C" },
  { value: "high", label: "Высокая", hint: "38,1–39,0 °C" },
  { value: "very_high", label: "Очень высокая", hint: "выше 39,0 °C" },
];

export const RED_FLAG_OPTIONS: { value: RedFlag; label: string }[] = [
  { value: "acute_pain", label: "Острая, внезапная или нарастающая боль" },
  { value: "dyspnea", label: "Одышка, нехватка воздуха" },
  { value: "severe_weakness", label: "Резкая слабость, онемение, спутанность сознания" },
];

const KEYWORDS: { specialty: Specialty; pattern: RegExp }[] = [
  { specialty: "Педиатр", pattern: /(ребён|ребен|дет[еяи]|малыш|сын|дочь|дочк|младен)/i },
  { specialty: "Кардиолог", pattern: /(давлен|пульс|сердц|сердеч|тахикард|аритм|за грудин)/i },
  { specialty: "Невролог", pattern: /(голов|мигрен|головокруж|онемен|судорог|спин[аеы]|поясниц)/i },
];

/** Children → pediatrician first; then cardio, neuro; therapist by default. */
export function detectSpecialty(complaint: string, tags: string[]): Specialty {
  const fromTags = QUICK_TAGS.filter((t) => tags.includes(t.label)).map((t) => t.specialty);
  const fromText = KEYWORDS.filter((k) => k.pattern.test(complaint)).map((k) => k.specialty);
  const all = new Set<Specialty>([...fromTags, ...fromText]);
  for (const s of ["Педиатр", "Кардиолог", "Невролог"] as Specialty[]) {
    if (all.has(s)) return s;
  }
  return "Терапевт";
}

export function assessUrgency(input: Pick<TriageInput, "duration" | "temperature" | "redFlags">): Urgency {
  if (input.redFlags.length > 0 || input.temperature === "very_high") return "red";
  if (
    input.temperature === "high" ||
    input.duration === "gt7" ||
    (input.temperature === "subfebrile" && input.duration === "4-7")
  ) {
    return "yellow";
  }
  return "green";
}

const BASE_TESTS: Record<Specialty, string[]> = {
  Терапевт: ["Общий анализ крови (ОАК)", "Общий анализ мочи (ОАМ)", "С-реактивный белок (СРБ)", "Флюорография или рентген грудной клетки (при кашле)"],
  Кардиолог: ["ЭКГ в покое", "Липидный профиль (холестерин, ЛПНП, ЛПВП)", "Глюкоза крови натощак", "Дневник давления и пульса за 3–7 дней"],
  Невролог: ["Общий анализ крови (ОАК)", "Глюкоза крови", "Дневник головной боли и давления", "Выписки прошлых МРТ/КТ (если есть)"],
  Педиатр: ["Общий анализ крови (ОАК)", "Общий анализ мочи (ОАМ)", "Температурный лист за последние дни", "Прививочный паспорт ребёнка"],
};

export function testsFor(specialty: Specialty, urgency: Urgency): string[] {
  const list = [...BASE_TESTS[specialty]];
  if (urgency === "red") list.unshift("Не откладывайте визит: анализы можно сдать в день приёма");
  list.push("Список принимаемых лекарств и выписки прошлых обследований");
  return list;
}

export const URGENCY_TEXT: Record<Urgency, { level: string; title: string; advice: string }> = {
  red: {
    level: "Красный",
    title: "Срочно — нужна помощь сегодня",
    advice: "Есть признаки, требующие неотложной оценки. При угрозе жизни звоните 103 или 112. Запишитесь на ближайшее время.",
  },
  yellow: {
    level: "Жёлтый",
    title: "Средний — приём в ближайшие 1–2 дня",
    advice: "Состояние требует очного осмотра в ближайшие дни. Следите за симптомами; при ухудшении обратитесь срочно.",
  },
  green: {
    level: "Зелёный",
    title: "Плановый — можно записаться в удобное время",
    advice: "Опасных признаков не выявлено. Запишитесь на плановый приём и подготовьте анализы из чек-листа.",
  },
};

function labelOf<T extends string>(list: { value: T; label: string }[], v: T): string {
  return list.find((o) => o.value === v)?.label ?? v;
}

export function runTriage(
  input: TriageInput,
  opts: { anonymize: boolean; patientName?: string },
): TriageResult {
  const specialty = detectSpecialty(input.complaint, input.tags);
  const urgency = assessUrgency(input);
  const complaintParts = [...input.tags, input.complaint.trim()].filter(Boolean);
  const complaintSummary = complaintParts.join("; ");
  const temp = TEMPERATURE_OPTIONS.find((t) => t.value === input.temperature);
  const flags = input.redFlags.map((f) => labelOf(RED_FLAG_OPTIONS, f).toLowerCase());

  const lines = [
    opts.anonymize
      ? "Пациент: [анонимизировано]"
      : opts.patientName
        ? `Пациент: ${opts.patientName}`
        : null,
    `Жалобы: ${complaintSummary}.`,
    `Длительность симптомов: ${labelOf(DURATION_OPTIONS, input.duration).toLowerCase()}.`,
    `Температура тела: ${temp ? `${temp.label.toLowerCase()} (${temp.hint})` : input.temperature}.`,
    `«Красные флаги»: ${flags.length ? flags.join(", ") : "не отмечены"}.`,
    `AI-триаж: ${URGENCY_TEXT[urgency].level} уровень срочности, рекомендован ${specialty.toLowerCase()}.`,
  ].filter(Boolean);

  return {
    urgency,
    specialty,
    tests: testsFor(specialty, urgency),
    anamnesis: lines.join("\n"),
    complaintSummary,
    createdAt: new Date().toISOString(),
  };
}
