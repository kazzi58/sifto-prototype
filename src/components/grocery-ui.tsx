import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Carrot, Fish, Egg, Bread, Grains, Snowflake, Coffee, Cookie, SprayBottle, HandSoap, Basket, Check, Plus, Minus, X, Trash, MagnifyingGlass,
} from "@phosphor-icons/react";
import { G_CATS, G_NAMES, g, qtyLabel, suggestions, useGroceries, type GCat, type GItem } from "@/lib/grocery";
import { Sheet } from "@/components/AppShell";

const ICONS: Record<GCat, typeof Carrot> = {
  produce: Carrot, meat: Fish, dairy: Egg, bakery: Bread, pantry: Grains, frozen: Snowflake, drinks: Coffee, snacks: Cookie, household: SprayBottle, care: HandSoap, other: Basket,
};
const TONE: Record<GCat, string> = {
  produce: "bg-g-sage", meat: "bg-g-apricot", dairy: "bg-g-sand", bakery: "bg-g-apricot", pantry: "bg-g-sand", frozen: "bg-g-blue",
  drinks: "bg-g-blue", snacks: "bg-g-lavender", household: "bg-g-blue", care: "bg-g-lavender", other: "bg-muted",
};

export function CatIcon({ cat, size = "md" }: { cat: GCat; size?: "sm" | "md" }) {
  const I = ICONS[cat];
  return (
    <span className={`grid shrink-0 place-items-center rounded-xl text-primary ${TONE[cat]} ${size === "sm" ? "h-7 w-7" : "h-9 w-9"}`}>
      <I weight="duotone" className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
    </span>
  );
}

export function CheckButton({ done, onClick, big, label }: { done: boolean; onClick: () => void; big?: boolean | undefined; label: string }) {
  return (
    <button aria-label={label} onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`grid shrink-0 place-items-center rounded-full border-2 transition-all duration-300 active:scale-90 ${big ? "h-8 w-8" : "h-7 w-7"} ${done ? "animate-check-pop border-primary bg-primary text-primary-foreground" : "border-muted-foreground/35 text-transparent"}`}>
      <Check weight="bold" className={`${big ? "h-4 w-4" : "h-3.5 w-3.5"} ${done ? "animate-check-draw" : ""}`} />
    </button>
  );
}

export function ProgressLine({ value, total }: { value: number; total: number }) {
  const pct = total ? (value / total) * 100 : 0;
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-g-sage">
      <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-[cubic-bezier(.22,1.2,.36,1)]" style={{ width: `${pct}%` }} />
      {[25, 50, 75].map((m) => (
        <span key={m} className={`absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-500 ${pct >= m ? "bg-primary-foreground/70" : "bg-primary/25"}`} style={{ left: `${m}%` }} />
      ))}
    </div>
  );
}

export function ProgressRing({ value, total, size = 34 }: { value: number; total: number; size?: number }) {
  const r = size / 2 - 3, c = 2 * Math.PI * r, pct = total ? value / total : 0;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={3} className="stroke-card/80" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={3} strokeLinecap="round" className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
    </svg>
  );
}

/** Focused search/add sheet: stays open for rapid multi-add. */
export function SmartAdd({ open, onClose }: { open: boolean; onClose: () => void }) {
  useGroceries();
  const [q, setQ] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) setTimeout(() => ref.current?.focus(), 250); else setQ(""); }, [open]);
  const sug = suggestions(q.replace(/^\d+(\.\d+)?\s*(l|ml|kg|g|pcs|x)?\s+/i, ""));
  const add = (text: string) => {
    const name = g.add(text);
    if (!name) return;
    setQ(""); setFlash(name); ref.current?.focus();
    setTimeout(() => setFlash((f) => (f === name ? null : f)), 1600);
  };
  const qtyPrefix = q.match(/^(\d+(\.\d+)?\s*(l|ml|kg|g|pcs|x)?\s+)/i)?.[1] ?? "";
  const exact = sug.some((s) => s.name.toLowerCase() === q.trim().toLowerCase());
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="mt-3 flex items-center gap-2">
        <form onSubmit={(e) => { e.preventDefault(); add(q); }} className="flex flex-1 items-center gap-2 rounded-2xl bg-background px-3.5 py-3 ring-primary/30 focus-within:ring-2">
          <MagnifyingGlass weight="bold" className="h-4 w-4 text-muted-foreground" />
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search or add anything..." enterKeyHint="done" className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" />
        </form>
        <button onClick={onClose} className="px-1 text-sm font-semibold text-primary">Done</button>
      </div>
      <div className="h-8 pt-2">
        {flash && <p key={flash} className="animate-fade-up flex items-center gap-1.5 text-xs font-semibold text-primary"><Check weight="bold" className="h-3.5 w-3.5" />{flash} added</p>}
      </div>
      <ul className="min-h-[240px] divide-y divide-border">
        {sug.map((s) => (
          <li key={s.name}>
            <button onClick={() => add(qtyPrefix + s.name)} className="flex w-full items-center gap-3 py-2.5 text-left active:opacity-60">
              <CatIcon cat={s.cat} size="sm" />
              <span className="flex-1"><span className="block text-[15px] font-semibold">{s.name}</span><span className="text-xs text-muted-foreground">{G_NAMES[s.cat]}</span></span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-g-sage text-primary"><Plus weight="bold" className="h-3.5 w-3.5" /></span>
            </button>
          </li>
        ))}
        {q.trim() && !exact && (
          <li>
            <button onClick={() => add(q)} className="flex w-full items-center gap-3 py-2.5 text-left active:opacity-60">
              <span className="grid h-7 w-7 place-items-center rounded-xl bg-primary text-primary-foreground"><Plus weight="bold" className="h-3.5 w-3.5" /></span>
              <span className="text-[15px] font-semibold">Add “{q.trim()}”</span>
            </button>
          </li>
        )}
        {!q.trim() && <li className="py-6 text-center text-sm text-muted-foreground">Try “mil”, “2L milk” or “6 bananas”.</li>}
      </ul>
    </Sheet>
  );
}

const UNITS = ["", "pcs", "L", "ml", "kg", "g", "pack"];
export function ItemEditor({ item, onClose }: { item: GItem | null; onClose: () => void }) {
  const [last, setLast] = useState<GItem | null>(item);
  useEffect(() => { if (item) setLast(item); }, [item]);
  const { items } = useGroceries();
  const it = item ? items.find((i) => i.id === item.id) ?? last : last;
  return (
    <Sheet open={!!item} onClose={onClose}>
      {it && (
        <div className="mt-4">
          <div className="flex items-center gap-3">
            <CatIcon cat={it.cat} />
            <input value={it.name} onChange={(e) => g.update(it.id, { name: e.target.value })} className="min-w-0 flex-1 bg-transparent text-xl font-bold outline-none" />
            <button aria-label="Close" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-muted"><X weight="bold" className="h-4 w-4" /></button>
          </div>
          <Label>Quantity</Label>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full bg-background">
              <button aria-label="Less" onClick={() => g.update(it.id, { qty: Math.max(1, it.qty - 1) })} className="grid h-10 w-10 place-items-center"><Minus weight="bold" className="h-4 w-4" /></button>
              <span className="w-8 text-center text-[15px] font-bold tabular-nums">{it.qty}</span>
              <button aria-label="More" onClick={() => g.update(it.id, { qty: it.qty + 1 })} className="grid h-10 w-10 place-items-center"><Plus weight="bold" className="h-4 w-4" /></button>
            </div>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {UNITS.map((u) => <Chip key={u || "none"} on={it.unit === u} onClick={() => g.update(it.id, { unit: u })}>{u || "—"}</Chip>)}
            </div>
          </div>
          <Label>Category</Label>
          <div className="flex flex-wrap gap-1.5">
            {G_CATS.map((c) => <Chip key={c} on={it.cat === c} onClick={() => g.update(it.id, { cat: c })}>{G_NAMES[c]}</Chip>)}
          </div>
          <div className="mt-6 flex gap-2">
            <button onClick={() => { g.remove(it.id); onClose(); }} className="flex items-center gap-1.5 rounded-full bg-muted px-4 py-3 text-sm font-semibold text-urgent-fg"><Trash weight="bold" className="h-4 w-4" />Remove</button>
            <button onClick={() => { it.bought ? g.undo(it.id) : g.buy(it.id); onClose(); }} className="flex-1 rounded-full bg-primary py-3 text-[15px] font-bold text-primary-foreground active:scale-[0.99]">{it.bought ? "Put back on list" : "Mark purchased"}</button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
const Label = ({ children }: { children: ReactNode }) => <p className="mb-2 mt-5 text-xs font-semibold text-muted-foreground">{children}</p>;
const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) => (
  <button onClick={onClick} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${on ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>{children}</button>
);

export function GroceryRow({ item, onOpen, onCheck, big, showBy }: { item: GItem; onOpen: () => void; onCheck: () => void; big?: boolean | undefined; showBy?: boolean | undefined }) {
  const q = qtyLabel(item);
  return (
    <div role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => e.key === "Enter" && onOpen()} className={`flex w-full cursor-pointer items-center gap-3.5 text-left transition-colors active:bg-muted/60 ${big ? "px-4 py-4" : "px-4 py-3"}`}>
      <CheckButton done={item.bought} onClick={onCheck} big={big} label={item.bought ? `Undo ${item.name}` : `Mark ${item.name} purchased`} />
      <span className="min-w-0 flex-1">
        <span className={`block truncate font-semibold transition-colors ${big ? "text-[17px]" : "text-[15px]"} ${item.bought ? "text-muted-foreground line-through decoration-1" : ""}`}>{item.name}</span>
        {showBy && item.bought && <span className="text-xs text-muted-foreground">Picked up by {item.by === "S" ? "Sam" : "you"}</span>}
      </span>
      {q && <span className="text-sm font-semibold tabular-nums text-muted-foreground">{q}</span>}
    </div>
  );
}
