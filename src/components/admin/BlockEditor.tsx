import { useMemo, useState } from "react";
import { GripVertical, Trash2, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "@tanstack/react-query";
import { requireSupabase } from "@/lib/supabase";
import { mapProduct } from "@/lib/mappers";
import {
  BilingualField,
  Field,
  ImageUploader,
  Input,
  Select,
} from "@/components/admin/ui";
import type { Block, LocalizedString, Product } from "@/types";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function makeBlock(type: Block["type"]): Block {
  switch (type) {
    case "heading":
      return { id: uid(), type: "heading", level: 2, text: { en: "", ar: "" }, align: "start" };
    case "text":
      return { id: uid(), type: "text", text: { en: "", ar: "" }, align: "start" };
    case "image":
      return { id: uid(), type: "image", url: "", alt: "", rounded: true };
    case "button":
      return { id: uid(), type: "button", label: { en: "", ar: "" }, href: "/", variant: "primary", align: "start" };
    case "productGrid":
      return { id: uid(), type: "productGrid", productIds: [], columns: 3 };
    case "coachingGrid":
      return { id: uid(), type: "coachingGrid", productIds: [], columns: 3 };
    case "divider":
      return { id: uid(), type: "divider" };
  }
}

export function BlockEditor({
  block,
  onChange,
  onRemove,
}: {
  block: Block;
  onChange: (next: Block) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative rounded-3xl border border-ink/10 bg-surface-raised p-5 md:p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="grid h-8 w-8 cursor-grab place-items-center rounded-lg text-ink-muted hover:bg-bone-100"
          aria-label="Drag block"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          {block.type}
        </span>
        <div className="ms-auto">
          <button
            type="button"
            onClick={onRemove}
            className="grid h-8 w-8 place-items-center rounded-full text-ink-muted hover:bg-coral-100 hover:text-coral-700"
            aria-label="Delete block"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <BlockBody block={block} onChange={onChange} />
    </div>
  );
}

function BlockBody({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  switch (block.type) {
    case "heading":
      return (
        <div className="space-y-4">
          <BilingualField
            label="Heading text"
            valueEn={block.text.en}
            valueAr={block.text.ar}
            onChange={(text: LocalizedString) => onChange({ ...block, text })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Level">
              <Select
                value={block.level}
                onChange={(e) => onChange({ ...block, level: Number(e.currentTarget.value) as 1 | 2 | 3 })}
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </Select>
            </Field>
            <Field label="Align">
              <Select
                value={block.align ?? "start"}
                onChange={(e) => onChange({ ...block, align: e.currentTarget.value as "start" | "center" })}
              >
                <option value="start">Start</option>
                <option value="center">Center</option>
              </Select>
            </Field>
          </div>
        </div>
      );
    case "text":
      return (
        <div className="space-y-4">
          <BilingualField
            label="Body text"
            valueEn={block.text.en}
            valueAr={block.text.ar}
            onChange={(text) => onChange({ ...block, text })}
            textarea
          />
          <Field label="Align">
            <Select
              value={block.align ?? "start"}
              onChange={(e) => onChange({ ...block, align: e.currentTarget.value as "start" | "center" })}
            >
              <option value="start">Start</option>
              <option value="center">Center</option>
            </Select>
          </Field>
        </div>
      );
    case "image":
      return (
        <div className="space-y-4">
          <ImageUploader
            value={block.url || undefined}
            onChange={(url) => onChange({ ...block, url: url ?? "" })}
            bucket="page-images"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Alt text">
              <Input value={block.alt ?? ""} onChange={(e) => onChange({ ...block, alt: e.currentTarget.value })} />
            </Field>
            <Field label="Rounded">
              <Select
                value={block.rounded ? "yes" : "no"}
                onChange={(e) => onChange({ ...block, rounded: e.currentTarget.value === "yes" })}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Field>
          </div>
        </div>
      );
    case "button":
      return (
        <div className="space-y-4">
          <BilingualField
            label="Label"
            valueEn={block.label.en}
            valueAr={block.label.ar}
            onChange={(label) => onChange({ ...block, label })}
          />
          <Field label="URL or path">
            <Input
              value={block.href}
              onChange={(e) => onChange({ ...block, href: e.currentTarget.value })}
              placeholder="/coaching or https://…"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Variant">
              <Select
                value={block.variant ?? "primary"}
                onChange={(e) =>
                  onChange({ ...block, variant: e.currentTarget.value as "primary" | "secondary" | "ghost" })
                }
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="ghost">Ghost</option>
              </Select>
            </Field>
            <Field label="Align">
              <Select
                value={block.align ?? "start"}
                onChange={(e) => onChange({ ...block, align: e.currentTarget.value as "start" | "center" })}
              >
                <option value="start">Start</option>
                <option value="center">Center</option>
              </Select>
            </Field>
          </div>
        </div>
      );
    case "productGrid":
      return <ProductGridEditor block={block} onChange={onChange} />;
    case "coachingGrid":
      return <CoachingGridEditor block={block} onChange={onChange} />;
    case "divider":
      return <div className="text-xs text-ink-muted">Visual divider — no settings.</div>;
  }
}

function CoachingGridEditor({
  block,
  onChange,
}: {
  block: Extract<Block, { type: "coachingGrid" }>;
  onChange: (b: Block) => void;
}) {
  const { data: coaching = [] } = useQuery({
    queryKey: ["admin-coaching-products"],
    queryFn: async () => {
      const sb = requireSupabase();
      const { data, error } = await sb
        .from("products")
        .select("*")
        .eq("category", "coaching")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapProduct);
    },
  });
  const selected = new Set(block.productIds ?? []);
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ ...block, productIds: Array.from(next) });
  };

  return (
    <div className="space-y-4">
      <BilingualField
        label="Heading (optional)"
        valueEn={block.heading?.en ?? ""}
        valueAr={block.heading?.ar ?? ""}
        onChange={(heading) => onChange({ ...block, heading })}
      />
      <Field label="Columns">
        <Select
          value={block.columns ?? 3}
          onChange={(e) => onChange({ ...block, columns: Number(e.currentTarget.value) as 2 | 3 | 4 })}
        >
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </Select>
      </Field>
      <div>
        <div className="mb-2 text-sm font-medium">
          Programs <span className="font-normal text-ink-muted">— leave all unchecked to show every published program</span>
        </div>
        <div className="space-y-1 rounded-2xl border border-ink/10 bg-surface-base p-2">
          {coaching.length === 0 && (
            <div className="p-3 text-xs text-ink-muted">No coaching programs yet.</div>
          )}
          {coaching.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-bone-100"
            >
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggle(p.id)}
                className="h-4 w-4 accent-forest-500"
              />
              {p.heroImage ? (
                <img src={p.heroImage} alt="" className="h-7 w-7 rounded-md object-cover" />
              ) : (
                <div className="h-7 w-7 rounded-md bg-coral-100" />
              )}
              <div className="flex-1 truncate">
                <div className="truncate font-medium">{p.title.en}</div>
                <div className="text-xs text-ink-muted">/{p.slug}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductGridEditor({
  block,
  onChange,
}: {
  block: Extract<Block, { type: "productGrid" }>;
  onChange: (b: Block) => void;
}) {
  const [search, setSearch] = useState("");
  const { data: allProducts = [] } = useQuery({
    queryKey: ["admin-products-all"],
    queryFn: async () => {
      const sb = requireSupabase();
      const { data, error } = await sb.from("products").select("*").order("title_en");
      if (error) throw error;
      return (data ?? []).map(mapProduct);
    },
  });
  const byId = useMemo(() => new Map(allProducts.map((p) => [p.id, p])), [allProducts]);
  const selected = block.productIds.map((id) => byId.get(id)).filter(Boolean) as Product[];
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <BilingualField
        label="Heading (optional)"
        valueEn={block.heading?.en ?? ""}
        valueAr={block.heading?.ar ?? ""}
        onChange={(heading) => onChange({ ...block, heading })}
      />
      <Field label="Columns">
        <Select
          value={block.columns ?? 3}
          onChange={(e) => onChange({ ...block, columns: Number(e.currentTarget.value) as 2 | 3 | 4 })}
        >
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </Select>
      </Field>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">Selected products</div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs font-semibold text-forest-700 hover:underline"
          >
            {open ? "Done" : "+ Add products"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {selected.length === 0 && (
            <div className="text-xs text-ink-muted">No products selected.</div>
          )}
          {selected.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-2 rounded-full bg-bone-100 px-3 py-1.5 text-xs"
            >
              {p.title.en}
              <button
                type="button"
                onClick={() => onChange({ ...block, productIds: block.productIds.filter((x) => x !== p.id) })}
                className="grid h-4 w-4 place-items-center rounded-full hover:bg-coral-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        {open && (
          <div className="mt-3 rounded-2xl border border-ink/10 bg-surface-base p-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              placeholder="Search products"
              className="mb-2"
            />
            <div className="max-h-64 space-y-1 overflow-auto">
              {allProducts
                .filter((p) => !block.productIds.includes(p.id))
                .filter((p) =>
                  search
                    ? p.title.en.toLowerCase().includes(search.toLowerCase()) ||
                      p.slug.toLowerCase().includes(search.toLowerCase())
                    : true
                )
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      onChange({ ...block, productIds: [...block.productIds, p.id] })
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-bone-100"
                  >
                    {p.heroImage ? (
                      <img src={p.heroImage} alt="" className="h-7 w-7 rounded-md object-cover" />
                    ) : (
                      <div className="h-7 w-7 rounded-md bg-bone-200" />
                    )}
                    <div className="flex-1 truncate">
                      <div className="truncate font-medium">{p.title.en}</div>
                      <div className="text-xs text-ink-muted">{p.category} · /{p.slug}</div>
                    </div>
                    <span className="text-xs text-forest-700">+ Add</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

