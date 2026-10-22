import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MagnifyingGlass, ClockCounterClockwise, UsersThree, Plus, ListBullets, SquaresFour, CaretDown, ShoppingCartSimple } from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { GroceryRow, ItemEditor, SmartAdd } from "@/components/grocery-ui";
import { G_CATS, G_NAMES, buyAgain, g, useGroceries, type GItem } from "@/lib/grocery";

export const Route = createFileRoute("/groceries")({
  validateSearch: (s: Record<string, unknown>): { add?: boolean } => (s["add"] ? { add: true } : {}),
  head: () => ({
    meta: [
      { title: "Sifto — Groceries" },
      { name: "description", content: "Your shared household shopping list with fast add, buy again and shopping mode." },
      { property: "og:title", content: "Sifto — Groceries" },
      { property: "og:description", content: "A calm shared grocery list for the whole household." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GroceriesScreen,
});

function GroceriesScreen() {
  const s = useGroceries();
  const { add } = Route.useSearch();
  const [adding, setAdding] = useState(false);
  const [edit, setEdit] = useState<GItem | null>(null);
  const [grouped, setGrouped] = useState<boolean | null>(null);
  const [showBought, setShowBought] = useState(false);
  useEffect(() => { if (add) setAdding(true); }, [add]);

  const active = s.items.filter((i) => !i.bought);
  const bought = s.items.filter((i) => i.bought);
  const isGrouped = grouped ?? active.length > 7;
  const again = buyAgain(s);

  return (
    <AppShell tab="lists">
      <header className="flex items-start justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><UsersThree weight="duotone" className="h-4 w-4 text-primary" />The Harbour Flat · shared with Sam</p>
          <h1 className="mt-1 text-[30px] font-extrabold leading-tight tracking-tight">Groceries</h1>
          <p className="text-sm font-semibold text-muted-foreground">{active.length ? `${active.length} item${active.length === 1 ? "" : "s"} left` : "Nothing left to buy"}</p>
        </div>
        <Link to="/groceries/history" aria-label="History" className="mt-1 flex items-center gap-1.5 rounded-full bg-card px-3 py-2 text-xs font-bold text-primary shadow-card">
          <ClockCounterClockwise weight="bold" className="h-4 w-4" />History
        </Link>
      </header>

      <button onClick={() => setAdding(true)} className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3.5 text-left shadow-card ring-1 ring-primary/10 transition-transform active:scale-[0.99]">
        <MagnifyingGlass weight="bold" className="h-5 w-5 text-primary" />
        <span className="flex-1 text-[15px] text-muted-foreground">Search or add anything...</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground"><Plus weight="bold" className="h-4 w-4" /></span>
      </button>

      {again.length > 0 && (
        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-bold">Buy again</h2>
            <Link to="/groceries/history" className="text-xs font-bold text-primary">See all</Link>
          </div>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
            {again.map((n) => (
              <button key={n} onClick={() => g.add(n)} className="animate-fade-up flex shrink-0 items-center gap-1 rounded-full bg-g-sand py-1.5 pl-3 pr-2.5 text-sm font-semibold transition-transform active:scale-95">
                {n}<Plus weight="bold" className="h-3.5 w-3.5 text-primary" />
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-[17px] font-extrabold">To buy</h2>
          <div className="flex rounded-full bg-muted p-0.5">
            <button aria-label="Simple list" onClick={() => setGrouped(false)} className={`grid h-7 w-8 place-items-center rounded-full ${!isGrouped ? "bg-card text-primary shadow-card" : "text-muted-foreground"}`}><ListBullets weight="bold" className="h-4 w-4" /></button>
            <button aria-label="Group by category" onClick={() => setGrouped(true)} className={`grid h-7 w-8 place-items-center rounded-full ${isGrouped ? "bg-card text-primary shadow-card" : "text-muted-foreground"}`}><SquaresFour weight="bold" className="h-4 w-4" /></button>
          </div>
        </div>
        {active.length === 0 ? (
          <p className="rounded-2xl bg-card px-4 py-6 text-center text-sm font-semibold text-muted-foreground shadow-card">All picked up ✓</p>
        ) : isGrouped ? (
          <div className="space-y-4">
            {G_CATS.filter((c) => active.some((i) => i.cat === c)).map((c) => (
              <div key={c}>
                <p className="mb-1.5 px-1 text-xs font-bold text-muted-foreground">{G_NAMES[c]}</p>
                <List items={active.filter((i) => i.cat === c)} onOpen={setEdit} />
              </div>
            ))}
          </div>
        ) : (
          <List items={active} onOpen={setEdit} />
        )}
      </section>

      {bought.length > 0 && (
        <section className="mt-5">
          <button onClick={() => setShowBought((v) => !v)} className="flex w-full items-center justify-between px-1 py-1 text-sm font-bold text-muted-foreground">
            Picked up · {bought.length}<CaretDown weight="bold" className={`h-4 w-4 transition-transform ${showBought ? "rotate-180" : ""}`} />
          </button>
          {showBought && <div className="mt-2 animate-fade-up"><List items={bought} onOpen={setEdit} showBy /></div>}
        </section>
      )}

      <div className="pointer-events-none fixed bottom-28 left-1/2 z-20 flex w-full max-w-[430px] -translate-x-1/2 justify-center">
        <Link to="/groceries/shop" className="pointer-events-auto flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background shadow-fab transition-transform active:scale-95">
          <ShoppingCartSimple weight="bold" className="h-4 w-4" />Start shopping
        </Link>
      </div>

      <SmartAdd open={adding} onClose={() => setAdding(false)} />
      <ItemEditor item={edit} onClose={() => setEdit(null)} />
    </AppShell>
  );
}

function List({ items, onOpen, showBy }: { items: GItem[]; onOpen: (i: GItem) => void; showBy?: boolean | undefined }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-card">
      {items.map((i) => (
        <div key={i.id} className="animate-fade-up">
          <GroceryRow item={i} showBy={showBy} onOpen={() => onOpen(i)} onCheck={() => (i.bought ? g.undo(i.id) : g.buy(i.id))} />
        </div>
      ))}
    </div>
  );
}
