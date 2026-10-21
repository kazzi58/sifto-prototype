import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, LayoutList, Layers, Repeat, PartyPopper } from "lucide-react";
import { AppShell, Avatar, catStyle } from "@/components/AppShell";
import { actions, dueLabel, isTask, useStore, whoName, type Item } from "@/lib/store";

type F = "mine" | "everyone" | "today" | "upcoming";
const filters: [F, string][] = [["mine", "Mine"], ["everyone", "Everyone"], ["today", "Today"], ["upcoming", "Upcoming"]];

export const Route = createFileRoute("/tasks")({
  validateSearch: (s: Record<string, unknown>): { f?: F | undefined } => ({ f: filters.some(([k]) => k === s["f"]) ? (s["f"] as F) : undefined }),
  head: () => ({
    meta: [
      { title: "Sifto — Tasks" },
      { name: "description", content: "Swipe through your household tasks one card at a time." },
      { property: "og:title", content: "Sifto — Tasks" },
      { property: "og:description", content: "Get household things done, one card at a time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TasksScreen,
});

const apply = (f: F, i: Item) =>
  f === "mine" ? i.who === "A" : f === "today" ? (i.due ?? 0) <= 0 : f === "upcoming" ? (i.due ?? 0) > 0 : true;

function TasksScreen() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const f: F = search.f ?? "mine";
  const { items } = useStore();
  const [list, setList] = useState(false);
  const [idx, setIdx] = useState(0);
  const deck = items.filter((i) => isTask(i) && !i.done && apply(f, i)).sort((a, b) => (a.due ?? 99) - (b.due ?? 99));
  const doneCount = items.filter((i) => isTask(i) && i.done && apply(f, i)).length;
  const i = Math.min(idx, Math.max(deck.length - 1, 0));
  useEffect(() => setIdx(0), [f]);

  const done = (id: number) => actions.complete(id);

  return (
    <AppShell tab="tasks">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">{deck.length} to do · {doneCount} done</p>
        </div>
        <button onClick={() => setList((l) => !l)} aria-label={list ? "Card view" : "List view"} className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-card">
          {list ? <Layers className="h-[18px] w-[18px]" /> : <LayoutList className="h-[18px] w-[18px]" />}
        </button>
      </header>

      <div className="mt-4 flex gap-1 rounded-full bg-muted p-1">
        {filters.map(([k, l]) => (
          <button key={k} onClick={() => navigate({ search: { f: k } })} className={`flex-1 rounded-full py-1.5 text-xs font-medium transition-all ${f === k ? "bg-card text-foreground shadow-card" : "text-muted-foreground"}`}>{l}</button>
        ))}
      </div>

      {deck.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-card p-8 text-center shadow-card animate-in fade-in zoom-in-95 duration-300">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary"><PartyPopper className="h-7 w-7" /></span>
          <p className="mt-4 text-xl font-semibold">All caught up</p>
          <p className="mt-1 text-sm text-muted-foreground">Nothing left here. Time for a cup of tea.</p>
        </div>
      ) : list ? (
        <ul className="mt-5 divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-card">
          {deck.map((t) => {
            const C = catStyle[t.cat];
            return (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => done(t.id)} aria-label={`Complete ${t.title}`} className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-muted-foreground/40 transition-colors hover:border-primary" />
                <button onClick={() => actions.open(t.id)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-medium">{t.title}</span>
                  <span className={`text-xs ${(t.due ?? 0) < 0 ? "text-urgent-fg" : "text-muted-foreground"}`}>{dueLabel(t.due, t.time)} · {whoName(t.who)}</span>
                </button>
                <C.icon className={`h-4 w-4 ${C.fg}`} />
              </li>
            );
          })}
        </ul>
      ) : (
        <Deck deck={deck} i={i} setI={setIdx} onDone={done} />
      )}
    </AppShell>
  );
}

function Deck({ deck, i, setI, onDone }: { deck: Item[]; i: number; setI: (n: number) => void; onDone: (id: number) => void }) {
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const start = useRef<number | null>(null);
  const go = (d: number) => setI((i + d + deck.length) % deck.length);
  const t = deck[i]!;
  const C = catStyle[t.cat];

  const finish = () => {
    setLeaving(true);
    setTimeout(() => { onDone(t.id); setLeaving(false); }, 260);
  };

  return (
    <div className="mt-6">
      <div className="relative h-[400px]">
        {[2, 1].map((o) => deck.length > o && (
          <div key={o} className={`absolute inset-x-0 top-0 h-[380px] rounded-[28px] ${catStyle[deck[(i + o) % deck.length]!.cat].bg} shadow-card transition-all duration-300`} style={{ transform: `translateY(${o * 12}px) scale(${1 - o * 0.05})`, opacity: 1 - o * 0.3 }} />
        ))}
        <div
          key={t.id}
          onPointerDown={(e) => { start.current = e.clientX; }}
          onPointerMove={(e) => { if (start.current !== null) setDx(e.clientX - start.current); }}
          onPointerUp={() => { if (dx < -70) go(1); else if (dx > 70) go(-1); start.current = null; setDx(0); }}
          onPointerCancel={() => { start.current = null; setDx(0); }}
          style={{ transform: leaving ? "translateY(-40px) scale(0.92)" : `translateX(${dx}px) rotate(${dx / 25}deg)`, opacity: leaving ? 0 : 1, transition: start.current !== null ? "none" : "all 260ms ease-out", touchAction: "pan-y" }}
          className={`absolute inset-x-0 top-0 flex h-[380px] select-none flex-col rounded-[28px] ${C.bg} p-6 shadow-card animate-in fade-in slide-in-from-bottom-4 duration-300`}
        >
          <div className="flex items-center justify-between">
            <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-card/70 ${C.fg}`}><C.icon className="h-6 w-6" /></span>
            <span className="text-xs font-medium text-muted-foreground">{i + 1} / {deck.length}</span>
          </div>
          <button onClick={() => actions.open(t.id)} className="mt-6 text-left">
            <h2 className="text-[26px] font-bold leading-tight tracking-tight">{t.title}</h2>
            {t.note && <p className="mt-2 line-clamp-2 text-sm text-foreground/70">{t.note}</p>}
          </button>
          <div className="mt-auto flex flex-wrap items-center gap-2 text-sm">
            {t.due !== null && <span className={`rounded-full bg-card/70 px-3 py-1 font-medium ${t.due < 0 ? "text-urgent-fg" : ""}`}>{dueLabel(t.due, t.time)}</span>}
            <span className="flex items-center gap-1.5 rounded-full bg-card/70 py-1 pl-1 pr-3 font-medium"><Avatar l={t.who} size="sm" />{whoName(t.who)}</span>
            {t.recurring && <span className="grid h-7 w-7 place-items-center rounded-full bg-card/70"><Repeat className="h-3.5 w-3.5" /></span>}
          </div>
          <button onClick={finish} className="mt-5 flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground shadow-fab transition-transform active:scale-[0.98]">
            <Check className="h-4 w-4" strokeWidth={3} />{t.cat === "bill" ? "Mark paid" : "Mark done"}
          </button>
        </div>
      </div>
      {deck.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-6">
          <button onClick={() => go(-1)} aria-label="Previous task" className="grid h-11 w-11 place-items-center rounded-full bg-card shadow-card"><ChevronLeft className="h-5 w-5" /></button>
          <p className="text-xs text-muted-foreground">Swipe to browse</p>
          <button onClick={() => go(1)} aria-label="Next task" className="grid h-11 w-11 place-items-center rounded-full bg-card shadow-card"><ChevronRight className="h-5 w-5" /></button>
        </div>
      )}
    </div>
  );
}
