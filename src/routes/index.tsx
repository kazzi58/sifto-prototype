import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell, Check, Leaf, ShoppingBasket, Sparkles, Receipt, Pin, Plus, Home, ListChecks,
  List, Users, ChevronRight, StickyNote, X, CheckSquare,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sifto — Home" },
      { name: "description", content: "Sifto: a shared household organiser for couples and families." },
      { property: "og:title", content: "Sifto — Home" },
      { property: "og:description", content: "Tasks, notes, groceries and bills for your home, together." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

type Cat = "plant" | "grocery" | "clean" | "bill";
const catStyle: Record<Cat, { icon: typeof Leaf; cls: string; name: string }> = {
  plant: { icon: Leaf, cls: "bg-cat-plant text-cat-plant-fg", name: "Plants" },
  grocery: { icon: ShoppingBasket, cls: "bg-cat-grocery text-cat-grocery-fg", name: "Groceries" },
  clean: { icon: Sparkles, cls: "bg-cat-clean text-cat-clean-fg", name: "Cleaning" },
  bill: { icon: Receipt, cls: "bg-cat-bill text-cat-bill-fg", name: "Bills" },
};

type When = "overdue" | "today" | "soon" | "later";
type Item = { id: number; title: string; due: string; when: When; cat: Cat; who: "A" | "S"; high?: boolean; done: boolean; doneAt?: string | undefined };

const initialItems: Item[] = [
  { id: 1, title: "Water the monstera", due: "Today", when: "today", cat: "plant", who: "A", done: true, doneAt: "8:10 am" },
  { id: 2, title: "Pick up groceries", due: "Today, 6 pm", when: "today", cat: "grocery", who: "S", high: true, done: false },
  { id: 3, title: "Clean the kitchen", due: "Today", when: "today", cat: "clean", who: "A", done: true, doneAt: "9:40 am" },
  { id: 4, title: "Electricity bill · £64.20", due: "Due yesterday", when: "overdue", cat: "bill", who: "A", done: false },
  { id: 5, title: "Take out recycling", due: "Today, 8 pm", when: "today", cat: "clean", who: "S", done: false },
  { id: 6, title: "Internet bill · £32.00", due: "Tomorrow", when: "soon", cat: "bill", who: "A", high: true, done: false },
  { id: 7, title: "Repot the fiddle leaf", due: "Sat", when: "later", cat: "plant", who: "S", done: false },
  { id: 8, title: "Deep clean bathroom", due: "Sun", when: "later", cat: "clean", who: "A", done: false },
];

const whenRank: Record<When, number> = { overdue: 0, today: 2, soon: 3, later: 4 };
const score = (i: Item) => (i.when === "overdue" ? 0 : i.high && i.when !== "later" ? 1 : whenRank[i.when]) * 10 + (i.high ? 0 : 1);
const who = (w: "A" | "S") => (w === "A" ? "You" : "Sam");

function Avatar({ l, tone, size = "md" }: { l: string; tone: "a" | "b"; size?: "sm" | "md" }) {
  return (
    <span className={`grid place-items-center rounded-full font-semibold ring-2 ring-background ${size === "sm" ? "h-5 w-5 text-[9px]" : "h-8 w-8 text-xs"} ${tone === "a" ? "bg-primary text-primary-foreground" : "bg-cat-grocery text-cat-grocery-fg"}`}>
      {l}
    </span>
  );
}

function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between px-1">
      <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}

function AttentionCard({ item, onDone }: { item: Item; onDone: () => void }) {
  const C = catStyle[item.cat];
  const overdue = item.when === "overdue";
  const isBill = item.cat === "bill";
  const label = overdue ? "Overdue" : item.when === "today" ? "Today" : "Soon";
  return (
    <li className={`flex items-center gap-3 rounded-2xl p-4 shadow-card transition-all ${overdue ? "bg-urgent" : "bg-card"}`}>
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${C.cls}`}><C.icon className="h-[18px] w-[18px]" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${overdue ? "bg-urgent-fg/10 text-urgent-fg" : item.when === "today" ? "bg-primary-soft text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{label}</span>
          {item.high && <span className="text-[10px] font-semibold uppercase tracking-wider text-urgent-fg">· High</span>}
        </div>
        <p className="mt-1 truncate text-[15px] font-semibold">{item.title}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={overdue ? "text-urgent-fg" : ""}>{item.due}</span> · {C.name} · <Avatar l={item.who} tone={item.who === "A" ? "a" : "b"} size="sm" /> {who(item.who)}
        </p>
      </div>
      {isBill ? (
        <button onClick={onDone} className="shrink-0 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground active:scale-95 transition-transform">Mark paid</button>
      ) : (
        <button onClick={onDone} aria-label={`Complete ${item.title}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full active:scale-90 transition-transform">
          <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-muted-foreground/40 hover:border-primary"><Check className="h-3.5 w-3.5 text-transparent" strokeWidth={3} /></span>
        </button>
      )}
    </li>
  );
}

function Dashboard() {
  const [items, setItems] = useState(initialItems);
  const [sheet, setSheet] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const todayScope = items.filter((i) => i.when !== "later" || i.done);
  const doneToday = items.filter((i) => i.done);
  const attention = items.filter((i) => !i.done && i.when !== "later").sort((a, b) => score(a) - score(b));
  const later = items.filter((i) => !i.done && i.when === "later");
  const visible = showAll ? attention : attention.slice(0, 3);
  const total = todayScope.length;
  const pct = total ? (doneToday.length / total) * 100 : 0;

  const complete = (id: number) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, done: true, doneAt: "Just now" } : x)));
  const undo = (id: number) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, done: false, doneAt: undefined } : x)));

  return (
    <div className="min-h-screen bg-secondary">
      <div className="relative mx-auto min-h-screen max-w-[430px] bg-background">
        <main className="no-scrollbar px-5 pb-36 pt-[max(env(safe-area-inset-top),3.25rem)]">
          <header className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground">Wednesday, 21 October</p>
              <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight">Good morning, Alex</h1>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full bg-card shadow-card">
                <Bell className="h-[18px] w-[18px]" />
                {attention.some((a) => a.when === "overdue") && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-urgent-fg ring-2 ring-card" />}
              </button>
              <div className="flex -space-x-2"><Avatar l="A" tone="a" /><Avatar l="S" tone="b" /></div>
            </div>
          </header>

          {/* Compact progress strip */}
          <div className="mt-4 flex items-center gap-3 rounded-full bg-primary-soft px-4 py-2.5">
            <Home className="h-3.5 w-3.5 text-accent-foreground" />
            <p className="text-xs font-medium text-accent-foreground"><span className="font-semibold">{doneToday.length} of {total}</span> completed today</p>
            <div className="ml-auto h-1.5 w-20 overflow-hidden rounded-full bg-primary/15">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Needs your attention */}
          <section className="mt-7">
            <SectionHead
              title="Needs your attention"
              action={attention.length > 3 && (
                <button onClick={() => setShowAll((s) => !s)} className="flex items-center text-sm font-medium text-primary">
                  {showAll ? "Show less" : `View all ${attention.length}`} <ChevronRight className={`h-4 w-4 transition-transform ${showAll ? "-rotate-90" : ""}`} />
                </button>
              )}
            />
            {attention.length === 0 ? (
              <div className="rounded-3xl bg-card p-7 text-center shadow-card">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary"><Check className="h-6 w-6" strokeWidth={2.5} /></span>
                <p className="mt-4 text-[17px] font-semibold">Nothing urgent right now</p>
                <p className="mt-1 text-sm text-muted-foreground">You're all caught up. Enjoy the calm.</p>
                {later.length > 0 && (
                  <a href="#later" className="mt-4 inline-flex items-center rounded-full bg-primary-soft px-4 py-2 text-sm font-medium text-accent-foreground">View upcoming <ChevronRight className="h-4 w-4" /></a>
                )}
              </div>
            ) : (
              <ul className="space-y-2.5">
                {visible.map((i) => <AttentionCard key={i.id} item={i} onDone={() => complete(i.id)} />)}
              </ul>
            )}

            {doneToday.length > 0 && (
              <div className="mt-3">
                <button onClick={() => setShowDone((s) => !s)} className="flex w-full items-center gap-2 px-1 py-2 text-sm text-muted-foreground">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary"><Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} /></span>
                  Completed today · {doneToday.length}
                  <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${showDone ? "rotate-90" : ""}`} />
                </button>
                {showDone && (
                  <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-card">
                    {doneToday.map((i) => (
                      <li key={i.id} className="flex items-center gap-3 px-4 py-3">
                        <span className="flex-1 truncate text-sm text-muted-foreground line-through">{i.title}</span>
                        <span className="text-xs text-muted-foreground">{who(i.who)} · {i.doneAt}</span>
                        <button onClick={() => undo(i.id)} className="text-xs font-medium text-primary">Undo</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>

          {/* Coming up later */}
          {later.length > 0 && (
            <section id="later" className="mt-7">
              <SectionHead title="Coming up later" />
              <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-card">
                {later.map((i) => {
                  const C = catStyle[i.cat];
                  return (
                    <li key={i.id} className="flex items-center gap-3 px-4 py-3">
                      <button onClick={() => complete(i.id)} aria-label={`Complete ${i.title}`} className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-muted-foreground/40" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{i.title}</span>
                      <span className="text-xs text-muted-foreground">{i.due} · {who(i.who)}</span>
                      <C.icon className={`h-4 w-4 ${C.cls.split(" ")[1]}`} />
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Keep in mind */}
          <section className="mt-7">
            <SectionHead title="Keep in mind" action={<button aria-label="Add note" onClick={() => setSheet(true)} className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-primary"><Plus className="h-4 w-4" /></button>} />
            <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
              {[
                ["Pinned", "Spare keys are in the kitchen drawer", "Sam · 2d", true],
                ["Reminder", "Order dishwasher tablets", "Alex · 5h", false],
                ["Wi‑Fi", "Guest password on the fridge", "Alex · 1w", false],
              ].map(([t, b, m, pin]) => (
                <div key={t as string} className={`relative w-40 shrink-0 rounded-2xl p-3.5 shadow-card ${pin ? "bg-note" : "bg-card"}`}>
                  {pin && <Pin className="absolute right-3 top-3 h-3.5 w-3.5 rotate-45 fill-current text-note-fg" />}
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${pin ? "text-note-fg" : "text-muted-foreground"}`}>{t}</p>
                  <p className="mt-1.5 text-sm font-medium leading-snug">{b}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{m}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Around your home — compact */}
          <section className="mt-7">
            <SectionHead title="Around your home" />
            <div className="grid grid-cols-4 gap-2">
              {(["grocery", "plant", "bill", "clean"] as Cat[]).map((c) => {
                const C = catStyle[c];
                const n = items.filter((i) => i.cat === c && !i.done).length;
                return (
                  <button key={c} className="flex flex-col items-center gap-1.5 rounded-2xl bg-card py-3 shadow-card active:scale-95 transition-transform">
                    <span className={`grid h-9 w-9 place-items-center rounded-xl ${C.cls}`}><C.icon className="h-4 w-4" /></span>
                    <span className="text-[11px] font-medium">{C.name}</span>
                    <span className="text-[10px] text-muted-foreground">{n} open</span>
                  </button>
                );
              })}
            </div>
          </section>
        </main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t bg-card/85 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 backdrop-blur-xl">
          <div className="grid grid-cols-5 items-end">
            {[[Home, "Home", true], [ListChecks, "Tasks"]].map(([I, l, a]: any) => (
              <button key={l} className={`flex flex-col items-center gap-1 py-1 text-[10px] font-medium ${a ? "text-primary" : "text-muted-foreground"}`}><I className="h-6 w-6" />{l}</button>
            ))}
            <div className="flex justify-center">
              <button aria-label="Quick add" onClick={() => setSheet(true)} className="-mt-7 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-fab active:scale-95 transition-transform">
                <Plus className="h-7 w-7" />
              </button>
            </div>
            {[[List, "Lists"], [Users, "Household"]].map(([I, l]: any) => (
              <button key={l} className="flex flex-col items-center gap-1 py-1 text-[10px] font-medium text-muted-foreground"><I className="h-6 w-6" />{l}</button>
            ))}
          </div>
        </nav>

        {/* Quick add sheet */}
        <div className={`fixed inset-0 z-40 transition ${sheet ? "pointer-events-auto" : "pointer-events-none"}`}>
          <div onClick={() => setSheet(false)} className={`absolute inset-0 bg-foreground/30 transition-opacity duration-300 ${sheet ? "opacity-100" : "opacity-0"}`} />
          <div className={`absolute bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 rounded-t-3xl bg-card px-5 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-3 transition-transform duration-300 ease-out ${sheet ? "translate-y-0" : "translate-y-full"}`}>
            <div className="mx-auto h-1.5 w-10 rounded-full bg-muted" />
            <div className="mt-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Quick Add</h3>
              <button aria-label="Close" onClick={() => setSheet(false)} className="grid h-8 w-8 place-items-center rounded-full bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                [CheckSquare, "Task", "bg-primary-soft text-primary"],
                [StickyNote, "Note", "bg-note text-note-fg"],
                [ShoppingBasket, "Grocery", catStyle.grocery.cls],
                [Receipt, "Bill", catStyle.bill.cls],
                [Leaf, "Plant", catStyle.plant.cls],
              ].map(([I, l, cls]: any) => (
                <button key={l} onClick={() => setSheet(false)} className="flex flex-col items-center gap-2 rounded-2xl bg-background py-4 active:scale-95 transition-transform">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl ${cls}`}><I className="h-5 w-5" /></span>
                  <span className="text-sm font-medium">{l}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
