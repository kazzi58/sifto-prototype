import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronRight, Pin, Plus, StickyNote, CalendarCheck } from "lucide-react";
import { AppShell, Avatar, catStyle } from "@/components/AppShell";
import { actions, dateOf, dueLabel, useStore, type Cat } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sifto — Home" },
      { name: "description", content: "Sifto: a calm shared home overview for couples and families." },
      { property: "og:title", content: "Sifto — Home" },
      { property: "og:description", content: "See what's happening around your home at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomeScreen,
});

function HomeScreen() {
  const { items, notes } = useStore();
  const open = items.filter((i) => !i.done);
  const deadlines = open.filter((i) => i.deadline && i.due !== null).sort((a, b) => a.due! - b.due!).slice(0, 3);
  const count = (c: Cat) => open.filter((i) => i.cat === c).length;
  const pinned = notes.filter((n) => n.pinned);
  const tiles: { cat: Cat; label: string }[] = [
    { cat: "clean", label: `${count("clean")} to do` },
    { cat: "grocery", label: `${count("grocery")} to buy` },
    { cat: "bill", label: `${count("bill")} due soon` },
    { cat: "plant", label: `${count("plant")} need care` },
  ];

  return (
    <AppShell tab="home">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Wed 21 Oct · The Harbour Flat</p>
          <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight">Good morning, Alex</h1>
        </div>
        <div className="flex items-center gap-2.5 pt-1">
          <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full bg-card shadow-card">
            <Bell className="h-[18px] w-[18px]" />
            {deadlines.some((d) => d.due! < 0) && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-urgent-fg ring-2 ring-card" />}
          </button>
          <button aria-label="Profile"><Avatar l="A" /></button>
        </div>
      </header>

      {/* Coming up */}
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-[15px] font-semibold">Coming up</h2>
          <Link to="/tasks" search={{ f: "upcoming" }} className="text-sm font-medium text-primary">See all</Link>
        </div>
        {deadlines.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3.5 text-sm text-muted-foreground shadow-card">
            <CalendarCheck className="h-4 w-4 text-primary" /> Nothing coming up. Enjoy the calm.
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-card">
            {deadlines.map((d) => {
              const C = catStyle[d.cat];
              const late = d.due! < 0;
              const dt = dateOf(d.due!);
              return (
                <li key={d.id}>
                  <button onClick={() => actions.open(d.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-muted">
                    <span className={`flex w-9 shrink-0 flex-col items-center leading-none ${late ? "text-urgent-fg" : "text-foreground"}`}>
                      <span className="text-[9px] font-semibold uppercase tracking-wider opacity-70">{dt.toLocaleDateString("en-GB", { month: "short" })}</span>
                      <span className="mt-0.5 text-lg font-semibold">{dt.getDate()}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{d.title}</span>
                      <span className={`text-xs ${late ? "text-urgent-fg" : "text-muted-foreground"}`}>{late ? "Overdue" : dueLabel(d.due)}</span>
                    </span>
                    <C.icon className={`h-4 w-4 ${C.fg}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Your Home */}
      <section className="mt-7">
        <h2 className="mb-3 px-1 text-[17px] font-semibold tracking-tight">Your home</h2>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map(({ cat, label }) => {
            const C = catStyle[cat];
            return (
              <Link key={cat} to="/space/$cat" params={{ cat }} className={`group relative overflow-hidden rounded-3xl ${C.bg} p-4 transition-transform duration-200 active:scale-[0.97]`}>
                <C.icon className={`absolute -bottom-3 -right-3 h-20 w-20 opacity-[0.12] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 ${C.fg}`} strokeWidth={1.5} />
                <span className={`grid h-10 w-10 place-items-center rounded-2xl bg-card/70 ${C.fg}`}><C.icon className="h-5 w-5" /></span>
                <p className="mt-6 text-[15px] font-semibold">{C.name}</p>
                <p className={`text-xs font-medium ${C.fg}`}>{label}</p>
              </Link>
            );
          })}
          <Link to="/space/$cat" params={{ cat: "note" }} className="group col-span-2 flex items-center gap-3 rounded-3xl bg-note p-4 transition-transform duration-200 active:scale-[0.98]">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-card/70 text-note-fg"><StickyNote className="h-5 w-5" /></span>
            <div className="flex-1">
              <p className="text-[15px] font-semibold">Notes</p>
              <p className="text-xs font-medium text-note-fg">{pinned.length} pinned · {notes.length} saved</p>
            </div>
            <ChevronRight className="h-5 w-5 text-note-fg transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* Keep in mind */}
      <section className="mt-7">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-[15px] font-semibold">Keep in mind</h2>
          <div className="flex items-center gap-3">
            <Link to="/space/$cat" params={{ cat: "note" }} className="text-sm font-medium text-primary">All notes</Link>
            <button aria-label="Add note" onClick={() => actions.sheet(true)} className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft text-primary"><Plus className="h-4 w-4" /></button>
          </div>
        </div>
        {pinned[0] ? (
          <div className="relative rounded-2xl bg-note px-4 py-3.5 shadow-card">
            <Pin className="absolute right-3.5 top-3.5 h-3.5 w-3.5 rotate-45 fill-current text-note-fg" />
            <p className="pr-6 text-[15px] font-medium leading-snug">{pinned[0].text}</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{pinned[0].by} · {pinned[0].ago}</p>
          </div>
        ) : (
          <p className="rounded-2xl bg-card px-4 py-3.5 text-sm text-muted-foreground shadow-card">No pinned notes yet.</p>
        )}
      </section>
    </AppShell>
  );
}
