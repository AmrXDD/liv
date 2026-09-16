import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { AlignCenter, AlignLeft, AlignRight, Trash2 } from "lucide-react";
import { normalizeLinkUrl, type ButtonVariant, type ImageAlign } from "./editorExtensions";
import { ControlBtn } from "./ImageNodeView";

const VARIANTS: { value: ButtonVariant; label: string }[] = [
  { value: "primary", label: "Green" },
  { value: "secondary", label: "Coral" },
  { value: "outline", label: "Outline" },
];

const ALIGNS: { value: ImageAlign; title: string; icon: typeof AlignLeft }[] = [
  { value: "left", title: "Align left", icon: AlignLeft },
  { value: "center", title: "Align center", icon: AlignCenter },
  { value: "right", title: "Align right", icon: AlignRight },
];

/** Editor view for CTA buttons: click the button to edit its text, link, colour and position. */
export function ButtonNodeView({ node, selected, updateAttributes, deleteNode, editor }: NodeViewProps) {
  const { text, href, variant, align } = node.attrs as {
    text: string;
    href: string;
    variant: ButtonVariant;
    align: ImageAlign;
  };
  const [linkDraft, setLinkDraft] = useState<string | null>(null);
  const showControls = selected && editor.isEditable;

  const commitLink = () => {
    if (linkDraft === null) return;
    const safe = linkDraft.trim() ? normalizeLinkUrl(linkDraft) : "";
    if (safe === null) window.alert("That URL scheme isn't allowed.");
    else updateAttributes({ href: safe });
    setLinkDraft(null);
  };

  return (
    <NodeViewWrapper className="relative my-6" style={{ textAlign: align }}>
      <span
        data-drag-handle
        draggable="true"
        className={`rich-button rich-button-${variant} cursor-pointer ${showControls ? "outline outline-2 outline-offset-4 outline-forest-500" : ""}`}
      >
        {text || "Button text"}
      </span>
      {!href && <span className="ms-2 align-middle text-xs font-semibold text-coral-600">No link yet</span>}

      {showControls && (
        <div
          contentEditable={false}
          dir="ltr"
          className="absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2 space-y-2 rounded-xl border border-ink/10 bg-surface-raised p-3 text-left text-xs shadow-elevation"
        >
          <label className="block">
            <span className="mb-1 block font-semibold text-ink-muted">Button text</span>
            <input
              value={text}
              onChange={(e) => updateAttributes({ text: e.currentTarget.value })}
              className="h-8 w-full rounded-md border border-ink/15 bg-surface-base px-2 text-sm focus:border-forest-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-semibold text-ink-muted">Link (e.g. https://… or /shop)</span>
            <input
              value={linkDraft ?? href}
              placeholder="https://"
              onChange={(e) => setLinkDraft(e.currentTarget.value)}
              onBlur={commitLink}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitLink();
                }
              }}
              className="h-8 w-full rounded-md border border-ink/15 bg-surface-base px-2 text-sm focus:border-forest-500 focus:outline-none"
            />
          </label>
          <div className="flex items-center gap-0.5">
            {VARIANTS.map((v) => (
              <ControlBtn key={v.value} title={v.label} active={variant === v.value} onClick={() => updateAttributes({ variant: v.value })}>
                {v.label}
              </ControlBtn>
            ))}
            <div className="mx-1 h-5 w-px bg-ink/10" />
            {ALIGNS.map(({ value, title, icon: Icon }) => (
              <ControlBtn key={value} title={title} active={align === value} onClick={() => updateAttributes({ align: value })}>
                <Icon className="h-3.5 w-3.5" />
              </ControlBtn>
            ))}
            <div className="ms-auto" />
            <ControlBtn title="Remove button" active={false} onClick={deleteNode}>
              <Trash2 className="h-3.5 w-3.5 text-coral-600" />
            </ControlBtn>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}
