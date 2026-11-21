import { FlaskConical, Save, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toISODate } from "@/lib/medcare/format";
import { EXAMPLE_LAB_VALUES, interpretLabs, LAB_DEFS, type LabInterpretation } from "@/lib/medcare/labs";
import { useMedCare } from "@/lib/medcare/store";
import type { LabKey, LabValues } from "@/lib/medcare/types";
import { LAB_SEVERITY_STYLE } from "@/lib/medcare/urgency";
import { FamilySwitcher } from "./FamilySwitcher";
import { Card, SectionTitle } from "./primitives";

type Draft = Record<LabKey, string>;
const EMPTY_DRAFT = Object.fromEntries(LAB_DEFS.map((d) => [d.key, ""])) as Draft;

function toValues(draft: Draft): LabValues {
  const values: LabValues = {};
  for (const d of LAB_DEFS) {
    const n = parseFloat(draft[d.key].replace(",", "."));
    if (Number.isFinite(n) && n >= 0) values[d.key] = n;
  }
  return values;
}

export function LabDecoder() {
  const { activeMember, saveLab, setTab } = useMedCare();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [results, setResults] = useState<LabInterpretation[] | null>(null);
  const [savedFor, setSavedFor] = useState<string | null>(null);

  function update(key: LabKey, v: string) {
    setDraft((d) => ({ ...d, [key]: v }));
    setResults(null);
    setSavedFor(null);
  }

  function fillExample() {
    setDraft(Object.fromEntries(LAB_DEFS.map((d) => [d.key, String(EXAMPLE_LAB_VALUES[d.key]).replace(".", ",")])) as Draft);
    setResults(null);
    setSavedFor(null);
  }

  const values = toValues(draft);
  const hasValues = Object.keys(values).length > 0;

  return (
    <Card className="space-y-5 md:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionTitle icon={<FlaskConical />} title="Расшифровка анализов" subtitle="Общий и биохимический анализ крови, нормы для взрослых" />
        <Button variant="soft" size="sm" className="rounded-lg" onClick={fillExample}>
          <Wand2 /> Заполнить пример анализа
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LAB_DEFS.map((d) => (
          <div key={d.key} className="min-w-0 space-y-1.5">
            <Label htmlFor={`lab-${d.key}`} className="block truncate">
              {d.name}
            </Label>
            <div className="relative">
              <Input
                id={`lab-${d.key}`}
                inputMode="decimal"
                value={draft[d.key]}
                onChange={(e) => update(d.key, e.target.value)}
                placeholder={d.min === 0 ? `< ${d.max}` : `${d.min}–${d.max}`}
                className="h-11 rounded-xl bg-card pr-16 text-base"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 max-w-14 -translate-y-1/2 truncate text-xs text-muted-foreground">{d.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5 sm:w-48">
          <Label htmlFor="lab-date">Дата сдачи</Label>
          <Input id="lab-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl bg-card" />
        </div>
        <Button variant="hero" size="lg" className="sm:flex-1" disabled={!hasValues} onClick={() => setResults(interpretLabs(values))}>
          <Sparkles /> Расшифровать
        </Button>
      </div>

      {results && (
        <div className="animate-rise space-y-3">
          <ul className="space-y-2">
            {results.map((r) => {
              const st = LAB_SEVERITY_STYLE[r.severity];
              return (
                <li key={r.key} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground">{r.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Норма: {r.range} {r.unit}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-bold text-foreground">
                        {String(r.value).replace(".", ",")}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">{r.unit}</span>
                      </span>
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", st.badge)}>
                        <span className={cn("size-2 rounded-full", st.dot)} />
                        {r.label}
                      </span>
                    </div>
                  </div>
                  {r.explanation && <p className="mt-2 text-sm text-muted-foreground">{r.explanation}</p>}
                </li>
              );
            })}
          </ul>

          <div className="space-y-3 rounded-2xl border border-primary/20 bg-secondary/50 p-4">
            <FamilySwitcher label="Сохранить в медкарту профиля" />
            {savedFor === activeMember.id ? (
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-success-ink">
                Сохранено в медкарту: {activeMember.relation}.
                <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setTab("record")}>
                  Открыть медкарту
                </Button>
              </div>
            ) : (
              <Button
                variant="hero"
                className="w-full rounded-xl sm:w-auto"
                onClick={() => {
                  saveLab(values, date);
                  setSavedFor(activeMember.id);
                  toast.success("Анализ сохранён", { description: `Врач увидит его на приёме · ${activeMember.relation}` });
                }}
              >
                <Save /> Сохранить для «{activeMember.relation}»
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Расшифровка носит справочный характер; интерпретацию результатов проводит врач.</p>
        </div>
      )}
    </Card>
  );
}
