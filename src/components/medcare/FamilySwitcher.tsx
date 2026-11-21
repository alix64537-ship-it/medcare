import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatAge, givenName, initials } from "@/lib/medcare/format";
import { useMedCare } from "@/lib/medcare/store";
import type { BloodGroup, Rh } from "@/lib/medcare/types";
import { Chip } from "./primitives";

const RELATIONS = ["Ребёнок", "Родитель", "Супруг(а)", "Брат / сестра", "Бабушка / дедушка", "Другое"];

export function FamilySwitcher({ label = "Здоровье семьи", className }: { label?: string; className?: string }) {
  const { members, activeMember, setActiveMember } = useMedCare();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Users className="size-3.5" /> {label}
      </div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Профиль пациента">
        {members.map((m) => {
          const active = m.id === activeMember.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setActiveMember(m.id)}
              className={cn(
                "flex min-w-0 max-w-full items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-left transition-all",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-glow"
                  : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                  active ? "bg-primary-foreground/20" : "bg-secondary text-primary",
                )}
              >
                {initials(m.fullName) || "?"}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-semibold">{m.relation}</span>
                <span className={cn("block truncate text-xs", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {givenName(m.fullName) || "Без имени"}
                  {m.birthDate ? ` · ${formatAge(m.birthDate)}` : ""}
                </span>
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-dashed border-primary/50 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
        >
          <Plus className="size-4" /> Добавить члена семьи
        </button>
      </div>
      <AddMemberDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

function AddMemberDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addFamilyMember } = useMedCare();
  const [fullName, setFullName] = useState("");
  const [relation, setRelation] = useState("Ребёнок");
  const [birthDate, setBirthDate] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("");
  const [rh, setRh] = useState<Rh>("");
  const [allergies, setAllergies] = useState("");

  const valid = fullName.trim().length > 2 && relation;

  function reset() {
    setFullName("");
    setRelation("Ребёнок");
    setBirthDate("");
    setBloodGroup("");
    setRh("");
    setAllergies("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto rounded-2xl p-5 sm:p-6"
      >
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl">Новый член семьи</DialogTitle>
          <DialogDescription>У профиля будет своя история приёмов, анализов и медданных.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            const m = addFamilyMember({ fullName: fullName.trim(), relation, birthDate, bloodGroup, rh, allergies: allergies.trim(), chronic: "", phone: "" });
            toast.success("Профиль добавлен", { description: `${m.relation}: ${m.fullName}` });
            onOpenChange(false);
            reset();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="fm-name">ФИО</Label>
            <Input id="fm-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Фамилия Имя Отчество" className="h-10 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Родство</Label>
            <div className="flex flex-wrap gap-2">
              {RELATIONS.map((r) => (
                <Chip key={r} active={relation === r} onClick={() => setRelation(r)}>
                  {r}
                </Chip>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fm-birth">Дата рождения</Label>
            <Input id="fm-birth" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="h-10 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Группа крови</Label>
            <div className="flex flex-wrap gap-2">
              {(["I", "II", "III", "IV"] as BloodGroup[]).map((g) => (
                <Chip key={g} active={bloodGroup === g} onClick={() => setBloodGroup(g)} className="min-w-12 justify-center">
                  {g}
                </Chip>
              ))}
              {(["+", "-"] as Rh[]).map((r) => (
                <Chip key={r} active={rh === r} onClick={() => setRh(r)} className="min-w-14 justify-center">
                  Rh{r}
                </Chip>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fm-allergy">Аллергии</Label>
            <Textarea id="fm-allergy" rows={2} value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Например: амоксициллин" className="rounded-xl" />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={!valid}>
            Добавить профиль
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
