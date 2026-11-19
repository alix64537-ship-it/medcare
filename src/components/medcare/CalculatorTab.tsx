import { Activity, Scale } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { assessBP, calcBMI } from "@/lib/medcare/calculators";
import { TONE_STYLE } from "@/lib/medcare/urgency";
import { Card, SectionTitle } from "./primitives";

function NumField({ id, label, unit, value, onChange, placeholder }: { id: string; label: string; unit: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.replace(",", "."))}
          className="h-11 rounded-xl bg-card pr-16 text-base"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

const BMI_SCALE = [
  { to: 18.5, cls: "bg-info" },
  { to: 25, cls: "bg-success" },
  { to: 30, cls: "bg-warning" },
  { to: 40, cls: "bg-urgent" },
];

export function CalculatorTab() {
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("172");
  const [sys, setSys] = useState("125");
  const [dia, setDia] = useState("82");

  const bmi = calcBMI(parseFloat(weight), parseFloat(height));
  const bp = assessBP(parseFloat(sys), parseFloat(dia));
  const markerPos = bmi ? Math.min(100, Math.max(0, ((bmi.value - 15) / (40 - 15)) * 100)) : 0;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Card className="space-y-4">
        <SectionTitle icon={<Scale />} title="Индекс массы тела" subtitle="ИМТ по классификации ВОЗ" />
        <div className="grid grid-cols-2 gap-3">
          <NumField id="weight" label="Вес" unit="кг" value={weight} onChange={setWeight} placeholder="70" />
          <NumField id="height" label="Рост" unit="см" value={height} onChange={setHeight} placeholder="172" />
        </div>
        {bmi ? (
          <div className={cn("space-y-3 rounded-2xl border p-4", TONE_STYLE[bmi.tone])}>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-display text-4xl font-bold">{bmi.value.toFixed(1)}</span>
              <span className="font-semibold">{bmi.category}</span>
            </div>
            <div className="relative pt-1">
              <div className="flex h-2 overflow-hidden rounded-full">
                {BMI_SCALE.map((s, i) => {
                  const from = i === 0 ? 15 : BMI_SCALE[i - 1].to;
                  return <div key={s.to} className={s.cls} style={{ width: `${((s.to - from) / 25) * 100}%` }} />;
                })}
              </div>
              <div
                className="absolute top-0 size-4 -translate-x-1/2 rounded-full border-2 border-card bg-foreground shadow-card"
                style={{ left: `${markerPos}%` }}
              />
            </div>
            <p className="text-sm">{bmi.advice}</p>
          </div>
        ) : (
          <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">Введите вес (20–350 кг) и рост (100–250 см).</p>
        )}
      </Card>

      <Card className="space-y-4">
        <SectionTitle icon={<Activity />} title="Артериальное давление" subtitle="Оценка по ESH/ESC" />
        <div className="grid grid-cols-2 gap-3">
          <NumField id="sys" label="Систолическое (верхнее)" unit="мм" value={sys} onChange={setSys} placeholder="120" />
          <NumField id="dia" label="Диастолическое (нижнее)" unit="мм" value={dia} onChange={setDia} placeholder="80" />
        </div>
        {bp ? (
          <div className={cn("space-y-2 rounded-2xl border p-4", TONE_STYLE[bp.tone])}>
            <div className="font-display text-3xl font-bold">
              {sys}/{dia}
            </div>
            <div className="font-semibold">{bp.category}</div>
            <p className="text-sm">{bp.advice}</p>
          </div>
        ) : (
          <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            Введите реальные значения: верхнее больше нижнего, например 120/80.
          </p>
        )}
      </Card>

      <p className="text-xs text-muted-foreground md:col-span-2">
        Калькуляторы носят справочный характер и не заменяют консультацию врача.
      </p>
    </div>
  );
}
