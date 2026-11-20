import { Download, Lock, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useMedCare } from "@/lib/medcare/store";
import type { BloodGroup, Privacy, Rh } from "@/lib/medcare/types";
import { Chip } from "./primitives";

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-border p-4">
      <h3 className="flex items-center gap-2 font-semibold text-foreground [&_svg]:size-5 [&_svg]:text-primary">
        {icon} {title}
      </h3>
      {children}
    </section>
  );
}

const PRIVACY_ITEMS: { key: keyof Privacy; title: string; text: string }[] = [
  { key: "consentMedData", title: "Согласие на обработку медданных", text: "Необходимо для записи к врачу и хранения медкарты." },
  { key: "shareTriageWithDoctor", title: "Передавать данные AI-триажа врачу", text: "Врач увидит срочность и собранный анамнез до приёма." },
  { key: "anonymizeAI", title: "Анонимизация при AI-анализе", text: "ФИО не включается в анамнез, формируемый AI-помощником." },
  { key: "privateScreen", title: "Приватный экран", text: "Диагнозы в медкарте размыты до нажатия «Показать»." },
];

export function SettingsDialog() {
  const { settingsOpen, setSettingsOpen, data, updateProfile, updatePrivacy, clearAll } = useMedCare();
  const { profile, privacy } = data;
  const [confirmClear, setConfirmClear] = useState(false);

  function exportJSON() {
    const payload = { exportedAt: new Date().toISOString(), app: "MedCare", ...data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medcare-medkarta-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Медкарта экспортирована");
  }

  return (
    <Dialog
      open={settingsOpen}
      onOpenChange={(o) => {
        setSettingsOpen(o);
        if (!o) setConfirmClear(false);
      }}
    >
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl p-5 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl">Настройки и конфиденциальность</DialogTitle>
          <DialogDescription>Изменения сохраняются автоматически на этом устройстве.</DialogDescription>
        </DialogHeader>

        <Section icon={<UserRound />} title="Медицинский профиль (ICE-карта)">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fio">ФИО</Label>
              <Input id="fio" value={profile.fullName} onChange={(e) => updateProfile({ fullName: e.target.value })} placeholder="Фамилия Имя Отчество" className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" type="tel" value={profile.phone} onChange={(e) => updateProfile({ phone: e.target.value })} placeholder="+7 7__ ___ __ __" className="h-10 rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Группа крови</Label>
            <div className="flex flex-wrap gap-2">
              {(["I", "II", "III", "IV"] as BloodGroup[]).map((g) => (
                <Chip key={g} active={profile.bloodGroup === g} onClick={() => updateProfile({ bloodGroup: g })} className="min-w-12 justify-center">
                  {g}
                </Chip>
              ))}
              <span className="mx-1 w-px self-stretch bg-border" />
              {(["+", "-"] as Rh[]).map((r) => (
                <Chip key={r} active={profile.rh === r} onClick={() => updateProfile({ rh: r })} className="min-w-14 justify-center">
                  Rh{r}
                </Chip>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="chronic">Хронические заболевания</Label>
            <Textarea id="chronic" rows={2} value={profile.chronic} onChange={(e) => updateProfile({ chronic: e.target.value })} placeholder="Например: бронхиальная астма" className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="allergies">Аллергии на лекарства</Label>
            <Textarea id="allergies" rows={2} value={profile.allergies} onChange={(e) => updateProfile({ allergies: e.target.value })} placeholder="Например: пенициллин, ибупрофен" className="rounded-xl" />
          </div>
        </Section>

        <Section icon={<Lock />} title="Конфиденциальность и врачебная тайна">
          <ul className="divide-y divide-border">
            {PRIVACY_ITEMS.map((item) => (
              <li key={item.key} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <label htmlFor={`pv-${item.key}`} className="min-w-0 cursor-pointer">
                  <div className="text-sm font-medium text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.text}</div>
                </label>
                <Switch id={`pv-${item.key}`} checked={privacy[item.key]} onCheckedChange={(v) => updatePrivacy({ [item.key]: v })} className="mt-0.5" />
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={<ShieldCheck />} title="Управление данными">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="soft" className="flex-1 rounded-xl" onClick={exportJSON}>
              <Download /> Экспорт медкарты (JSON)
            </Button>
            {!confirmClear ? (
              <Button variant="danger" className="flex-1 rounded-xl" onClick={() => setConfirmClear(true)}>
                <Trash2 /> Очистить локальные данные
              </Button>
            ) : (
              <Button
                variant="destructive"
                className="flex-1 rounded-xl"
                onClick={() => {
                  clearAll();
                  setConfirmClear(false);
                  toast("Локальные данные удалены");
                }}
              >
                <Trash2 /> Подтвердить удаление
              </Button>
            )}
          </div>
          {confirmClear && <p className="text-xs text-urgent-ink">Профиль, записи и заключения будут удалены с этого устройства без возможности восстановления.</p>}
        </Section>
      </DialogContent>
    </Dialog>
  );
}
