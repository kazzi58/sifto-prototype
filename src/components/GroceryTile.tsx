import { Link } from "@tanstack/react-router";
import { Basket, Check } from "@phosphor-icons/react";
import { ProgressRing } from "@/components/grocery-ui";
import { useGroceries } from "@/lib/grocery";

export function GroceryTile() {
  const { items } = useGroceries();
  const left = items.filter((i) => !i.bought).length;
  const got = items.length - left;
  const done = items.length > 0 && left === 0;
  return (
    <Link to="/groceries" className={`group relative overflow-hidden rounded-3xl p-4 transition-[background-color,transform] duration-700 active:scale-[0.97] ${done ? "bg-g-sage" : "bg-g-apricot"}`}>
      <Basket weight="duotone" className="absolute -bottom-3 -right-3 h-20 w-20 text-primary opacity-[0.1] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-card/70 text-primary"><Basket weight="duotone" className="h-5 w-5" /></span>
        <span className="relative grid place-items-center">
          <ProgressRing value={got} total={items.length} />
          {done && <Check weight="bold" className="animate-check-pop absolute h-3.5 w-3.5 text-primary" />}
        </span>
      </div>
      <p className="mt-6 text-[15px] font-bold">Groceries</p>
      {done ? (
        <p className="animate-fade-up text-xs font-bold text-primary">All picked up ✓</p>
      ) : (
        <p className="text-xs font-semibold text-primary">{left} left to buy<span className="text-muted-foreground"> · {got} picked up</span></p>
      )}
    </Link>
  );
}
