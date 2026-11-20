import { AlertTriangle, CheckCircle2, ClipboardPlus, Droplet, Hourglass, Siren, Sparkles, Stethoscope } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getDoctor } from "@/lib/medcare/data";
import { formatBlood, formatDateLong } from "@/lib/medcare/format";
import { useMedCare } from "@/lib/medcare/store";
import type { Appointment, Urgency } from "@/lib/medcare/types";
import { URGENCY_STYLE } from "@/lib/medcare/urgency";
import { Card, Chip, EmptyState, InfoRow, Segmented, UrgencyBadge } from "./primitives";

type UrgencyFilter = "all" | Urgency;
const URGENCY_ORDER: Record<string, number> = { red: 0, yellow: 1, green: 2, none: 3 };

function PatientCard({ appt }: { appt: Appointment }) {
  const { completeAppointment } = useMedCare();
  const doctor = getDoctor(appt.doctorId);
  const [diagnosis, setDiagnosis] = useState("");
  const [prescriptions, setPrescriptions] = useState("");
  const p = appt.patient;
  const accent = appt.urgency ? URGENCY_STYLE[appt.urgency].dot : "bg-muted-foreground/40";

  return (
    <Card className="animate-rise relative overflow-hidden pl-5 sm:pl-6">
      <span className={cn("absolute inset-y-0 left-0 w-1.5", accent)} aria-hidden />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-foreground">{p.fullName || "Пациент"}</h3>
          <div className="text-sm text-muted-foreground">
            {formatDateLong(appt.date)}, {appt.time} · {doctor?.name} ({doctor?.specialty})
          </div>
        </div>
        <UrgencyBadge urgency={appt.urgency} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <InfoRow
          label="Группа крови"
          value={
            <span className="inline-flex items-center gap-1 font-semibold">
              <Droplet className="size-3.5 text-urgent" /> {formatBlood(p.bloodGroup, p.rh)}
            </span>
          }
        />
        <InfoRow
          label="Аллергии"
          value={
            p.allergies ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-urgent-soft px-1.5 font-semibold text-urgent-ink">
                <AlertTriangle className="size-3.5" /> {p.allergies}
              </span>
            ) : (
              "Не указаны"
            )
          }
        />
        <InfoRow label="Хронические" value={p.chronic || "Нет"} />
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Жалобы пациента</div>
          <p className="mt-1 whitespace-pre-line text-sm text-foreground">{appt.complaints}</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-secondary/60 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
            <Sparkles className="size-3.5" /> Анамнез AI-триажа
          </div>
          <p className="mt-1.5 whitespace-pre-line text-sm text-foreground">
            {appt.anamnesis ?? "Пациент не проходил AI-триаж или не дал согласие на передачу его данных."}
          </p>
        </div>
      </div>

      {appt.status === "upcoming" ? (
        <form
          className="mt-4 space-y-3 border-t border-border pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!diagnosis.trim()) return;
            completeAppointment(appt.id, diagnosis.trim(), prescriptions.trim());
            toast.success("Приём завершён", { description: "Заключение отправлено в медкарту пациента" });
          }}
        >
          <h4 className="flex items-center gap-2 font-semibold text-foreground">
            <ClipboardPlus className="size-4 text-primary" /> Осмотр
          </h4>
          <div className="space-y-1.5">
            <Label htmlFor={`dx-${appt.id}`}>Предварительный диагноз</Label>
            <Textarea id={`dx-${appt.id}`} rows={2} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Например: ОРВИ, острый ринофарингит (J00)" className="rounded-xl bg-card" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`rx-${appt.id}`}>Назначения и рекомендации</Label>
            <Textarea id={`rx-${appt.id}`} rows={3} value={prescriptions} onChange={(e) => setPrescriptions(e.target.value)} placeholder="Препараты, дозировки, режим, повторный приём" className="rounded-xl bg-card" />
          </div>
          <Button type="submit" variant="hero" className="w-full rounded-xl sm:w-auto" disabled={!diagnosis.trim()}>
            <CheckCircle2 /> Завершить приём
          </Button>
        </form>
      ) : (
        <div className="mt-4 space-y-2 rounded-xl border border-success/30 bg-success-soft p-3 text-success-ink">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <CheckCircle2 className="size-4" /> Заключение врача
          </div>
          <p className="text-sm"><b>Диагноз:</b> {appt.diagnosis}</p>
          {appt.prescriptions && <p className="whitespace-pre-line text-sm"><b>Назначения:</b> {appt.prescriptions}</p>}
        </div>
      )}
    </Card>
  );
}

export function DoctorCabinet() {
  const { data } = useMedCare();
  const [urgency, setUrgency] = useState<UrgencyFilter>("all");
  const [status, setStatus] = useState<"upcoming" | "completed">("upcoming");

  const active = data.appointments.filter((a) => a.status !== "cancelled");
  const waiting = active.filter((a) => a.status === "upcoming");
  const list = active
    .filter((a) => a.status === status)
    .filter((a) => urgency === "all" || (a.urgency ?? "green") === urgency)
    .sort(
      (a, b) =>
        (URGENCY_ORDER[a.urgency ?? "none"] ?? 3) - (URGENCY_ORDER[b.urgency ?? "none"] ?? 3) ||
        (a.date + a.time).localeCompare(b.date + b.time),
    );

  const stats = [
    { label: "Ожидают", value: waiting.length, icon: <Hourglass />, cls: "bg-secondary text-primary" },
    { label: "Срочные", value: waiting.filter((a) => a.urgency === "red").length, icon: <Siren />, cls: "bg-urgent-soft text-urgent" },
    { label: "Завершено", value: active.filter((a) => a.status === "completed").length, icon: <CheckCircle2 />, cls: "bg-success-soft text-success" },
  ];

  const urgencyOptions: { value: UrgencyFilter; label: string; dot?: string }[] = [
    { value: "all", label: "Все" },
    { value: "red", label: "Срочные", dot: "bg-urgent" },
    { value: "yellow", label: "Средний", dot: "bg-warning" },
    { value: "green", label: "Плановые", dot: "bg-success" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
          <Stethoscope className="size-6" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Кабинет врача</h1>
          <p className="text-sm text-muted-foreground">Очередь пациентов отсортирована по срочности AI-триажа.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:p-4">
            <span className={cn("grid size-9 place-items-center rounded-xl [&_svg]:size-5", s.cls)}>{s.icon}</span>
            <div>
              <div className="font-display text-2xl font-bold leading-none text-foreground">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {urgencyOptions.map((o) => (
            <Chip key={o.value} active={urgency === o.value} onClick={() => setUrgency(o.value)}>
              {o.dot && <span className={cn("size-2.5 rounded-full", o.dot)} />}
              {o.label}
            </Chip>
          ))}
        </div>
        <Segmented
          value={status}
          onChange={setStatus}
          options={[
            { value: "upcoming", label: "Ожидают" },
            { value: "completed", label: "Завершён" },
          ]}
        />
      </div>

      {list.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {list.map((a) => (
            <PatientCard key={a.id} appt={a} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<Hourglass />} title="Нет пациентов" text="По выбранным фильтрам записей не найдено." />
      )}
    </div>
  );
}
