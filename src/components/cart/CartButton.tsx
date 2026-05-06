import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const { count, toggle } = useCart();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Open cart"
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-bone-50",
        className
      )}
    >
      <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
      {count > 0 && (
        <span className="absolute -top-1 -end-1 grid h-5 min-w-5 place-items-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-bone-50">
          {count}
        </span>
      )}
    </button>
  );
}
