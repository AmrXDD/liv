import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface DockSubItem {
  label: string;
  onClick: () => void;
  active?: boolean;
}

export interface DockItemData {
  icon: ReactNode;
  label: ReactNode;
  onClick?: () => void;
  active?: boolean;
  ariaLabel?: string;
  /** When set, tapping the item opens a popover menu instead of navigating. */
  submenu?: DockSubItem[];
}

interface DockProps {
  items: DockItemData[];
  className?: string;
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
  /** Cursor range (px) over which neighbouring items scale up. */
  distance?: number;
  spring?: { mass: number; stiffness: number; damping: number };
  /** Disable the hover magnification (used on touch / mobile). */
  magnify?: boolean;
}

const DEFAULT_SPRING = { mass: 0.1, stiffness: 170, damping: 12 };

/**
 * Dock — a macOS-style magnifying dock. Icons swell as the cursor nears them.
 * React Bits-inspired, rebuilt on the project's framer-motion + Tailwind.
 */
export function Dock({
  items,
  className,
  panelHeight = 68,
  baseItemSize = 50,
  magnification = 70,
  distance = 150,
  spring = DEFAULT_SPRING,
  magnify = true,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <motion.div
      onMouseMove={(e) => magnify && mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      role="toolbar"
      aria-label="Quick navigation"
      className={cn(
        "flex items-end gap-2 rounded-[1.75rem] border border-ink/10 bg-surface-base/85 px-3 shadow-elevation backdrop-blur-xl sm:gap-3 sm:px-4",
        className
      )}
      style={{ height: panelHeight, paddingBottom: (panelHeight - baseItemSize) / 2 }}
    >
      {items.map((item, i) => (
        <DockItem
          key={i}
          item={item}
          mouseX={mouseX}
          baseItemSize={baseItemSize}
          magnification={magnify ? magnification : baseItemSize}
          distance={distance}
          spring={spring}
          open={openIndex === i}
          onToggle={() => setOpenIndex((cur) => (cur === i ? null : i))}
          onClose={() => setOpenIndex(null)}
        />
      ))}
    </motion.div>
  );
}

function DockItem({
  item,
  mouseX,
  baseItemSize,
  magnification,
  distance,
  spring,
  open,
  onToggle,
  onClose,
}: {
  item: DockItemData;
  mouseX: MotionValue<number>;
  baseItemSize: number;
  magnification: number;
  distance: number;
  spring: { mass: number; stiffness: number; damping: number };
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const hasMenu = !!item.submenu?.length;

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  // Close the menu on outside click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      <motion.button
        type="button"
        onClick={hasMenu ? onToggle : item.onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label={item.ariaLabel}
        aria-current={item.active ? "page" : undefined}
        aria-haspopup={hasMenu || undefined}
        aria-expanded={hasMenu ? open : undefined}
        style={{ width: size, height: size }}
        className={cn(
          "relative grid shrink-0 place-items-center rounded-2xl border transition-colors",
          item.active || (hasMenu && open)
            ? "border-transparent bg-forest-500 text-bone-50 shadow-glow"
            : "border-ink/5 bg-surface-raised text-ink/70 hover:text-forest-600"
        )}
      >
        <span className="absolute inset-0 grid place-items-center [&>svg]:h-2/5 [&>svg]:w-2/5">
          {item.icon}
        </span>

        <AnimatePresence>
          {hovered && !open && (
            <motion.span
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-xs font-semibold text-bone-50 shadow-elevation"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {item.active && (
          <span className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-coral-500" aria-hidden />
        )}
      </motion.button>

      {/* Dropdown popover (e.g. About) */}
      {hasMenu && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              role="menu"
              className="absolute bottom-full mb-3 w-48 rounded-2xl border border-ink/10 bg-surface-raised p-2 shadow-elevation"
            >
              {item.submenu!.map((sub) => (
                <button
                  key={sub.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    sub.onClick();
                    onClose();
                  }}
                  className={cn(
                    "block w-full rounded-xl px-4 py-2.5 text-start text-sm font-medium transition-colors hover:bg-bone-100",
                    sub.active ? "text-forest-600" : "text-ink"
                  )}
                >
                  {sub.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

export default Dock;
