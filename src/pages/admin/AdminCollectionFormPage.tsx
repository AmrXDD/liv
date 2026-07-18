import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, GripVertical, Search, X } from "lucide-react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { requireSupabase } from "@/lib/supabase";
import { collectionToRow, mapCollection, mapProduct } from "@/lib/mappers";
import {
  BilingualField,
  Btn,
  Card,
  Field,
  ImageUploader,
  Input,
  PageHeader,
  Select,
  Toggle,
} from "@/components/admin/ui";
import type { Accent, Collection, LocalizedString, Product } from "@/types";
import { slugify } from "@/lib/utils";

const blank: Collection = {
  id: "",
  slug: "",
  title: { en: "", ar: "" },
  description: { en: "", ar: "" },
  coverImage: undefined,
  accent: "forest",
  isPublished: true,
  position: 0,
  products: [],
};

function SortableProductRow({ product, onRemove }: { product: Product; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
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
      className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-surface-base p-3"
    >
      <button
        type="button"
        className="grid h-8 w-8 cursor-grab place-items-center rounded-lg text-ink-muted hover:bg-bone-100"
        {...attributes}
        {...listeners}
        aria-label="Drag"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {product.heroImage ? (
        <img src={product.heroImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
      ) : (
        <div className="h-10 w-10 rounded-lg bg-bone-200" />
      )}
      <div className="flex-1">
        <div className="text-sm font-medium">{product.title.en}</div>
        <div className="text-xs text-ink-muted">/{product.slug}</div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="grid h-8 w-8 place-items-center rounded-full hover:bg-coral-100 hover:text-coral-700"
        aria-label="Remove"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AdminCollectionFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Collection>(blank);
  const [assigned, setAssigned] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load collection + linked products
  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-collection", id],
    enabled: !isNew,
    queryFn: async () => {
      const sb = requireSupabase();
      const { data, error } = await sb
        .from("collections")
        .select("*, collection_products(product_id, position, products(*))")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const c = mapCollection(data);
      const links = ((data as { collection_products?: Array<{ position: number; products: never }> })
        .collection_products ?? []).sort((a, b) => a.position - b.position);
      const ps = links.map((l) => mapProduct(l.products as never));
      return { collection: c, products: ps };
    },
  });

  useEffect(() => {
    if (existing) {
      setForm(existing.collection);
      setAssigned(existing.products);
    }
  }, [existing]);

  // All products for picker
  const { data: allProducts = [] } = useQuery({
    queryKey: ["admin-products-all"],
    queryFn: async () => {
      const sb = requireSupabase();
      const { data, error } = await sb.from("products").select("*").order("title_en");
      if (error) throw error;
      return (data ?? []).map(mapProduct);
    },
  });

  const assignedIds = useMemo(() => new Set(assigned.map((p) => p.id)), [assigned]);
  const candidates = useMemo(
    () =>
      allProducts
        .filter((p) => !assignedIds.has(p.id))
        .filter((p) =>
          search
            ? p.title.en.toLowerCase().includes(search.toLowerCase()) ||
              p.slug.toLowerCase().includes(search.toLowerCase())
            : true
        ),
    [allProducts, assignedIds, search]
  );

  const set = <K extends keyof Collection>(k: K, v: Collection[K]) =>
    setForm((s) => ({ ...s, [k]: v }));
  const setLs = (k: keyof Collection, ls: LocalizedString) => set(k, ls as never);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = assigned.findIndex((p) => p.id === active.id);
    const newIdx = assigned.findIndex((p) => p.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    setAssigned((prev) => arrayMove(prev, oldIdx, newIdx));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const sb = requireSupabase();
      const slug = form.slug || slugify(form.title.en);
      const row = collectionToRow({ ...form, slug });

      let collectionId = id!;
      if (isNew) {
        const { data, error } = await sb.from("collections").insert(row).select("id").single();
        if (error) throw error;
        collectionId = data.id;
      } else {
        const { error } = await sb.from("collections").update(row).eq("id", id!);
        if (error) throw error;
      }

      // Replace linked products
      await sb.from("collection_products").delete().eq("collection_id", collectionId);
      if (assigned.length > 0) {
        const links = assigned.map((p, i) => ({
          collection_id: collectionId,
          product_id: p.id,
          position: i,
        }));
        const { error } = await sb.from("collection_products").insert(links);
        if (error) throw error;
      }

      qc.invalidateQueries({ queryKey: ["admin-collections"] });
      qc.invalidateQueries({ queryKey: ["admin-collection", collectionId] });
      qc.invalidateQueries({ queryKey: ["collections"] });
      qc.invalidateQueries({ queryKey: ["collection", form.slug] });

      if (isNew) nav(`/admin/collections/${collectionId}`, { replace: true });
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && isLoading) return <div className="text-sm text-ink-muted">Loading…</div>;

  return (
    <form onSubmit={onSave}>
      <PageHeader title={isNew ? "New collection" : "Edit collection"}>
        <Link
          to="/admin/collections"
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm hover:bg-bone-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        {!isNew && form.slug && (
          <a
            href={`/collections/${form.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm hover:bg-bone-100"
          >
            <ExternalLink className="h-4 w-4" /> View live
          </a>
        )}
        <Btn type="submit" variant="primary" loading={saving}>
          Save
        </Btn>
      </PageHeader>

      {err && (
        <div className="mb-6 rounded-2xl bg-coral-100 px-4 py-3 text-sm text-coral-700">{err}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
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
                label="Description"
                valueEn={form.description?.en ?? ""}
                valueAr={form.description?.ar ?? ""}
                onChange={(v) => setLs("description", v)}
                textarea
              />
              <ImageUploader
                label="Cover image"
                value={form.coverImage}
                onChange={(url) => set("coverImage", url)}
                bucket="collection-images"
              />
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="display-serif text-xl">Products in this collection</h2>
              <span className="text-xs text-ink-muted">{assigned.length} selected · drag to reorder</span>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={assigned.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {assigned.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-ink/15 p-6 text-center text-xs text-ink-muted">
                      No products assigned yet. Pick from the list on the right.
                    </div>
                  )}
                  {assigned.map((p) => (
                    <SortableProductRow
                      key={p.id}
                      product={p}
                      onRemove={() => setAssigned((prev) => prev.filter((x) => x.id !== p.id))}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 display-serif text-xl">Settings</h2>
            <div className="space-y-4">
              <Field label="Slug" hint="Auto from title if empty.">
                <Input
                  value={form.slug}
                  onChange={(e) => set("slug", e.currentTarget.value)}
                  placeholder="auto-generated"
                />
              </Field>
              <Field label="Accent">
                <Select
                  value={form.accent ?? "forest"}
                  onChange={(e) => set("accent", e.currentTarget.value as Accent)}
                >
                  <option value="forest">Forest</option>
                  <option value="coral">Coral</option>
                  <option value="bone">Bone</option>
                </Select>
              </Field>
              <Field label="Position">
                <Input
                  type="number"
                  value={form.position}
                  onChange={(e) => set("position", Number(e.currentTarget.value))}
                />
              </Field>
              <Toggle
                label="Published"
                checked={form.isPublished}
                onChange={(v) => set("isPublished", v)}
              />
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 display-serif text-xl">Add products</h2>
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                placeholder="Search products"
                className="ps-10"
              />
            </div>
            <div className="max-h-96 space-y-1 overflow-auto pr-1">
              {candidates.length === 0 && (
                <div className="text-xs text-ink-muted">No more products to add.</div>
              )}
              {candidates.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setAssigned((prev) => [...prev, p])}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-bone-100"
                >
                  {p.heroImage ? (
                    <img src={p.heroImage} alt="" className="h-8 w-8 rounded-md object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-md bg-bone-200" />
                  )}
                  <div className="flex-1 truncate">
                    <div className="truncate font-medium">{p.title.en}</div>
                    <div className="text-xs text-ink-muted">{p.category} · /{p.slug}</div>
                  </div>
                  <span className="text-xs text-forest-700">+ Add</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
