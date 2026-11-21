import { FlaskConical } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDateLong } from "@/lib/medcare/format";
import { interpretLabs } from "@/lib/medcare/labs";
import type { LabResult } from "@/lib/medcare/types";
import { LAB_SEVERITY_STYLE } from "@/lib/medcare/urgency";

/** Compact list of a saved blood test with colored status per indicator. */
export function LabSummary({ lab, className }: { lab: LabResult; className?: string }) {
  const rows = interpretLabs(lab.values);
  const flagged = rows.filter((r) => r.status !== "normal").length;
  return (
    <div className={cn("rounded-xl border border-border bg-card p-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <FlaskConical className="size-4 text-primary" /> Анализ крови · {formatDateLong(lab.date)}
        </div>
        <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", flagged ? LAB_SEVERITY_STYLE.mild.badge : LAB_SEVERITY_STYLE.ok.badge)}>
          {flagged ? `Отклонений: ${flagged}` : "Всё в норме"}
        </span>
      </div>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {rows.map((r) => (
          <li key={r.key} className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-muted px-2.5 py-1.5 text-sm">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className={cn("size-2 shrink-0 rounded-full", LAB_SEVERITY_STYLE[r.severity].dot)} />
              <span className="truncate text-muted-foreground">{r.name}</span>
            </span>
            <span className="shrink-0 font-semibold text-foreground">
              {String(r.value).replace(".", ",")} <span className="text-xs font-normal text-muted-foreground">{r.unit}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
