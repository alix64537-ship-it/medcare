import { ArrowLeft, ArrowRight, Bot, CalendarPlus, Check, ClipboardList, RotateCcw, ShieldCheck, Siren, Stethoscope } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { bestDoctorFor } from "@/lib/medcare/data";
import { formatPrice } from "@/lib/medcare/format";
import { useMedCare } from "@/lib/medcare/store";
import { DURATION_OPTIONS, QUICK_TAGS, RED_FLAG_OPTIONS, runTriage, TEMPERATURE_OPTIONS, URGENCY_TEXT } from "@/lib/medcare/triage";
import type { Duration, RedFlag, Temperature, TriageResult } from "@/lib/medcare/types";
import { URGENCY_STYLE } from "@/lib/medcare/urgency";
import { Card, Chip } from "./primitives";

const STEPS = ["Жалобы", "Уточнение", "Заключение"];

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-all",
              i < step && "bg-success text-primary-foreground",
              i === step && "bg-gradient-brand text-primary-foreground shadow-glow",
              i > step && "bg-muted text-muted-foreground",
            )}
          >
            {i < step ? <Check className="size-4" /> : i + 1}
          </span>
          <span className={cn("hidden text-sm font-medium sm:inline", i === step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
          {i < STEPS.length - 1 && <span className={cn("h-0.5 flex-1 rounded-full", i < step ? "bg-success" : "bg-border")} />}
        </li>
      ))}
    </ol>
  );
}

function Question({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="flex items-center gap-2 font-semibold text-foreground">
        <span className="grid size-6 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">{n}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export function TriageTab() {
  const { data, setLastTriage, bookFromTriage, activeMember } = useMedCare();
  const [step, setStep] = useState(0);
  const [complaint, setComplaint] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [temperature, setTemperature] = useState<Temperature | null>(null);
  const [redFlags, setRedFlags] = useState<RedFlag[] | null>(null);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const step1Ready = complaint.trim().length > 2 || tags.length > 0;
  const step2Ready = !!duration && !!temperature && redFlags !== null;

  function toggleTag(label: string) {
    setTags((t) => (t.includes(label) ? t.filter((x) => x !== label) : [...t, label]));
  }

  function toggleFlag(f: RedFlag) {
    setRedFlags((cur) => {
      const list = cur ?? [];
      return list.includes(f) ? list.filter((x) => x !== f) : [...list, f];
    });
  }

  function finish() {
    if (!duration || !temperature || redFlags === null) return;
    const r = runTriage(
      { complaint, tags, duration, temperature, redFlags },
      { anonymize: data.privacy.anonymizeAI, patientName: activeMember.fullName },
    );
    setResult(r);
    setLastTriage(r);
    setChecked(new Set());
    setStep(2);
  }

  function restart() {
    setStep(0);
    setComplaint("");
    setTags([]);
    setDuration(null);
    setTemperature(null);
    setRedFlags(null);
    setResult(null);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
          <Bot className="size-6" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">AI-помощник: клинический триаж</h1>
          <p className="text-sm text-muted-foreground">Три шага — и вы узнаете срочность, нужного врача и что подготовить к приёму.</p>
        </div>
      </div>

      <Stepper step={step} />

      {step === 0 && (
        <Card className="animate-rise space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Что вас беспокоит?</h2>
            <p className="text-sm text-muted-foreground">Опишите симптомы своими словами или выберите быстрый вариант.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((t) => (
              <Chip key={t.label} active={tags.includes(t.label)} onClick={() => toggleTag(t.label)}>
                {t.label}
              </Chip>
            ))}
          </div>
          <Textarea
            rows={4}
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Например: второй день болит голова, к вечеру сильнее, иногда тошнит"
            className="rounded-xl bg-card"
          />
          <p className="text-xs text-muted-foreground">
            Профиль: <b className="text-foreground">{activeMember.relation}</b> — {activeMember.fullName || "без имени"}
          </p>
          {data.privacy.anonymizeAI && (
            <p className="flex items-center gap-1.5 text-xs text-primary">
              <ShieldCheck className="size-3.5" /> Анонимизация включена: ФИО не попадёт в анамнез.
            </p>
          )}
          <div className="flex justify-end">
            <Button variant="hero" size="lg" disabled={!step1Ready} onClick={() => setStep(1)}>
              Далее <ArrowRight />
            </Button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card className="animate-rise space-y-6">
          <Question n={1} title="Как долго длятся симптомы?">
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((o) => (
                <Chip key={o.value} active={duration === o.value} onClick={() => setDuration(o.value)}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </Question>

          <Question n={2} title="Какая температура тела?">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TEMPERATURE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={temperature === o.value}
                  onClick={() => setTemperature(o.value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    temperature === o.value ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-border bg-card hover:border-primary/50",
                  )}
                >
                  <div className="text-sm font-semibold">{o.label}</div>
                  <div className="text-xs opacity-80">{o.hint}</div>
                </button>
              ))}
            </div>
          </Question>

          <Question n={3} title="Есть ли «красные флаги»?">
            <div className="grid gap-2">
              {RED_FLAG_OPTIONS.map((o) => {
                const on = redFlags?.includes(o.value) ?? false;
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleFlag(o.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-all",
                      on ? "border-urgent/50 bg-urgent-soft text-urgent-ink" : "border-border bg-card hover:border-urgent/40",
                    )}
                  >
                    <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border", on ? "border-urgent bg-urgent text-primary-foreground" : "border-input")}>
                      {on && <Check className="size-3.5" />}
                    </span>
                    {o.label}
                  </button>
                );
              })}
              <button
                type="button"
                aria-pressed={redFlags !== null && redFlags.length === 0}
                onClick={() => setRedFlags([])}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-all",
                  redFlags !== null && redFlags.length === 0 ? "border-success/50 bg-success-soft text-success-ink" : "border-border bg-card hover:border-success/40",
                )}
              >
                <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border", redFlags !== null && redFlags.length === 0 ? "border-success bg-success text-primary-foreground" : "border-input")}>
                  {redFlags !== null && redFlags.length === 0 && <Check className="size-3.5" />}
                </span>
                Нет, таких симптомов нет
              </button>
            </div>
          </Question>

          <div className="flex flex-wrap justify-between gap-2">
            <Button variant="outline" size="lg" onClick={() => setStep(0)}>
              <ArrowLeft /> Назад
            </Button>
            <Button variant="hero" size="lg" disabled={!step2Ready} onClick={finish}>
              Получить заключение <ArrowRight />
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && result && <TriageResultView result={result} checked={checked} setChecked={setChecked} onRestart={restart} onBook={() => bookFromTriage(result)} />}
    </div>
  );
}

function TriageResultView({
  result,
  checked,
  setChecked,
  onRestart,
  onBook,
}: {
  result: TriageResult;
  checked: Set<number>;
  setChecked: (s: Set<number>) => void;
  onRestart: () => void;
  onBook: () => void;
}) {
  const u = URGENCY_TEXT[result.urgency];
  const style = URGENCY_STYLE[result.urgency];
  const doctor = bestDoctorFor(result.specialty);

  return (
    <div className="animate-rise space-y-4">
      <div className={cn("rounded-2xl border-2 p-5", style.panel)}>
        <div className="flex items-center gap-3">
          <span className={cn("grid size-11 shrink-0 place-items-center rounded-full text-primary-foreground", style.dot)}>
            <Siren className="size-5" />
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">Уровень срочности: {u.level}</div>
            <div className="font-display text-lg font-bold leading-tight sm:text-xl">{u.title}</div>
          </div>
        </div>
        <p className="mt-3 text-sm">{u.advice}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="flex items-center gap-2 font-semibold text-foreground">
            <Stethoscope className="size-5 text-primary" /> Рекомендуемый специалист
          </h3>
          <div className="font-display text-2xl font-bold text-primary">{result.specialty}</div>
          <p className="text-sm text-muted-foreground">
            Ближайший с лучшим рейтингом: <b className="text-foreground">{doctor.name}</b>, {formatPrice(doctor.price)}
          </p>
        </Card>
        <Card className="space-y-3">
          <h3 className="flex items-center gap-2 font-semibold text-foreground">
            <ClipboardList className="size-5 text-primary" /> Подготовьте к приёму
          </h3>
          <ul className="space-y-1.5">
            {result.tests.map((t, i) => {
              const on = checked.has(i);
              return (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() => {
                      const n = new Set(checked);
                      if (on) n.delete(i);
                      else n.add(i);
                      setChecked(n);
                    }}
                    className="flex w-full items-start gap-2.5 rounded-lg p-1 text-left text-sm hover:bg-muted"
                  >
                    <span className={cn("mt-0.5 grid size-4.5 shrink-0 place-items-center rounded border", on ? "border-success bg-success text-primary-foreground" : "border-input")}>
                      {on && <Check className="size-3" />}
                    </span>
                    <span className={cn(on && "text-muted-foreground line-through")}>{t}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card className="space-y-2">
        <h3 className="font-semibold text-foreground">Собранный анамнез</h3>
        <pre className="whitespace-pre-wrap break-words rounded-xl bg-muted p-3 font-sans text-sm text-foreground">{result.anamnesis}</pre>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="hero" size="lg" className="h-auto min-h-11 flex-1 whitespace-normal py-2.5" onClick={onBook}>
          <CalendarPlus /> Записаться к специалисту с готовым анамнезом
        </Button>
        <Button variant="outline" size="lg" onClick={onRestart}>
          <RotateCcw /> Пройти заново
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        AI-триаж — вспомогательный инструмент и не является диагнозом. Окончательное решение принимает врач.
      </p>
    </div>
  );
}
