import { HeartPulse, Settings, Stethoscope, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMedCare } from "@/lib/medcare/store";
import { Segmented } from "./primitives";

export function AppHeader() {
  const { role, setRole, setSettingsOpen } = useMedCare();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2.5 px-4 py-3">
        <div className="mr-auto flex min-w-0 items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
            <HeartPulse className="size-5" />
          </span>
          <div className="min-w-0 leading-tight">
            <div className="font-display text-lg font-bold text-foreground">MedCare</div>
            <div className="truncate text-xs text-muted-foreground">цифровая клиника</div>
          </div>
        </div>

        <Segmented
          className="order-3 sm:order-none sm:w-auto"
          value={role}
          onChange={setRole}
          options={[
            { value: "patient", label: <><User className="size-4" /> Я пациент</> },
            { value: "doctor", label: <><Stethoscope className="size-4" /> Я врач</> },
          ]}
        />

        <Button
          variant="soft"
          size="icon"
          className="rounded-xl"
          aria-label="Настройки и конфиденциальность"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings />
        </Button>
      </div>
    </header>
  );
}
