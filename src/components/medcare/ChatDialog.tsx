import { SendHorizontal, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CHAT_TEMPLATES, chatGreeting, doctorReply } from "@/lib/medcare/chat";
import { getDoctor } from "@/lib/medcare/data";
import { formatDateLong, initials } from "@/lib/medcare/format";
import { useMedCare } from "@/lib/medcare/store";

function timeOf(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function ChatDialog() {
  const { chatApptId, closeChat, data, addChatMessage } = useMedCare();
  const appt = data.appointments.find((a) => a.id === chatApptId);
  const doctor = appt ? getDoctor(appt.doctorId) : undefined;
  const messages = chatApptId ? (data.chats[chatApptId] ?? []) : [];
  const [text, setText] = useState("");
  const [typingFor, setTypingFor] = useState<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, typingFor, chatApptId]);

  function send(raw: string) {
    const msg = raw.trim();
    if (!msg || !appt) return;
    const id = appt.id;
    addChatMessage(id, "patient", msg);
    setText("");
    setTypingFor((s) => new Set(s).add(id));
    const t = window.setTimeout(() => {
      addChatMessage(id, "doctor", doctorReply(msg, appt));
      setTypingFor((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }, 1400);
    timers.current.push(t);
  }

  const typing = !!chatApptId && typingFor.has(chatApptId);

  return (
    <Dialog open={!!appt} onOpenChange={(o) => !o && closeChat()}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="flex h-[85dvh] max-h-[680px] w-[calc(100vw-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl p-0"
      >
        {appt && doctor && (
          <>
            <div className="flex items-center gap-3 border-b border-border bg-card p-4 pr-12">
              <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-gradient-brand font-display font-bold text-primary-foreground">
                {initials(doctor.name)}
                <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-success" />
              </span>
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate text-base font-semibold">{doctor.name}</DialogTitle>
                <DialogDescription className="truncate text-xs">
                  {doctor.specialty} · онлайн · по визиту {formatDateLong(appt.date)}
                </DialogDescription>
              </div>
              <Video className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            </div>

            <div className="border-b border-border bg-secondary/60 px-4 py-2 text-xs text-secondary-foreground">
              <b>Диагноз:</b> {appt.diagnosis}
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/50 p-4">
              <Bubble from="doctor" text={chatGreeting(appt, doctor)} at={appt.completedAt ?? appt.createdAt} />
              {messages.map((m) => (
                <Bubble key={m.id} from={m.from} text={m.text} at={m.at} />
              ))}
              {typing && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex gap-1 rounded-2xl rounded-bl-sm bg-card px-3 py-2.5 shadow-card">
                    <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-primary" />
                  </span>
                  врач печатает…
                </div>
              )}
            </div>

            <div className="space-y-2 border-t border-border bg-card p-3">
              <div className="flex flex-wrap gap-1.5">
                {CHAT_TEMPLATES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => send(t)}
                    disabled={typing}
                    className="rounded-full border border-primary/30 bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    {t}
                  </button>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(text);
                }}
              >
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Напишите сообщение…"
                  aria-label="Сообщение врачу"
                  className="h-11 min-w-0 flex-1 rounded-xl bg-card"
                />
                <Button type="submit" variant="hero" size="icon" className="size-11 shrink-0 rounded-xl" disabled={!text.trim() || typing} aria-label="Отправить">
                  <SendHorizontal />
                </Button>
              </form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Bubble({ from, text, at }: { from: "patient" | "doctor"; text: string; at: string }) {
  const mine = from === "patient";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-line break-words rounded-2xl px-3.5 py-2 text-sm shadow-card",
          mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-card text-foreground",
        )}
      >
        {text}
        <div className={cn("mt-1 text-right text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{timeOf(at)}</div>
      </div>
    </div>
  );
}
