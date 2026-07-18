import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  product,
  variant = "primary",
  size = "lg",
  className,
}: {
  product: Product;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("w-full", className)}
      onClick={() => {
        addItem(product, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
      }}
    >
      {added ? (
        <>
          <Check className="me-2 h-4 w-4" /> {t("cart.added", { defaultValue: "Added!" })}
        </>
      ) : (
        <>
          <ShoppingBag className="me-2 h-4 w-4" />{" "}
          {t("cart.add", { defaultValue: "Add to cart" })}
        </>
      )}
    </Button>
  );
}
