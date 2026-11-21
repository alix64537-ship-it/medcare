import { CalendarClock, ClipboardCheck, Droplet, Eye, FileHeart, FlaskConical, MessageCircle, Pill, QrCode, Repeat, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDoctor } from "@/lib/medcare/data";
import { formatAge, formatBlood, formatDateLong } from "@/lib/medcare/format";
import { repeatVisitComplaint } from "@/lib/medcare/chat";
import { useMedCare } from "@/lib/medcare/store";
import { MAIN_MEMBER_ID, type Appointment } from "@/lib/medcare/types";
import { TicketView } from "./BookingDialog";
import { FamilySwitcher } from "./FamilySwitcher";
import { LabSummary } from "./LabSummary";
import { Card, EmptyState, Segmented, UrgencyBadge } from "./primitives";

function UpcomingCard({ appt }: { appt: Appointment }) {
  const { cancelAppointment } = useMedCare();
  const doctor = getDoctor(appt.doctorId);
  const [showTicket, setShowTicket] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  return (
    <Card className="animate-rise space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CalendarClock className="size-4" />
            {formatDateLong(appt.date)}, {appt.time}
          </div>
          <h3 className="mt-1 font-semibold text-foreground">{doctor?.name}</h3>
          <p className="text-sm text-muted-foreground">
            {doctor?.specialty} · {doctor?.clinic}
          </p>
        </div>
        <UrgencyBadge urgency={appt.urgency} />
      </div>
      <p className="line-clamp-3 whitespace-pre-line rounded-xl bg-muted p-3 text-sm text-foreground">{appt.complaints}</p>
      {showTicket && <TicketView appt={appt} />}
      <div className="flex flex-wrap gap-2">
        <Button variant="soft" size="sm" className="rounded-lg" onClick={() => setShowTicket((v) => !v)}>
          <QrCode /> {showTicket ? "Скрыть талон" : `Талон ${appt.ticket}`}
        </Button>
        {!confirmCancel ? (
          <Button variant="ghost" size="sm" className="rounded-lg text-urgent-ink" onClick={() => setConfirmCancel(true)}>
            <X /> Отменить запись
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Отменить приём?</span>
            <Button
              variant="danger"
              size="sm"
              className="rounded-lg"
              onClick={() => {
                cancelAppointment(appt.id);
                toast("Запись отменена");
              }}
            >
              Да, отменить
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setConfirmCancel(false)}>
              Нет
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function CompletedCard({ appt }: { appt: Appointment }) {
  const { data, openChat, openBooking, setActiveMember } = useMedCare();
  const unread = (data.chats[appt.id] ?? []).length;
  const doctor = getDoctor(appt.doctorId);
  const [revealed, setRevealed] = useState(false);
  const hidden = data.privacy.privateScreen && !revealed;

  return (
    <Card className="animate-rise space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium text-muted-foreground">
            {formatDateLong(appt.date)}, {appt.time}
          </div>
          <h3 className="mt-1 font-semibold text-foreground">{doctor?.name}</h3>
          <p className="text-sm text-muted-foreground">{doctor?.specialty}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success-ink">
          <ClipboardCheck className="size-3.5" /> Завершён
        </span>
      </div>

      <div className="relative rounded-2xl border border-primary/20 bg-secondary/60 p-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-secondary-foreground">
          <FileHeart className="size-4" /> Заключение врача и назначения
        </h4>
        <div className={cn("mt-3 space-y-3 transition-all", hidden && "privacy-blur")} aria-hidden={hidden}>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Диагноз</div>
            <p className="mt-0.5 text-sm font-semibold text-foreground">{appt.diagnosis}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Pill className="size-3.5" /> Назначения и рекомендации
            </div>
            <p className="mt-0.5 whitespace-pre-line text-sm text-foreground">{appt.prescriptions || "—"}</p>
          </div>
        </div>
        {hidden && (
          <div className="absolute inset-0 grid place-items-center">
            <Button variant="outline" size="sm" className="rounded-lg bg-card shadow-card" onClick={() => setRevealed(true)}>
              <Eye /> Показать
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="soft" className="rounded-xl" onClick={() => openChat(appt.id)}>
          <MessageCircle /> Чат с врачом
          {unread > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{unread}</span>}
        </Button>
        <Button
          variant="hero"
          className="rounded-xl"
          onClick={() => {
            setActiveMember(appt.memberId);
            openBooking({
              doctorId: appt.doctorId,
              complaints: repeatVisitComplaint(appt, formatDateLong(appt.date)),
              urgency: null,
              anamnesis: null,
            });
          }}
        >
          <Repeat /> Повторный приём
        </Button>
      </div>
    </Card>
  );
}

export function MedRecordTab() {
  const { data, setTab, setSettingsOpen, activeMember } = useMedCare();
  const [view, setView] = useState<"upcoming" | "completed">("upcoming");
  const own = data.appointments.filter((a) => a.own && a.memberId === activeMember.id);
  const labs = data.labs
    .filter((l) => l.memberId === activeMember.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const isMain = activeMember.id === MAIN_MEMBER_ID;
  const upcoming = own
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const completed = own
    .filter((a) => a.status === "completed")
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  const profile = activeMember;

  return (
    <div className="space-y-5">
      <FamilySwitcher />

      <Card className="flex flex-wrap items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-urgent-soft text-urgent">
          <Droplet className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">ICE-карта</div>
          <div className="font-semibold text-foreground">
            {profile.fullName || "Профиль не заполнен"}
            {profile.birthDate && <span className="font-normal text-muted-foreground"> · {formatAge(profile.birthDate)}</span>}
          </div>
          <div className="text-sm text-muted-foreground">
            Кровь: {formatBlood(profile.bloodGroup, profile.rh)} · Аллергии: {profile.allergies || "нет данных"}
          </div>
        </div>
        {isMain && (
          <Button variant="soft" size="sm" className="rounded-lg" onClick={() => setSettingsOpen(true)}>
            Профиль
          </Button>
        )}
      </Card>

      <Segmented
        value={view}
        onChange={setView}
        options={[
          { value: "upcoming", label: `Предстоящие (${upcoming.length})` },
          { value: "completed", label: `Завершённые (${completed.length})` },
        ]}
      />

      {view === "upcoming" &&
        (upcoming.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {upcoming.map((a) => (
              <UpcomingCard key={a.id} appt={a} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CalendarClock />}
            title="Нет предстоящих приёмов"
            text="Запишитесь к врачу или пройдите AI-триаж, чтобы подобрать специалиста."
            action={
              <Button variant="hero" className="rounded-xl" onClick={() => setTab("doctors")}>
                Записаться к врачу
              </Button>
            }
          />
        ))}

      {view === "completed" &&
        (completed.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {completed.map((a) => (
              <CompletedCard key={a.id} appt={a} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<FileHeart />} title="Пока нет завершённых приёмов" text="Здесь появятся заключения и назначения врачей." />
        ))}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <FlaskConical className="size-5 text-primary" /> Анализы ({labs.length})
          </h2>
          <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setTab("calc")}>
            Расшифровать новый анализ
          </Button>
        </div>
        {labs.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {labs.map((l) => (
              <LabSummary key={l.id} lab={l} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
            Сохранённых анализов пока нет. Расшифруйте анализ во вкладке «Медкалькулятор» и сохраните его в медкарту.
          </p>
        )}
      </section>
    </div>
  );
}
