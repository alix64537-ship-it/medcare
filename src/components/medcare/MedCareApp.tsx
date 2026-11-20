import { Bot, Calculator, FileHeart, HeartPulse, Stethoscope } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { MedCareProvider, useMedCare, type PatientTab } from "@/lib/medcare/store";
import { AppHeader } from "./AppHeader";
import { BookingDialog } from "./BookingDialog";
import { CalculatorTab } from "./CalculatorTab";
import { DoctorCabinet } from "./DoctorCabinet";
import { DoctorsTab } from "./DoctorsTab";
import { MedRecordTab } from "./MedRecordTab";
import { SettingsDialog } from "./SettingsDialog";
import { TriageTab } from "./TriageTab";

const TABS: { value: PatientTab; label: string; icon: ReactNode }[] = [
  { value: "doctors", label: "Врачи и запись", icon: <Stethoscope /> },
  { value: "record", label: "Медкарта", icon: <FileHeart /> },
  { value: "calc", label: "Медкалькулятор", icon: <Calculator /> },
  { value: "ai", label: "AI-помощник", icon: <Bot /> },
];

function PatientView() {
  const { tab, setTab } = useMedCare();
  return (
    <>
      <nav aria-label="Разделы пациента" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            aria-current={tab === t.value ? "page" : undefined}
            onClick={() => setTab(t.value)}
            className={cn(
              "flex min-w-[calc(50%-0.25rem)] flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all sm:min-w-0 sm:flex-none sm:px-4 [&_svg]:size-4",
              tab === t.value
                ? "border-primary bg-primary text-primary-foreground shadow-glow"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>
      <div className="mt-5">
        {tab === "doctors" && <DoctorsTab />}
        {tab === "record" && <MedRecordTab />}
        {tab === "calc" && <CalculatorTab />}
        {tab === "ai" && <TriageTab />}
      </div>
    </>
  );
}

function Shell() {
  const { role, hydrated } = useMedCare();
  return (
    <div className="min-h-screen bg-gradient-mist">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-5 sm:py-8">
        {!hydrated ? (
          <div className="grid place-items-center py-24 text-muted-foreground">
            <HeartPulse className="size-8 animate-pulse text-primary" />
          </div>
        ) : role === "patient" ? (
          <PatientView />
        ) : (
          <DoctorCabinet />
        )}
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 pt-2 text-xs text-muted-foreground">
        © MedCare · Цифровая клиника. Информация не заменяет очную консультацию. Экстренная помощь: 103 / 112.
      </footer>
      {hydrated && (
        <>
          <BookingDialog />
          <SettingsDialog />
        </>
      )}
    </div>
  );
}

export function MedCareApp() {
  return (
    <MedCareProvider>
      <Shell />
    </MedCareProvider>
  );
}
