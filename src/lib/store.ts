import { useSyncExternalStore } from "react";

export type Cat = "task" | "plant" | "grocery" | "clean" | "bill";
export type Who = "A" | "S";
export type Item = {
  id: number;
  title: string;
  cat: Cat;
  due: number | null; // day offset from today
  time?: string;
  who: Who;
  note?: string;
  recurring?: number; // repeat every N days
  deadline?: boolean;
  done: boolean;
};
export type Note = { id: number; text: string; pinned: boolean; by: string; ago: string };

type State = { items: Item[]; notes: Note[]; openId: number | null; sheet: boolean; nextId: number };

let state: State = {
  nextId: 100,
  openId: null,
  sheet: false,
  items: [
    { id: 1, title: "Electricity bill · £64.20", cat: "bill", due: -1, who: "A", deadline: true, note: "Paid by direct debit last month — check the account.", done: false },
    { id: 2, title: "Council Tax · £148.00", cat: "bill", due: 2, who: "S", deadline: true, recurring: 30, done: false },
    { id: 3, title: "Repot the fiddle leaf", cat: "plant", due: 3, who: "S", deadline: true, note: "New pot is on the balcony.", done: false },
    { id: 4, title: "Water the monstera", cat: "plant", due: 0, who: "A", recurring: 7, done: false },
    { id: 5, title: "Clean the kitchen", cat: "clean", due: 0, who: "A", recurring: 2, done: false },
    { id: 6, title: "Take out recycling", cat: "clean", due: 0, time: "8 pm", who: "S", recurring: 7, done: false },
    { id: 7, title: "Deep clean bathroom", cat: "clean", due: 4, who: "A", done: false },
    { id: 8, title: "Book boiler service", cat: "task", due: 1, who: "A", note: "Ask for a Saturday slot.", done: false },
    { id: 9, title: "Hoover the stairs", cat: "clean", due: 2, who: "A", done: true },
    ...["Oat milk", "Sourdough", "Eggs", "Spinach", "Lemons", "Dishwasher tablets", "Coffee beans"].map((t, i) => ({ id: 20 + i, title: t, cat: "grocery" as Cat, due: null, who: (i % 2 ? "S" : "A") as Who, done: false })),
  ],
  notes: [
    { id: 1, text: "Spare keys are in the kitchen drawer", pinned: true, by: "Sam", ago: "2d" },
    { id: 2, text: "Guest Wi‑Fi password is on the fridge", pinned: true, by: "Alex", ago: "1w" },
    { id: 3, text: "Bin day moves to Thursday in November", pinned: false, by: "Alex", ago: "3d" },
  ],
};

const listeners = new Set<() => void>();
const set = (fn: (s: State) => Partial<State>) => {
  state = { ...state, ...fn(state) };
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l));
export const useStore = () => useSyncExternalStore(subscribe, () => state, () => state);

export const actions = {
  complete(id: number) {
    set((s) => ({
      items: s.items.map((i) =>
        i.id !== id ? i : i.recurring && i.due !== null ? { ...i, due: Math.max(i.due, 0) + i.recurring } : { ...i, done: true },
      ),
    }));
  },
  toggle(id: number) {
    set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)) }));
  },
  addItem(it: Omit<Item, "id" | "done">) {
    set((s) => ({ items: [{ ...it, id: s.nextId, done: false }, ...s.items], nextId: s.nextId + 1 }));
  },
  addNote(text: string, pinned = false) {
    set((s) => ({ notes: [{ id: s.nextId, text, pinned, by: "Alex", ago: "now" }, ...s.notes], nextId: s.nextId + 1 }));
  },
  togglePin(id: number) {
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)) }));
  },
  open(id: number | null) {
    set(() => ({ openId: id }));
  },
  sheet(v: boolean) {
    set(() => ({ sheet: v }));
  },
};

const TODAY = new Date(2026, 9, 21);
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const dateOf = (off: number) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + off);
export const dueLabel = (off: number | null, time?: string) => {
  if (off === null) return "";
  const base = off < -1 ? `${-off} days ago` : off === -1 ? "Yesterday" : off === 0 ? "Today" : off === 1 ? "Tomorrow" : off < 7 ? days[dateOf(off).getDay()] : dateOf(off).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return time ? `${base}, ${time}` : base;
};
export const whoName = (w: Who) => (w === "A" ? "You" : "Sam");
export const isTask = (i: Item) => i.cat !== "grocery";
