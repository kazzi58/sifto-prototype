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
const catStyle: Record<Cat, { icon: typeof Leaf; cls: string }> = {
  plant: { icon: Leaf, cls: "bg-cat-plant text-cat-plant-fg" },
  grocery: { icon: ShoppingBasket, cls: "bg-cat-grocery text-cat-grocery-fg" },
  clean: { icon: Sparkles, cls: "bg-cat-clean text-cat-clean-fg" },
  bill: { icon: Receipt, cls: "bg-cat-bill text-cat-bill-fg" },
};

const initialTasks = [
  { id: 1, title: "Water the monstera", due: "Today", cat: "plant" as Cat, done: true, who: "A" },
  { id: 2, title: "Pick up groceries", due: "Today, 6 pm", cat: "grocery" as Cat, done: false, who: "S" },
  { id: 3, title: "Clean the kitchen", due: "Today", cat: "clean" as Cat, done: true, who: "A" },
  { id: 4, title: "Pay electricity bill", due: "Tomorrow", cat: "bill" as Cat, done: false, who: "A" },
  { id: 5, title: "Repot the fiddle leaf", due: "Sat", cat: "plant" as Cat, done: false, who: "S" },
];

function Avatar({ l, tone }: { l: string; tone: "a" | "b" }) {
  return (
    <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ring-2 ring-background ${tone === "a" ? "bg-primary text-primary-foreground" : "bg-cat-grocery text-cat-grocery-fg"}`}>
      {l}
    </span>
  );
}

function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between px-1">
      <h2 className="text-[19px] font-semibold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}

function Dashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [sheet, setSheet] = useState(false);
  const done = tasks.filter((t) => t.done).length;
  const pct = (done / tasks.length) * 100;
  const msg = done === tasks.length ? "Everything's done. Enjoy your evening." : done >= 3 ? "Nearly there — lovely work today." : "A calm start. One thing at a time.";

  const toggle = (id: number) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <div className="min-h-screen bg-secondary">
      <div className="relative mx-auto min-h-screen max-w-[430px] bg-background">
        <main className="no-scrollbar px-5 pb-36 pt-[max(env(safe-area-inset-top),3.25rem)]">
          {/* Header */}
          <header className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground">Wednesday, 21 October</p>
              <h1 className="mt-1 text-[30px] font-bold leading-tight tracking-tight">Good morning, Alex</h1>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-accent-foreground">
                <Home className="h-3 w-3" /> Our Home
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full bg-card shadow-card">
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-cat-bill-fg ring-2 ring-card" />
              </button>
              <div className="flex -space-x-2"><Avatar l="A" tone="a" /><Avatar l="S" tone="b" /></div>
            </div>
          </header>

          {/* Summary */}
          <section className="relative mt-7 overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-fab">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-foreground/10" />
            <div className="absolute -bottom-16 right-12 h-32 w-32 rounded-full bg-primary-foreground/5" />
            <p className="text-sm font-medium opacity-80">Today</p>
            <p className="mt-1 text-[28px] font-semibold tracking-tight">
              {done} of {tasks.length} <span className="font-normal opacity-80">tasks completed</span>
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-primary-foreground/20">
              <div className="h-full rounded-full bg-primary-foreground transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-3 text-sm opacity-90">{msg}</p>
          </section>

          {/* Coming up */}
          <section className="mt-9">
            <SectionHead title="Coming Up" action={<button className="flex items-center text-sm font-medium text-primary">See all <ChevronRight className="h-4 w-4" /></button>} />
            <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-card">
              {tasks.map((t) => {
                const C = catStyle[t.cat];
                return (
                  <li key={t.id}>
                    <button onClick={() => toggle(t.id)} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-muted">
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all ${t.done ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                        {t.done && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[15px] font-medium transition-colors ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</span>
                        <span className={`text-xs ${t.due.startsWith("Today") && !t.done ? "text-primary" : "text-muted-foreground"}`}>{t.due}</span>
                      </span>
                      <span className={`grid h-8 w-8 place-items-center rounded-xl ${C.cls}`}><C.icon className="h-4 w-4" /></span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Keep in mind */}
          <section className="mt-9">
            <SectionHead title="Keep in Mind" action={<button aria-label="Add note" className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-primary"><Plus className="h-4 w-4" /></button>} />
            <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
              <div className="relative w-44 shrink-0 rounded-2xl bg-note p-4 shadow-card">
                <Pin className="absolute right-3 top-3 h-3.5 w-3.5 rotate-45 fill-current text-note-fg" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-note-fg">Pinned</p>
                <p className="mt-2 text-[15px] font-medium leading-snug">Spare keys are in the kitchen drawer</p>
                <p className="mt-3 text-xs text-muted-foreground">Sam · 2d</p>
              </div>
              <div className="w-44 shrink-0 rounded-2xl bg-card p-4 shadow-card">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Reminder</p>
                <p className="mt-2 text-[15px] font-medium leading-snug">Order dishwasher tablets</p>
                <p className="mt-3 text-xs text-muted-foreground">Alex · 5h</p>
              </div>
              <div className="w-44 shrink-0 rounded-2xl bg-card p-4 shadow-card">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Wi‑Fi</p>
                <p className="mt-2 text-[15px] font-medium leading-snug">Guest password on the fridge</p>
                <p className="mt-3 text-xs text-muted-foreground">Alex · 1w</p>
              </div>
            </div>
          </section>

          {/* Around your home */}
          <section className="mt-9">
            <SectionHead title="Around Your Home" />
            <div className="grid grid-cols-2 gap-3">
              {([
                ["grocery", "Groceries", "7 items"],
                ["plant", "Plants", "2 need watering"],
                ["bill", "Bills", "1 due soon"],
                ["clean", "Cleaning", "3 upcoming"],
              ] as [Cat, string, string][]).map(([c, name, count]) => {
                const C = catStyle[c];
                return (
                  <button key={name} className="rounded-2xl bg-card p-4 text-left shadow-card active:scale-[0.98] transition-transform">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${C.cls}`}><C.icon className="h-5 w-5" /></span>
                    <p className="mt-3 text-[15px] font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{count}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Activity */}
          <section className="mt-9">
            <SectionHead title="Recent Activity" />
            <ul className="space-y-4 px-1">
              {[
                ["S", "b", "Sam", "added oat milk to Groceries", "12m"],
                ["A", "a", "You", "completed Clean the kitchen", "1h"],
                ["S", "b", "Sam", "pinned a note", "2d"],
              ].map(([l, tone, who, what, when], i) => (
                <li key={i} className="flex items-center gap-3">
                  <Avatar l={l ?? ""} tone={tone as "a" | "b"} />
                  <p className="flex-1 text-sm text-muted-foreground"><span className="font-semibold text-foreground">{who}</span> {what}</p>
                  <span className="text-xs text-muted-foreground">{when}</span>
                </li>
              ))}
            </ul>
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
