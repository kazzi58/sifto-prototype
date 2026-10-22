import { useSyncExternalStore } from "react";

export type GCat = "produce" | "meat" | "dairy" | "bakery" | "pantry" | "frozen" | "drinks" | "snacks" | "household" | "care" | "other";
export const G_CATS: GCat[] = ["produce", "meat", "dairy", "bakery", "pantry", "frozen", "drinks", "snacks", "household", "care", "other"];
export const G_NAMES: Record<GCat, string> = {
  produce: "Fruit & Vegetables", meat: "Meat & Fish", dairy: "Dairy & Eggs", bakery: "Bakery", pantry: "Pantry & Dry Goods",
  frozen: "Frozen", drinks: "Drinks", snacks: "Snacks", household: "Household & Cleaning", care: "Personal Care", other: "Other",
};

const DICT: Record<string, GCat> = {
  apples: "produce", bananas: "produce", lemons: "produce", limes: "produce", oranges: "produce", grapes: "produce", strawberries: "produce", blueberries: "produce", avocados: "produce", tomatoes: "produce", spinach: "produce", lettuce: "produce", onions: "produce", garlic: "produce", potatoes: "produce", carrots: "produce", broccoli: "produce", cucumber: "produce", peppers: "produce", mushrooms: "produce", ginger: "produce",
  chicken: "meat", "chicken thighs": "meat", "minced beef": "meat", salmon: "meat", bacon: "meat", sausages: "meat", prawns: "meat", ham: "meat",
  milk: "dairy", eggs: "dairy", butter: "dairy", cheddar: "dairy", "greek yoghurt": "dairy", yoghurt: "dairy", cream: "dairy", mozzarella: "dairy", "oat milk": "dairy", "almond milk": "dairy", parmesan: "dairy",
  bread: "bakery", sourdough: "bakery", bagels: "bakery", croissants: "bakery", wraps: "bakery", "pitta bread": "bakery",
  rice: "pantry", pasta: "pantry", flour: "pantry", sugar: "pantry", "olive oil": "pantry", oats: "pantry", "chopped tomatoes": "pantry", "peanut butter": "pantry", honey: "pantry", salt: "pantry", "soy sauce": "pantry", lentils: "pantry", cereal: "pantry", "coffee beans": "pantry", tea: "pantry", "chickpeas": "pantry",
  peas: "frozen", "ice cream": "frozen", "frozen pizza": "frozen", "frozen berries": "frozen", "fish fingers": "frozen",
  water: "drinks", "sparkling water": "drinks", "orange juice": "drinks", wine: "drinks", beer: "drinks", kombucha: "drinks",
  crisps: "snacks", "milk chocolate": "snacks", "dark chocolate": "snacks", biscuits: "snacks", nuts: "snacks", popcorn: "snacks",
  "dishwasher tablets": "household", "washing up liquid": "household", "laundry detergent": "household", "bin bags": "household", "kitchen roll": "household", "toilet roll": "household", sponges: "household", "surface spray": "household",
  toothpaste: "care", shampoo: "care", "shower gel": "care", deodorant: "care", "hand soap": "care", "cotton pads": "care",
};
export const PRODUCTS = Object.keys(DICT);

export type Who = "A" | "S";
export type GItem = { id: number; name: string; qty: number; unit: string; cat: GCat; bought: boolean; by?: Who | undefined; at?: number | undefined };
export type GSession = { id: number; at: number; items: { name: string; qty: number; unit: string; cat: GCat; by: Who }[] };
type State = { items: GItem[]; sessions: GSession[]; overrides: Record<string, GCat>; counts: Record<string, number>; nextId: number; justDone: boolean };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const key = (s: string) => s.trim().toLowerCase();
const DAY = 86400000;
const NOW = new Date(2026, 9, 21, 10).getTime();

export function categorise(name: string, overrides: Record<string, GCat> = state.overrides): GCat {
  const k = key(name);
  if (overrides[k]) return overrides[k];
  if (DICT[k]) return DICT[k];
  const sing = k.replace(/(es|s)$/, "");
  const hit = PRODUCTS.find((p) => p === sing || p.replace(/(es|s)$/, "") === sing) ?? PRODUCTS.find((p) => k.includes(p) && p.length > 3);
  return (hit && DICT[hit]) || "other";
}

/** Parses "2L milk", "6 bananas", "milk 2 kg", "3x eggs". */
export function parseEntry(raw: string): { name: string; qty: number; unit: string } {
  const t = raw.trim().replace(/\s+/g, " ");
  const units = "(l|ml|kg|g|pcs|pack|packs|x)";
  let m = t.match(new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*${units}?\\s+(.+)$`, "i"));
  if (m) return { qty: parseFloat(m[1]!), unit: normUnit(m[2]), name: cap(m[3]!) };
  m = t.match(new RegExp(`^(.+?)\\s+(\\d+(?:\\.\\d+)?)\\s*${units}?$`, "i"));
  if (m) return { qty: parseFloat(m[2]!), unit: normUnit(m[3]), name: cap(m[1]!) };
  return { qty: 1, unit: "", name: cap(t) };
}
const normUnit = (u?: string) => (!u || u.toLowerCase() === "x" ? "" : u.toLowerCase() === "l" ? "L" : u.toLowerCase());
export const qtyLabel = (i: { qty: number; unit: string }) => (i.qty === 1 && !i.unit ? "" : `${i.qty}${i.unit === "L" || i.unit === "ml" || i.unit === "kg" || i.unit === "g" ? "" : " "}${i.unit || ""}`.trim());

const seedItems: [string, number, string, boolean?, Who?][] = [
  ["Oat milk", 2, "L"], ["Sourdough", 1, ""], ["Eggs", 12, "pcs", true, "S"], ["Spinach", 1, ""], ["Lemons", 4, ""],
  ["Dishwasher tablets", 1, ""], ["Coffee beans", 1, ""], ["Bananas", 6, "", true, "A"], ["Greek yoghurt", 1, ""], ["Chicken thighs", 1, "kg"],
];
const seed: State = {
  nextId: 200,
  justDone: false,
  overrides: {},
  items: seedItems.map(([name, qty, unit, bought, by], i) => ({ id: i + 1, name, qty, unit, cat: categorise(name, {}), bought: !!bought, by, at: bought ? NOW - 3600000 : undefined })),
  sessions: [
    { id: 101, at: NOW - 3 * DAY, items: [["Milk", 2, "L"], ["Bread", 1, ""], ["Rice", 5, "kg"], ["Bananas", 6, ""], ["Toilet roll", 1, ""]].map(([n, q, u]) => ({ name: n as string, qty: q as number, unit: u as string, cat: categorise(n as string, {}), by: "A" as Who })) },
    { id: 102, at: NOW - 9 * DAY, items: [["Eggs", 12, "pcs"], ["Pasta", 1, ""], ["Chopped tomatoes", 2, ""], ["Cheddar", 1, ""], ["Milk", 2, "L"]].map(([n, q, u]) => ({ name: n as string, qty: q as number, unit: u as string, cat: categorise(n as string, {}), by: "S" as Who })) },
    { id: 103, at: NOW - 24 * DAY, items: [["Bread", 1, ""], ["Salmon", 1, ""], ["Shampoo", 1, ""], ["Olive oil", 1, ""], ["Rice", 1, "kg"]].map(([n, q, u]) => ({ name: n as string, qty: q as number, unit: u as string, cat: categorise(n as string, {}), by: "A" as Who })) },
  ],
  counts: { milk: 6, eggs: 5, bread: 5, rice: 4, bananas: 4, pasta: 3, cheddar: 2, "olive oil": 2, "toilet roll": 2 },
};

const LS = "sifto-groceries-v1";
let state: State = seed;
let hydrated = false;
const listeners = new Set<() => void>();
const set = (fn: (s: State) => Partial<State>) => {
  state = { ...state, ...fn(state) };
  if (hydrated) try { localStorage.setItem(LS, JSON.stringify({ ...state, justDone: false })); } catch { /* ignore */ }
  listeners.forEach((l) => l());
};
export function hydrateGroceries() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(LS);
    if (raw) { state = { ...seed, ...JSON.parse(raw), justDone: false }; listeners.forEach((l) => l()); }
  } catch { /* ignore */ }
}
const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l));
export const useGroceries = () => useSyncExternalStore(subscribe, () => state, () => seed);

const haptic = () => { try { navigator.vibrate?.(12); } catch { /* ignore */ } };

export const g = {
  /** Adds an entry; if already on the active list, increases its quantity. Returns the item's name. */
  add(raw: string, by: Who = "A") {
    const p = parseEntry(raw);
    if (!p.name) return "";
    const existing = state.items.find((i) => !i.bought && key(i.name) === key(p.name));
    if (existing) {
      set((s) => ({ items: s.items.map((i) => (i.id === existing.id ? { ...i, qty: i.qty + (p.unit === i.unit ? p.qty : 1) } : i)) }));
      return existing.name;
    }
    set((s) => ({ items: [{ id: s.nextId, ...p, cat: categorise(p.name), bought: false }, ...s.items], nextId: s.nextId + 1 }));
    void by;
    return p.name;
  },
  buy(id: number, by: Who = "A") {
    haptic();
    set((s) => {
      const items = s.items.map((i) => (i.id === id ? { ...i, bought: true, by, at: Date.now() } : i));
      const all = items.length > 0 && items.every((i) => i.bought);
      return { items, justDone: all };
    });
  },
  undo(id: number) { set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, bought: false, by: undefined, at: undefined } : i)), justDone: false })); },
  update(id: number, patch: Partial<Pick<GItem, "name" | "qty" | "unit" | "cat">>) {
    set((s) => {
      const it = s.items.find((i) => i.id === id);
      const overrides = patch.cat && it ? { ...s.overrides, [key(patch.name ?? it.name)]: patch.cat } : s.overrides;
      return { overrides, items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) };
    });
  },
  remove(id: number) { set((s) => ({ items: s.items.filter((i) => i.id !== id) })); },
  /** Moves bought items into a history session; keeps the rest on the list. */
  finish() {
    const bought = state.items.filter((i) => i.bought);
    if (!bought.length) return null;
    const session: GSession = { id: state.nextId, at: Date.now(), items: bought.map((i) => ({ name: i.name, qty: i.qty, unit: i.unit, cat: i.cat, by: i.by ?? "A" })) };
    set((s) => {
      const counts = { ...s.counts };
      bought.forEach((i) => (counts[key(i.name)] = (counts[key(i.name)] ?? 0) + 1));
      return { items: s.items.filter((i) => !i.bought), sessions: [session, ...s.sessions], counts, nextId: s.nextId + 1, justDone: false };
    });
    return session;
  },
};

export function suggestions(q: string, limit = 6) {
  const k = key(q);
  if (!k) return [];
  const names = Array.from(new Set([...Object.keys(state.counts), ...PRODUCTS]));
  return names
    .filter((n) => n.includes(k))
    .sort((a, b) => Number(!a.startsWith(k)) - Number(!b.startsWith(k)) || (state.counts[b] ?? 0) - (state.counts[a] ?? 0) || a.length - b.length)
    .slice(0, limit)
    .map((n) => ({ name: cap(n), cat: categorise(n) }));
}

export function buyAgain(s: State, limit = 8) {
  const active = new Set(s.items.filter((i) => !i.bought).map((i) => key(i.name)));
  return Object.entries(s.counts).sort((a, b) => b[1] - a[1]).map(([n]) => n).filter((n) => !active.has(n)).slice(0, limit).map(cap);
}

export const gWho = (w?: Who) => (w === "S" ? "Sam" : "You");
export const fmtDay = (t: number) => {
  const d = Math.round((new Date(NOW).setHours(0, 0, 0, 0) - new Date(t).setHours(0, 0, 0, 0)) / DAY);
  return d <= 0 ? "Today" : d === 1 ? "Yesterday" : new Date(t).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
};
