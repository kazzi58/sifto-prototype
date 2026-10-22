import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Pin, Plus, StickyNote, Check } from "lucide-react";
import { AppShell, catStyle } from "@/components/AppShell";
import { actions, dueLabel, useStore, whoName, type Cat } from "@/lib/store";

const valid = ["clean", "grocery", "bill", "plant", "note"] as const;
type Space = (typeof valid)[number];
const titles: Record<Space, string> = { clean: "Cleaning", grocery: "Groceries", bill: "Bills", plant: "Plants", note: "Notes" };

export const Route = createFileRoute("/space/$cat")({
  loader: ({ params }) => {
    if (params.cat === "grocery") throw redirect({ to: "/groceries" });
    if (!valid.includes(params.cat as Space)) throw notFound();
    return { cat: params.cat as Space };
  },
  head: ({ loaderData }) => {
    const t = `Sifto — ${loaderData ? titles[loaderData.cat] : "Home"}`;
    return {
      meta: [
        { title: t },
        { name: "description", content: "A shared space in your Sifto home." },
        { property: "og:title", content: t },
        { property: "og:description", content: "A shared space in your Sifto home." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: SpaceScreen,
});

function SpaceScreen() {
  const { cat } = Route.useLoaderData();
  const { items, notes } = useStore();
  const [text, setText] = useState("");
  const isNote = cat === "note";
  const C = isNote ? null : catStyle[cat as Cat];
  const list = isNote ? [] : items.filter((i) => i.cat === cat).sort((a, b) => Number(a.done) - Number(b.done) || (a.due ?? 0) - (b.due ?? 0));

  const add = () => {
    const t = text.trim();
    if (!t) return;
    if (isNote) actions.addNote(t);
    else actions.addItem({ title: t, cat: cat as Cat, due: cat === "grocery" ? null : 0, who: "A", deadline: cat === "bill" });
    setText("");
  };

  return (
    <AppShell tab={cat === "grocery" ? "lists" : "home"}>
      <Link to="/" className="-ml-1 inline-flex items-center text-sm font-medium text-primary"><ChevronLeft className="h-4 w-4" />Home</Link>
      <div className="mt-3 flex items-center gap-3">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl ${C ? C.cls : "bg-note text-note-fg"}`}>{C ? <C.icon className="h-6 w-6" /> : <StickyNote className="h-6 w-6" />}</span>
        <h1 className="text-[28px] font-bold tracking-tight">{titles[cat]}</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); add(); }} className="mt-5 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={isNote ? "Write a note…" : cat === "grocery" ? "Add an item…" : "Add something…"} className="flex-1 rounded-full bg-card px-4 py-3 text-sm shadow-card outline-none ring-primary/40 focus:ring-2" />
        <button aria-label="Add" className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground"><Plus className="h-5 w-5" /></button>
      </form>

      {isNote ? (
        <ul className="mt-5 space-y-2.5">
          {[...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned)).map((n) => (
            <li key={n.id} className={`flex items-start gap-3 rounded-2xl px-4 py-3.5 shadow-card ${n.pinned ? "bg-note" : "bg-card"}`}>
              <div className="flex-1">
                <p className="text-[15px] font-medium leading-snug">{n.text}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{n.by} · {n.ago}</p>
              </div>
              <button aria-label={n.pinned ? "Unpin" : "Pin"} onClick={() => actions.togglePin(n.id)} className="grid h-8 w-8 place-items-center rounded-full">
                <Pin className={`h-4 w-4 rotate-45 ${n.pinned ? "fill-current text-note-fg" : "text-muted-foreground"}`} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-5 divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-card">
          {list.map((i) => (
            <li key={i.id} className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => actions.toggle(i.id)} aria-label={`Toggle ${i.title}`} className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${i.done ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                {i.done && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
              </button>
              <button onClick={() => actions.open(i.id)} className="min-w-0 flex-1 text-left">
                <span className={`block truncate text-sm font-medium ${i.done ? "text-muted-foreground line-through" : ""}`}>{i.title}</span>
                {i.due !== null && !i.done && <span className={`text-xs ${i.due < 0 ? "text-urgent-fg" : "text-muted-foreground"}`}>{dueLabel(i.due, i.time)} · {whoName(i.who)}</span>}
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">Nothing here yet.</li>}
        </ul>
      )}
    </AppShell>
  );
}
