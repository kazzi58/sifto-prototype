import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CaretLeft, MagnifyingGlass, Plus, Check } from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { CatIcon } from "@/components/grocery-ui";
import { fmtDay, g, gWho, qtyLabel, useGroceries } from "@/lib/grocery";

export const Route = createFileRoute("/groceries_/history")({
  head: () => ({
    meta: [
      { title: "Sifto — Purchase history" },
      { name: "description", content: "Everything your household has bought, ready to add again." },
      { property: "og:title", content: "Sifto — Purchase history" },
      { property: "og:description", content: "Past shopping trips and quick re-adds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: History,
});

function History() {
  const s = useGroceries();
  const [q, setQ] = useState("");
  const [added, setAdded] = useState<string[]>([]);
  const k = q.trim().toLowerCase();
  const sessions = s.sessions.map((x) => ({ ...x, items: x.items.filter((i) => !k || i.name.toLowerCase().includes(k)) })).filter((x) => x.items.length);
  const again = (n: string) => { g.add(n); setAdded((a) => [...a, n]); setTimeout(() => setAdded((a) => a.filter((x) => x !== n)), 1400); };

  return (
    <AppShell tab="lists">
      <Link to="/groceries" className="-ml-1 inline-flex items-center gap-0.5 text-sm font-bold text-primary"><CaretLeft weight="bold" className="h-4 w-4" />Groceries</Link>
      <h1 className="mt-2 text-[28px] font-extrabold tracking-tight">History</h1>
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-card">
        <MagnifyingGlass weight="bold" className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search past purchases" className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" />
      </div>
      <div className="mt-5 space-y-5">
        {sessions.map((x) => (
          <section key={x.id}>
            <p className="mb-1.5 px-1 text-xs font-bold text-muted-foreground">{fmtDay(x.at)} · {x.items.length} items · {gWho(x.items[0]?.by)}</p>
            <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-card">
              {x.items.map((i, n) => {
                const done = added.includes(i.name);
                return (
                  <li key={n} className="flex items-center gap-3 px-4 py-2.5">
                    <CatIcon cat={i.cat} size="sm" />
                    <span className="flex-1 text-[15px] font-semibold">{i.name}{qtyLabel(i) && <span className="ml-2 text-sm text-muted-foreground">{qtyLabel(i)}</span>}</span>
                    <button onClick={() => again(i.name)} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${done ? "bg-primary text-primary-foreground" : "bg-g-sage text-primary"}`}>
                      {done ? <Check weight="bold" className="h-3.5 w-3.5" /> : <Plus weight="bold" className="h-3.5 w-3.5" />}{done ? "Added" : "Add again"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {sessions.length === 0 && <p className="py-8 text-center text-sm font-semibold text-muted-foreground">No purchases match “{q}”.</p>}
      </div>
    </AppShell>
  );
}
