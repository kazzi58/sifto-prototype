import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, CaretDown, Plus, Check, ArrowCounterClockwise } from "@phosphor-icons/react";
import { CheckButton, ProgressLine, SmartAdd } from "@/components/grocery-ui";
import { Sheet } from "@/components/AppShell";
import { g, hydrateGroceries, qtyLabel, useGroceries, type GSession } from "@/lib/grocery";

export const Route = createFileRoute("/groceries_/shop")({
  head: () => ({
    meta: [
      { title: "Sifto — Shopping mode" },
      { name: "description", content: "A focused, one-handed shopping list for the supermarket." },
      { property: "og:title", content: "Sifto — Shopping mode" },
      { property: "og:description", content: "Tick things off as they go in the basket." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ShopMode,
});

function ShopMode() {
  const s = useGroceries();
  const nav = useNavigate();
  const [leaving, setLeaving] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [summary, setSummary] = useState<GSession | null>(null);
  useEffect(() => hydrateGroceries(), []);

  const active = s.items.filter((i) => !i.bought || leaving.includes(i.id));
  const picked = s.items.filter((i) => i.bought && !leaving.includes(i.id));
  const total = s.items.length;
  const doneCount = s.items.filter((i) => i.bought).length;
  const complete = total > 0 && doneCount === total;

  const tick = (id: number) => {
    setLeaving((l) => [...l, id]);
    g.buy(id);
    setTimeout(() => setLeaving((l) => l.filter((x) => x !== id)), 650);
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="relative mx-auto min-h-screen max-w-[430px] bg-background px-5 pb-32 pt-[max(env(safe-area-inset-top),2.5rem)]">
        <header className="flex items-center justify-between">
          <Link to="/groceries" aria-label="Close shopping mode" className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-card"><X weight="bold" className="h-4 w-4" /></Link>
          <p className="text-sm font-bold">Shopping mode</p>
          <button aria-label="Add item" onClick={() => setAdding(true)} className="grid h-10 w-10 place-items-center rounded-full bg-card text-primary shadow-card"><Plus weight="bold" className="h-4 w-4" /></button>
        </header>

        <section className={`mt-6 rounded-3xl px-5 py-5 transition-colors duration-700 ${complete ? "bg-g-sage" : "bg-card shadow-card"}`}>
          {complete ? (
            <div className="flex items-center gap-3">
              <span className="animate-check-pop grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground"><Check weight="bold" className="animate-check-draw h-5 w-5" /></span>
              <div><p className="text-lg font-extrabold">Everything's in the basket.</p><p className="text-sm font-semibold text-muted-foreground">Nice and easy. Finish when you're ready.</p></div>
            </div>
          ) : (
            <>
              <p className="text-[34px] font-extrabold leading-none tracking-tight">{total - doneCount}<span className="ml-2 text-base font-bold text-muted-foreground">left</span></p>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">{doneCount} of {total} picked up</p>
            </>
          )}
          <div className="mt-4"><ProgressLine value={doneCount} total={total} /></div>
        </section>

        <ul className="mt-5 overflow-hidden rounded-2xl bg-card shadow-card">
          {active.map((i) => {
            const going = leaving.includes(i.id);
            return (
              <li key={i.id} className={`grid border-b border-border transition-all duration-500 ease-out last:border-0 ${going ? "grid-rows-[0fr] bg-g-sage opacity-0" : "grid-rows-[1fr]"}`} style={going ? { transitionDelay: "220ms" } : undefined}>
                <button onClick={() => !going && tick(i.id)} className="flex min-h-0 items-center gap-4 overflow-hidden px-4 py-4 text-left active:bg-muted/60">
                  <CheckButton big done={going} onClick={() => !going && tick(i.id)} label={`Pick up ${i.name}`} />
                  <span className={`flex-1 text-[18px] font-bold ${going ? "text-muted-foreground" : ""}`}>{i.name}</span>
                  {qtyLabel(i) && <span className="text-[15px] font-bold tabular-nums text-muted-foreground">{qtyLabel(i)}</span>}
                </button>
              </li>
            );
          })}
          {active.length === 0 && <li className="px-4 py-6 text-center text-sm font-semibold text-muted-foreground">Nothing left on the list.</li>}
        </ul>

        {picked.length > 0 && (
          <section className="mt-5">
            <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between px-1 py-1 text-sm font-bold text-muted-foreground">
              Picked up · {picked.length}<CaretDown weight="bold" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <ul className="animate-fade-up mt-2 divide-y divide-border rounded-2xl bg-card/70">
                {picked.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/80 text-primary-foreground"><Check weight="bold" className="h-3 w-3" /></span>
                    <span className="flex-1"><span className="block text-[15px] font-semibold text-muted-foreground line-through decoration-1">{i.name}</span><span className="text-xs text-muted-foreground">{i.by === "S" ? "Sam" : "You"}</span></span>
                    <button onClick={() => g.undo(i.id)} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-primary"><ArrowCounterClockwise weight="bold" className="h-3.5 w-3.5" />Undo</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {doneCount > 0 && (
          <div className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 bg-gradient-to-t from-background via-background px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-6">
            <button onClick={() => setSummary(g.finish())} className="w-full rounded-full bg-primary py-4 text-[15px] font-bold text-primary-foreground shadow-fab active:scale-[0.99]">Finish shopping</button>
          </div>
        )}
      </div>

      <SmartAdd open={adding} onClose={() => setAdding(false)} />
      <Sheet open={!!summary} onClose={() => nav({ to: "/groceries" })}>
        {summary && (
          <div className="mt-4">
            <span className="animate-check-pop grid h-12 w-12 place-items-center rounded-full bg-g-sage text-primary"><Check weight="bold" className="h-6 w-6" /></span>
            <h3 className="mt-3 text-xl font-extrabold">Shopping done</h3>
            <p className="text-sm font-semibold text-muted-foreground">{summary.items.length} items saved to history{active.length ? ` · ${active.length} still on the list` : ""}.</p>
            <p className="mt-3 text-sm leading-relaxed">{summary.items.map((i) => i.name).join(", ")}</p>
            <button onClick={() => nav({ to: "/groceries" })} className="mt-5 w-full rounded-full bg-primary py-3.5 text-[15px] font-bold text-primary-foreground">Back to groceries</button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
