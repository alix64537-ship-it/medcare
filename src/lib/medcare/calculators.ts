export type Tone = "success" | "warning" | "urgent" | "info";

export interface BMIResult {
  value: number;
  category: string;
  tone: Tone;
  advice: string;
}

export function calcBMI(weightKg: number, heightCm: number): BMIResult | null {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm)) return null;
  if (weightKg < 20 || weightKg > 350 || heightCm < 100 || heightCm > 250) return null;
  const h = heightCm / 100;
  const value = Math.round((weightKg / (h * h)) * 10) / 10;
  if (value < 18.5)
    return { value, category: "Дефицит массы тела", tone: "info", advice: "Рекомендуется консультация терапевта для выявления причин и подбора питания." };
  if (value < 25)
    return { value, category: "Нормальная масса тела", tone: "success", advice: "Отличный показатель. Поддерживайте активность и сбалансированное питание." };
  if (value < 30)
    return { value, category: "Избыточная масса тела", tone: "warning", advice: "Повышен риск сердечно-сосудистых заболеваний. Добавьте физическую активность и пересмотрите рацион." };
  if (value < 35)
    return { value, category: "Ожирение I степени", tone: "urgent", advice: "Рекомендуется консультация терапевта и контроль давления, глюкозы и холестерина." };
  if (value < 40)
    return { value, category: "Ожирение II степени", tone: "urgent", advice: "Высокий риск осложнений. Необходимо обследование у терапевта и эндокринолога." };
  return { value, category: "Ожирение III степени", tone: "urgent", advice: "Очень высокий риск осложнений. Обратитесь к врачу для составления плана лечения." };
}

export interface BPResult {
  category: string;
  tone: Tone;
  advice: string;
}

const BP_LEVELS: { category: string; tone: Tone; advice: string }[] = [
  { category: "Оптимальное давление", tone: "success", advice: "Давление в идеальном диапазоне. Контролируйте его раз в год." },
  { category: "Нормальное давление", tone: "success", advice: "Давление в норме. Проверяйте его при профилактических осмотрах." },
  { category: "Высокое нормальное давление", tone: "warning", advice: "Пограничные значения. Ограничьте соль, следите за весом и измеряйте давление регулярно." },
  { category: "Артериальная гипертензия 1 степени", tone: "warning", advice: "Рекомендуется плановая консультация терапевта или кардиолога и ведение дневника давления." },
  { category: "Артериальная гипертензия 2 степени", tone: "urgent", advice: "Требуется консультация кардиолога в ближайшие дни для подбора терапии." },
  { category: "Артериальная гипертензия 3 степени", tone: "urgent", advice: "Опасно высокие значения. При головной боли, боли в груди или одышке срочно звоните 103 / 112." },
];

function sysLevel(s: number): number {
  if (s < 120) return 0;
  if (s < 130) return 1;
  if (s < 140) return 2;
  if (s < 160) return 3;
  if (s < 180) return 4;
  return 5;
}

function diaLevel(d: number): number {
  if (d < 80) return 0;
  if (d < 85) return 1;
  if (d < 90) return 2;
  if (d < 100) return 3;
  if (d < 110) return 4;
  return 5;
}

/** ESH/ESC classification: the higher of systolic/diastolic categories wins. */
export function assessBP(systolic: number, diastolic: number): BPResult | null {
  if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) return null;
  if (systolic < 50 || systolic > 300 || diastolic < 30 || diastolic > 200) return null;
  if (diastolic >= systolic) return null;
  const level = Math.max(sysLevel(systolic), diaLevel(diastolic));
  if (level === 0 && (systolic < 90 || diastolic < 60)) {
    return {
      category: "Пониженное давление (гипотензия)",
      tone: "info",
      advice: "Если беспокоят слабость, головокружение или обмороки — обратитесь к терапевту.",
    };
  }
  return BP_LEVELS[level];
}
