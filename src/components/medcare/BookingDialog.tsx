import { QRCodeSVG } from "qrcode.react";
import { AlertTriangle, CalendarCheck, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getDoctor, TIME_SLOTS } from "@/lib/medcare/data";
import { addDays, formatBlood, formatDateLong, formatDayChip, formatPrice, initials, toISODate } from "@/lib/medcare/format";
import { useMedCare } from "@/lib/medcare/store";
import type { Appointment } from "@/lib/medcare/types";
import { InfoRow, UrgencyBadge } from "./primitives";

function nextWorkDays(count: number): string[] {
  const days: string[] = [];
  let i = 1;
  while (days.length < count) {
    const d = addDays(new Date(), i++);
    if (d.getDay() !== 0) days.push(toISODate(d));
  }
  return days;
}

export function TicketView({ appt }: { appt: Appointment }) {
  const doctor = getDoctor(appt.doctorId);
  const payload = JSON.stringify({ ticket: appt.ticket, doctor: doctor?.name, date: appt.date, time: appt.time, patient: appt.patient.fullName });
  return (
    <div className="rounded-2xl border border-dashed border-primary/40 bg-secondary/60 p-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-xl bg-card p-3 shadow-card">
          <QRCodeSVG value={payload} size={132} level="M" />
        </div>
        <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Электронный талон</div>
          <div className="font-display text-2xl font-bold tracking-wider text-primary">{appt.ticket}</div>
          <div className="text-sm text-foreground">
            {formatDateLong(appt.date)}, {appt.time}
          </div>
          <div className="text-sm text-muted-foreground">
            {doctor?.name} · {doctor?.specialty}
            <br />
            {doctor?.clinic}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground sm:text-left">
        Покажите QR-код на ресепшене за 10 минут до приёма.
      </p>
    </div>
  );
}

export function BookingDialog() {
  const { booking, closeBooking, data, addAppointment, setSettingsOpen, setTab } = useMedCare();
  const doctor = booking ? getDoctor(booking.doctorId) : undefined;
  const days = useMemo(() => nextWorkDays(10), []);
  const [date, setDate] = useState<string>(days[0] ?? "");
  const [time, setTime] = useState<string | null>(null);
  const [complaints, setComplaints] = useState("");
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);

  useEffect(() => {
    if (booking) {
      setDate(days[0] ?? "");
      setTime(null);
      setComplaints(booking.complaints);
      setConfirmed(null);
    }
  }, [booking, days]);

  const taken = new Set(
    data.appointments
      .filter((a) => a.doctorId === booking?.doctorId && a.date === date && a.status === "upcoming")
      .map((a) => a.time),
  );

  const { profile, privacy } = data;
  const profileReady = profile.fullName.trim().length > 0 && profile.phone.trim().length > 0;
  const canSubmit = !!time && complaints.trim().length > 0 && profileReady && privacy.consentMedData;
  const hasTriage = !!booking?.anamnesis;

  function submit() {
    if (!booking || !time || !canSubmit) return;
    const share = privacy.shareTriageWithDoctor;
    const appt = addAppointment({
      doctorId: booking.doctorId,
      date,
      time,
      complaints: complaints.trim(),
      urgency: share ? booking.urgency : null,
      anamnesis: share ? booking.anamnesis : null,
    });
    setConfirmed(appt);
    toast.success("Запись подтверждена", { description: `Талон ${appt.ticket}` });
  }

  return (
    <Dialog open={!!booking} onOpenChange={(o) => !o && closeBooking()}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl p-5 sm:p-6">
        {doctor && !confirmed && (
          <>
            <DialogHeader className="text-left">
              <DialogTitle className="font-display text-xl">Запись на приём</DialogTitle>
              <DialogDescription>Выберите дату и время, проверьте жалобы и данные пациента.</DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3 rounded-2xl bg-secondary/70 p-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-brand font-display font-bold text-primary-foreground">
                {initials(doctor.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-foreground">{doctor.name}</div>
                <div className="text-sm text-muted-foreground">
                  {doctor.specialty} · {formatPrice(doctor.price)}
                </div>
              </div>
            </div>

            <section className="space-y-2">
              <Label className="text-sm font-semibold">Дата</Label>
              <div className="grid grid-cols-5 gap-2">
                {days.map((d) => {
                  const c = formatDayChip(d);
                  const active = d === date;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDate(d);
                        setTime(null);
                      }}
                      className={cn(
                        "flex flex-col items-center rounded-xl border px-1 py-2 text-xs transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-glow"
                          : "border-border bg-card hover:border-primary/50",
                      )}
                    >
                      <span className="capitalize opacity-80">{c.weekday}</span>
                      <span className="font-display text-lg font-bold leading-tight">{c.day}</span>
                      <span className="opacity-80">{c.month}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-2">
              <Label className="text-sm font-semibold">Время</Label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {TIME_SLOTS.map((t) => {
                  const busy = taken.has(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={busy}
                      onClick={() => setTime(t)}
                      className={cn(
                        "rounded-lg border py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through",
                        time === t
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/50",
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="complaints" className="text-sm font-semibold">
                  Жалобы
                </Label>
                {hasTriage && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <Sparkles className="size-3.5" /> Заполнено AI-триажем
                  </span>
                )}
              </div>
              {hasTriage && <UrgencyBadge urgency={booking?.urgency ?? null} />}
              <Textarea
                id="complaints"
                rows={hasTriage ? 7 : 4}
                value={complaints}
                onChange={(e) => setComplaints(e.target.value)}
                placeholder="Опишите, что вас беспокоит"
                className="rounded-xl bg-card"
              />
              {hasTriage && !privacy.shareTriageWithDoctor && (
                <p className="flex items-start gap-1.5 text-xs text-warning-ink">
                  <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
                  Передача данных AI-триажа врачу выключена в настройках: врач увидит только текст жалоб.
                </p>
              )}
            </section>

            <section className="space-y-3 rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">Данные пациента</h3>
                <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setSettingsOpen(true)}>
                  Изменить в профиле
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoRow label="ФИО" value={profile.fullName || "—"} />
                <InfoRow label="Телефон" value={profile.phone || "—"} />
                <InfoRow label="Группа крови" value={formatBlood(profile.bloodGroup, profile.rh)} />
                <InfoRow label="Аллергии" value={profile.allergies || "Нет данных"} />
              </div>
              {!profileReady && (
                <p className="flex items-start gap-1.5 text-xs text-urgent-ink">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  Укажите ФИО и телефон в медицинском профиле, чтобы записаться.
                </p>
              )}
            </section>

            {!privacy.consentMedData && (
              <p className="flex items-start gap-2 rounded-xl border border-urgent/30 bg-urgent-soft p-3 text-sm text-urgent-ink">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                Для записи необходимо согласие на обработку медицинских данных (Настройки → Конфиденциальность).
              </p>
            )}

            <Button variant="hero" size="lg" className="w-full" disabled={!canSubmit} onClick={submit}>
              <CalendarCheck />
              {time ? `Подтвердить запись · ${formatDateLong(date)}, ${time}` : "Выберите время приёма"}
            </Button>
          </>
        )}

        {confirmed && (
          <div className="space-y-4">
            <DialogHeader className="items-center text-center">
              <span className="grid size-14 place-items-center rounded-full bg-success-soft text-success">
                <CheckCircle2 className="size-8" />
              </span>
              <DialogTitle className="font-display text-xl">Вы записаны!</DialogTitle>
              <DialogDescription>Талон сохранён в вашей медкарте.</DialogDescription>
            </DialogHeader>
            <TicketView appt={confirmed} />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="hero"
                className="flex-1 rounded-xl"
                onClick={() => {
                  closeBooking();
                  setTab("record");
                }}
              >
                Открыть медкарту
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={closeBooking}>
                Готово
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
