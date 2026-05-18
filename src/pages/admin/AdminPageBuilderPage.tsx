import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Eye } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { requireSupabase } from "@/lib/supabase";
import { mapPage, pageToRow } from "@/lib/mappers";
import {
  BilingualField,
  Btn,
  Card,
  Field,
  Input,
  PageHeader,
  Toggle,
} from "@/components/admin/ui";
import { BlockEditor, makeBlock } from "@/components/admin/BlockEditor";
import { BlocksList } from "@/components/blocks/BlockRenderer";
import type { Block, LocalizedString, Page } from "@/types";
import { slugify } from "@/lib/utils";

const PALETTE: { type: Block["type"]; label: string }[] = [
  { type: "heading", label: "Heading" },
  { type: "text", label: "Plain text" },
  { type: "richText", label: "Rich text (WYSIWYG)" },
  { type: "image", label: "Image" },
  { type: "button", label: "Button" },
  { type: "productGrid", label: "Product grid" },
  { type: "coachingGrid", label: "Coaching widget" },
  { type: "divider", label: "Divider" },
];

const blank: Page = {
  id: "",
  slug: "",
  title: { en: "", ar: "" },
  description: { en: "", ar: "" },
  blocks: [],
  isPublished: false,
};

export function AdminPageBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Page>(blank);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-page", id],
    enabled: !isNew,
    queryFn: async () => {
      const sb = requireSupabase();
      const { data, error } = await sb.from("pages").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data ? mapPage(data) : null;
    },
  });

  useEffect(() => {
    if (existing) setForm(existing);
  }, [existing]);

  const set = <K extends keyof Page>(k: K, v: Page[K]) => setForm((s) => ({ ...s, [k]: v }));
  const setLs = (k: keyof Page, ls: LocalizedString) => set(k, ls as never);

  const addBlock = (type: Block["type"]) => {
    setForm((s) => ({ ...s, blocks: [...s.blocks, makeBlock(type)] }));
  };

  const updateBlock = (idx: number, next: Block) => {
    setForm((s) => {
      const blocks = [...s.blocks];
      blocks[idx] = next;
      return { ...s, blocks };
    });
  };

  const removeBlock = (idx: number) => {
    setForm((s) => ({ ...s, blocks: s.blocks.filter((_, i) => i !== idx) }));
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = form.blocks.findIndex((b) => b.id === active.id);
    const newIdx = form.blocks.findIndex((b) => b.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    setForm((s) => ({ ...s, blocks: arrayMove(s.blocks, oldIdx, newIdx) }));
  };

  const onSave = async () => {
    setErr(null);
    setSaving(true);
    try {
      const sb = requireSupabase();
      const slug = form.slug || slugify(form.title.en);
      const row = pageToRow({ ...form, slug });
      if (isNew) {
        const { data, error } = await sb.from("pages").insert(row).select("id").single();
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["admin-pages"] });
        nav(`/admin/pages/${data.id}`, { replace: true });
      } else {
        const { error } = await sb.from("pages").update(row).eq("id", id!);
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["admin-pages"] });
        qc.invalidateQueries({ queryKey: ["admin-page", id] });
        qc.invalidateQueries({ queryKey: ["page", form.slug] });
      }
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && isLoading) return <div className="text-sm text-ink-muted">Loading…</div>;

  return (
    <>
      <PageHeader title={isNew ? "New page" : "Edit page"} description={`Lives at /p/${form.slug || "…"}`}>
        <Link
          to="/admin/pages"
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm hover:bg-bone-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm hover:bg-bone-100"
        >
          <Eye className="h-4 w-4" /> {preview ? "Edit" : "Preview"}
        </button>
        {!isNew && form.isPublished && (
          <a
            href={`/p/${form.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm hover:bg-bone-100"
          >
            <ExternalLink className="h-4 w-4" /> View live
          </a>
        )}
        <Btn onClick={onSave} variant="primary" loading={saving}>
          Save
        </Btn>
      </PageHeader>

      {err && (
        <div className="mb-6 rounded-2xl bg-coral-100 px-4 py-3 text-sm text-coral-700">{err}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <div className="space-y-5">
              <BilingualField
                label="Title"
                required
                valueEn={form.title.en}
                valueAr={form.title.ar}
                onChange={(v) => setLs("title", v)}
              />
              <BilingualField
                label="Meta description"
                valueEn={form.description?.en ?? ""}
                valueAr={form.description?.ar ?? ""}
                onChange={(v) => setLs("description", v)}
                textarea
              />
              <Field label="Slug" hint="Auto from title if empty.">
                <Input
                  value={form.slug}
                  onChange={(e) => set("slug", e.currentTarget.value)}
                  placeholder="auto-generated"
                />
              </Field>
              <Toggle
                label="Published"
                checked={form.isPublished}
                onChange={(v) => set("isPublished", v)}
              />
            </div>
          </Card>

          {preview ? (
            <div className="rounded-3xl border border-ink/10 bg-surface-base">
              {form.blocks.length === 0 ? (
                <div className="p-12 text-center text-sm text-ink-muted">No blocks yet.</div>
              ) : (
                <BlocksList blocks={form.blocks} />
              )}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={form.blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {form.blocks.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-ink/15 p-12 text-center text-sm text-ink-muted">
                      No blocks yet. Add one from the palette on the right.
                    </div>
                  )}
                  {form.blocks.map((b, i) => (
                    <BlockEditor
                      key={b.id}
                      block={b}
                      onChange={(next) => updateBlock(i, next)}
                      onRemove={() => removeBlock(i)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <h2 className="mb-3 display-serif text-xl">Add block</h2>
            <div className="grid grid-cols-2 gap-2">
              {PALETTE.map((p) => (
                <button
                  key={p.type}
                  type="button"
                  onClick={() => addBlock(p.type)}
                  className="rounded-2xl border border-ink/10 bg-surface-base px-3 py-3 text-sm font-medium hover:border-forest-500 hover:bg-bone-100"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-ink-muted">
              Drag blocks by the grip handle to reorder.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
