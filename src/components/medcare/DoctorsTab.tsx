import { Award, Bot, MapPin, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DOCTORS } from "@/lib/medcare/data";
import { formatPrice, initials } from "@/lib/medcare/format";
import { useMedCare } from "@/lib/medcare/store";
import { SPECIALTIES } from "@/lib/medcare/types";
import { Chip } from "./primitives";

function yearsWord(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "год";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "года";
  return "лет";
}

export function DoctorsTab() {
  const { specialtyFilter, setSpecialtyFilter, openBooking, setTab } = useMedCare();
  const list = DOCTORS.filter((d) => specialtyFilter === "all" || d.specialty === specialtyFilter);

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-5 text-primary-foreground shadow-lift sm:p-7">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl font-bold sm:text-3xl">Запись к врачу за минуту</h1>
          <p className="mt-2 text-sm text-primary-foreground/85 sm:text-base">
            Выберите специалиста или пройдите AI-триаж — он подскажет, к кому идти и что подготовить.
          </p>
          <Button
            variant="secondary"
            className="mt-4 rounded-xl bg-card text-primary hover:bg-card/90"
            onClick={() => setTab("ai")}
          >
            <Bot /> Пройти AI-триаж
          </Button>
        </div>
        <div aria-hidden className="absolute -right-10 -top-10 size-48 rounded-full bg-primary-foreground/10" />
        <div aria-hidden className="absolute -bottom-16 right-16 size-40 rounded-full bg-primary-foreground/10" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip active={specialtyFilter === "all"} onClick={() => setSpecialtyFilter("all")}>
          Все специальности
        </Chip>
        {SPECIALTIES.map((s) => (
          <Chip key={s} active={specialtyFilter === s} onClick={() => setSpecialtyFilter(s)}>
            {s}
          </Chip>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((d) => (
          <article
            key={d.id}
            className="animate-rise flex flex-col rounded-2xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-lift sm:p-5"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-brand font-display text-lg font-bold text-primary-foreground">
                {initials(d.name)}
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold leading-snug text-foreground">{d.name}</h3>
                <span className="mt-1 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {d.specialty}
                </span>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Award className="size-4 text-primary" />
                <span>
                  Стаж <b className="text-foreground">{d.experience} {yearsWord(d.experience)}</b>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Star className="size-4 fill-warning text-warning" />
                <span>
                  <b className="text-foreground">{d.rating.toFixed(1)}</b> · {d.reviews} отз.
                </span>
              </div>
              <div className="col-span-2 flex items-start gap-1.5 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="min-w-0">{d.clinic}</span>
              </div>
            </dl>

            <div className="mt-auto flex items-center justify-between gap-3 pt-4">
              <div>
                <div className="text-xs text-muted-foreground">Приём</div>
                <div className="font-display text-lg font-bold text-foreground">{formatPrice(d.price)}</div>
              </div>
              <Button
                variant="hero"
                className="rounded-xl"
                onClick={() => openBooking({ doctorId: d.id, complaints: "", urgency: null, anamnesis: null })}
              >
                Записаться
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
