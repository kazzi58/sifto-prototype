import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { hydrateGroceries } from "@/lib/grocery";
import {
  Leaf, ShoppingBasket, Sparkles, Receipt, Home, ListChecks, List, Users, Plus, X, CheckSquare, StickyNote,
  CalendarDays, Repeat, Check,
} from "lucide-react";
import { actions, dueLabel, useStore, whoName, type Cat, type Who } from "@/lib/store";

export const catStyle: Record<Cat, { icon: typeof Leaf; cls: string; fg: string; bg: string; name: string }> = {
  task: { icon: CheckSquare, cls: "bg-primary-soft text-primary", fg: "text-primary", bg: "bg-primary-soft", name: "Task" },
  plant: { icon: Leaf, cls: "bg-cat-plant text-cat-plant-fg", fg: "text-cat-plant-fg", bg: "bg-cat-plant", name: "Plants" },
  grocery: { icon: ShoppingBasket, cls: "bg-cat-grocery text-cat-grocery-fg", fg: "text-cat-grocery-fg", bg: "bg-cat-grocery", name: "Groceries" },
  clean: { icon: Sparkles, cls: "bg-cat-clean text-cat-clean-fg", fg: "text-cat-clean-fg", bg: "bg-cat-clean", name: "Cleaning" },
  bill: { icon: Receipt, cls: "bg-cat-bill text-cat-bill-fg", fg: "text-cat-bill-fg", bg: "bg-cat-bill", name: "Bills" },
};

export function Avatar({ l, size = "md" }: { l: Who; size?: "sm" | "md" }) {
  return (
    <span className={`grid place-items-center rounded-full font-semibold ring-2 ring-background ${size === "sm" ? "h-5 w-5 text-[9px]" : "h-8 w-8 text-xs"} ${l === "A" ? "bg-primary text-primary-foreground" : "bg-cat-grocery text-cat-grocery-fg"}`}>{l}</span>
  );
}

export function AppShell({ tab, children }: { tab: "home" | "tasks" | "lists" | "household"; children: ReactNode }) {
  useEffect(() => hydrateGroceries(), []);
  return (
    <div className="min-h-screen bg-secondary">
      <div className="relative mx-auto min-h-screen max-w-[430px] bg-background">
        <main className="px-5 pb-36 pt-[max(env(safe-area-inset-top),3rem)]">{children}</main>
        <BottomNav tab={tab} />
        <QuickAdd />
        <DetailSheet />
      </div>
    </div>
  );
}

function BottomNav({ tab }: { tab: string }) {
  const cls = (a: boolean) => `flex flex-col items-center gap-1 py-1 text-[10px] font-medium transition-colors ${a ? "text-primary" : "text-muted-foreground"}`;
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t bg-card/85 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 backdrop-blur-xl">
      <div className="grid grid-cols-5 items-end">
        <Link to="/" className={cls(tab === "home")}><Home className="h-6 w-6" />Home</Link>
        <Link to="/tasks" className={cls(tab === "tasks")}><ListChecks className="h-6 w-6" />Tasks</Link>
        <div className="flex justify-center">
          <button aria-label="Quick add" onClick={() => actions.sheet(true)} className="-mt-7 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-fab transition-transform active:scale-95">
            <Plus className="h-7 w-7" />
          </button>
        </div>
        <Link to="/groceries" className={cls(tab === "lists")}><List className="h-6 w-6" />Lists</Link>
        <button className={cls(tab === "household")}><Users className="h-6 w-6" />Household</button>
      </div>
    </nav>
  );
}

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <div className={`fixed inset-0 z-40 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div onClick={onClose} className={`absolute inset-0 bg-foreground/30 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <div className={`absolute bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 rounded-t-3xl bg-card px-5 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-3 transition-transform duration-300 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}>
        <div className="mx-auto h-1.5 w-10 rounded-full bg-muted" />
        {children}
      </div>
    </div>
  );
}

type Kind = Cat | "note";
const kinds: [Kind, string, typeof Leaf, string][] = [
  ["task", "Task", CheckSquare, catStyle.task.cls],
  ["grocery", "Grocery", ShoppingBasket, catStyle.grocery.cls],
  ["note", "Note", StickyNote, "bg-note text-note-fg"],
  ["bill", "Bill", Receipt, catStyle.bill.cls],
  ["plant", "Plant care", Leaf, catStyle.plant.cls],
];

function QuickAdd() {
  const { sheet } = useStore();
  const [text, setText] = useState("");
  const [kind, setKind] = useState<Kind>("task");
  const [due, setDue] = useState<number | null>(null);
  const [who, setWho] = useState<Who>("A");
  const navigate = useNavigate();
  const close = () => { actions.sheet(false); setText(""); setDue(null); setKind("task"); setWho("A"); };
  const save = () => {
    const t = text.trim();
    if (!t) return;
    if (kind === "note") actions.addNote(t);
    else actions.addItem({ title: t, cat: kind, due: kind === "grocery" ? null : due ?? 0, who, deadline: kind === "bill" });
    close();
  };
  const chip = (a: boolean) => `rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${a ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`;
  return (
    <Sheet open={sheet} onClose={close}>
      <div className="mt-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quick add</h3>
        <button aria-label="Close" onClick={close} className="grid h-8 w-8 place-items-center rounded-full bg-muted"><X className="h-4 w-4" /></button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); save(); }}>
        <input
          key={String(sheet)}
          autoFocus={sheet}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What do you need to remember or do?"
          className="mt-4 w-full rounded-2xl bg-background px-4 py-3.5 text-[15px] outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
        />
        <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">
          {kinds.map(([k, l, I, cls]) => (
            <button type="button" key={k} onClick={() => { if (k === "grocery") { close(); navigate({ to: "/groceries", search: { add: true } }); } else setKind(k); }} className={`flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-sm font-medium transition-all ${kind === k ? "bg-foreground/5 ring-2 ring-primary" : "bg-background"}`}>
              <span className={`grid h-7 w-7 place-items-center rounded-full ${cls}`}><I className="h-3.5 w-3.5" /></span>{l}
            </button>
          ))}
        </div>
        {kind !== "note" && kind !== "grocery" && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              {([[0, "Today"], [1, "Tomorrow"], [3, "Sat"]] as const).map(([d, l]) => (
                <button type="button" key={l} onClick={() => setDue(due === d ? null : d)} className={chip(due === d)}>{l}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              {(["A", "S"] as Who[]).map((w) => <button type="button" key={w} onClick={() => setWho(w)} className={chip(who === w)}>{whoName(w)}</button>)}
            </div>
          </div>
        )}
        <button type="submit" disabled={!text.trim()} className="mt-5 w-full rounded-full bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground transition-opacity disabled:opacity-40 active:scale-[0.99]">Add</button>
      </form>
    </Sheet>
  );
}

function DetailSheet() {
  const { openId, items } = useStore();
  const item = items.find((i) => i.id === openId);
  const C = item ? catStyle[item.cat] : catStyle.task;
  return (
    <Sheet open={!!item} onClose={() => actions.open(null)}>
      {item && (
        <div className="mt-4">
          <div className="flex items-start gap-3">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${C.cls}`}><C.icon className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{C.name}</p>
              <h3 className="mt-0.5 text-xl font-semibold leading-snug">{item.title}</h3>
            </div>
            <button aria-label="Close" onClick={() => actions.open(null)} className="grid h-8 w-8 place-items-center rounded-full bg-muted"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-5 divide-y divide-border rounded-2xl bg-background text-sm">
            {item.due !== null && <Row label="Due" value={<span className={item.due < 0 ? "text-urgent-fg font-medium" : ""}>{dueLabel(item.due, item.time)}</span>} />}
            <Row label="Assigned to" value={<span className="flex items-center gap-2"><Avatar l={item.who} size="sm" />{whoName(item.who)}</span>} />
            {item.recurring && <Row label="Repeats" value={<span className="flex items-center gap-1.5"><Repeat className="h-3.5 w-3.5" />Every {item.recurring === 7 ? "week" : item.recurring === 30 ? "month" : `${item.recurring} days`}</span>} />}
          </div>
          {item.note && <p className="mt-4 rounded-2xl bg-note px-4 py-3 text-sm text-foreground">{item.note}</p>}
          {!item.done && (
            <button onClick={() => { actions.complete(item.id); actions.open(null); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground active:scale-[0.99]">
              <Check className="h-4 w-4" strokeWidth={3} />{item.cat === "bill" ? "Mark paid" : item.cat === "grocery" ? "Got it" : "Mark done"}
            </button>
          )}
        </div>
      )}
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return <div className="flex items-center justify-between px-4 py-3"><span className="text-muted-foreground">{label}</span>{value}</div>;
}
