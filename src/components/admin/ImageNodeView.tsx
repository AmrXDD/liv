import { useRef, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { AlignCenter, AlignLeft, AlignRight, Trash2 } from "lucide-react";
import type { ImageAlign } from "./editorExtensions";

const SIZES = [
  { label: "S", title: "Small (25%)", value: 25 },
  { label: "M", title: "Medium (50%)", value: 50 },
  { label: "L", title: "Large (75%)", value: 75 },
  { label: "Full", title: "Full width", value: 100 },
];

const ALIGNS: { value: ImageAlign; title: string; icon: typeof AlignLeft }[] = [
  { value: "left", title: "Align left", icon: AlignLeft },
  { value: "center", title: "Align center", icon: AlignCenter },
  { value: "right", title: "Align right", icon: AlignRight },
];

/**
 * Editor view for images: click an image to get size presets, alignment, alt
 * text and delete, or drag the corner handle to resize freely.
 */
export function ImageNodeView({ node, selected, updateAttributes, deleteNode, editor }: NodeViewProps) {
  const { src, alt, width, align } = node.attrs as {
    src: string;
    alt: string;
    width: number | null;
    align: ImageAlign | null;
  };
  const frameRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const shownWidth = dragWidth ?? width;
  const effectiveAlign = align ?? "center";
  const showControls = selected && editor.isEditable;

  const startResize = (e: React.PointerEvent<HTMLButtonElement>) => {
    const frame = frameRef.current;
    const column = frame?.parentElement;
    if (!frame || !column) return;
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);

    const columnWidth = column.getBoundingClientRect().width;
    const rect = frame.getBoundingClientRect();
    const toPercent = (clientX: number) => {
      const px =
        effectiveAlign === "left"
          ? clientX - rect.left
          : effectiveAlign === "right"
            ? rect.right - clientX
            : 2 * Math.abs(clientX - (rect.left + rect.width / 2));
      return Math.min(100, Math.max(10, Math.round((px / columnWidth) * 100)));
    };

    let latest = Math.round((rect.width / columnWidth) * 100);
    const onMove = (ev: PointerEvent) => {
      latest = toPercent(ev.clientX);
      setDragWidth(latest);
    };
    const onEnd = () => {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onEnd);
      handle.removeEventListener("pointercancel", onEnd);
      setDragWidth(null);
      updateAttributes({ width: latest });
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onEnd);
    handle.addEventListener("pointercancel", onEnd);
  };

  const editAlt = () => {
    const next = window.prompt("Describe this image (alt text, helps SEO and screen readers)", alt ?? "");
    if (next !== null) updateAttributes({ alt: next.trim() });
  };

  return (
    <NodeViewWrapper className="relative my-6">
      <div
        ref={frameRef}
        className="relative max-w-full"
        style={{
          width: shownWidth ? `${shownWidth}%` : "fit-content",
          marginLeft: effectiveAlign === "left" ? 0 : "auto",
          marginRight: effectiveAlign === "right" ? 0 : "auto",
        }}
      >
        <img
          src={src}
          alt={alt}
          draggable="true"
          data-drag-handle
          className={
            "block h-auto max-w-full cursor-pointer rounded-xl " +
            (shownWidth ? "w-full " : "") +
            (showControls ? "outline outline-2 outline-offset-2 outline-forest-500" : "")
          }
          style={{ margin: 0 }}
        />

        {showControls && (
          <>
            <button
              type="button"
              aria-label="Drag to resize"
              title="Drag to resize"
              onPointerDown={startResize}
              className={
                "absolute -bottom-2 h-4 w-4 touch-none rounded-full border-2 border-bone-50 bg-forest-500 shadow " +
                (effectiveAlign === "right" ? "-left-2 cursor-nesw-resize" : "-right-2 cursor-nwse-resize")
              }
            />
            {dragWidth && (
              <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-md bg-ink/80 px-2 py-0.5 text-xs font-semibold text-bone-50">
                {dragWidth}%
              </div>
            )}
          </>
        )}
      </div>

      {showControls && (
        <div
          contentEditable={false}
          dir="ltr"
          className="absolute left-1/2 top-full z-20 mt-3 flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap rounded-xl border border-ink/10 bg-surface-raised p-1 text-xs shadow-elevation"
        >
          {SIZES.map((s) => (
            <ControlBtn key={s.value} title={s.title} active={width === s.value} onClick={() => updateAttributes({ width: s.value })}>
              {s.label}
            </ControlBtn>
          ))}
          <ControlBtn title="Original size" active={!width} onClick={() => updateAttributes({ width: null })}>
            Auto
          </ControlBtn>
          <div className="mx-1 h-5 w-px bg-ink/10" />
          {ALIGNS.map(({ value, title, icon: Icon }) => (
            <ControlBtn key={value} title={title} active={effectiveAlign === value} onClick={() => updateAttributes({ align: value })}>
              <Icon className="h-3.5 w-3.5" />
            </ControlBtn>
          ))}
          <div className="mx-1 h-5 w-px bg-ink/10" />
          <ControlBtn title="Alt text" active={false} onClick={editAlt}>
            Alt
          </ControlBtn>
          <ControlBtn title="Remove image" active={false} onClick={deleteNode}>
            <Trash2 className="h-3.5 w-3.5 text-coral-600" />
          </ControlBtn>
        </div>
      )}
    </NodeViewWrapper>
  );
}

function ControlBtn({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      className={
        "grid h-7 min-w-7 place-items-center rounded-md px-1.5 font-semibold transition-colors " +
        (active ? "bg-forest-500 text-bone-50" : "text-ink hover:bg-bone-100")
      }
    >
      {children}
    </button>
  );
}
