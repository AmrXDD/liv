import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { requireSupabase } from "@/lib/supabase";
import { mapProduct, productToRow } from "@/lib/mappers";
import {
  BilingualField,
  Btn,
  Card,
  Field,
  ImageUploader,
  Input,
  LocaleListEditor,
  MultiImageUploader,
  PageHeader,
  Select,
  Toggle,
} from "@/components/admin/ui";
import type { Accent, LocalizedString, Product, ProductCategory } from "@/types";
import { slugify } from "@/lib/utils";

const blank: Product = {
  id: "",
  slug: "",
  category: "diy",
  title: { en: "", ar: "" },
  tagline: { en: "", ar: "" },
  description: { en: "", ar: "" },
  longDescription: { en: "", ar: "" },
  price: 0,
  currency: "USD",
  duration: { en: "", ar: "" },
  outcomes: [],
  inclusions: [],
  format: "PDF",
  badge: { en: "", ar: "" },
  heroImage: undefined,
  images: [],
  accent: "forest",
  isPublished: true,
  position: 0,
};

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Product>(blank);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-product", id],
    enabled: !isNew,
    queryFn: async () => {
      const sb = requireSupabase();
      const { data, error } = await sb.from("products").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data ? mapProduct(data) : null;
    },
  });

  useEffect(() => {
    if (existing) setForm(existing);
  }, [existing]);

  const set = <K extends keyof Product>(k: K, v: Product[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const setLs = (k: keyof Product, ls: LocalizedString) =>
    set(k, ls as never);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const sb = requireSupabase();
      const slug = form.slug || slugify(form.title.en);
      const row = productToRow({ ...form, slug });
      if (isNew) {
        const { data, error } = await sb.from("products").insert(row).select("id").single();
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["admin-products"] });
        nav(`/admin/products/${data.id}`, { replace: true });
      } else {
        const { error } = await sb.from("products").update(row).eq("id", id!);
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["admin-products"] });
        qc.invalidateQueries({ queryKey: ["admin-product", id] });
        qc.invalidateQueries({ queryKey: ["products"] });
        qc.invalidateQueries({ queryKey: ["product", form.slug] });
      }
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && isLoading) return <div className="text-sm text-ink-muted">Loading…</div>;

  return (
    <form onSubmit={onSave}>
      <PageHeader title={isNew ? "New product" : "Edit product"}>
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm hover:bg-bone-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
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
                label="Tagline"
                valueEn={form.tagline.en}
                valueAr={form.tagline.ar}
                onChange={(v) => setLs("tagline", v)}
              />
              <BilingualField
                label="Description"
                valueEn={form.description.en}
                valueAr={form.description.ar}
                onChange={(v) => setLs("description", v)}
                textarea
              />
              <BilingualField
                label="Long description (optional)"
                valueEn={form.longDescription?.en ?? ""}
                valueAr={form.longDescription?.ar ?? ""}
                onChange={(v) => setLs("longDescription", v)}
                textarea
              />
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 display-serif text-xl">Outcomes & inclusions</h2>
            <div className="space-y-6">
              <LocaleListEditor
                label="Outcomes"
                value={form.outcomes}
                onChange={(v) => set("outcomes", v as LocalizedString[])}
                placeholder="What they'll achieve"
              />
              <LocaleListEditor
                label="Inclusions"
                value={form.inclusions}
                onChange={(v) => set("inclusions", v as LocalizedString[])}
                placeholder="What's included"
              />
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 display-serif text-xl">Images</h2>
            <div className="space-y-6">
              <ImageUploader
                label="Hero image"
                value={form.heroImage}
                onChange={(url) => set("heroImage", url)}
                bucket="product-images"
                prefix="hero"
              />
              <MultiImageUploader
                label="Gallery"
                value={form.images ?? []}
                onChange={(urls) => set("images", urls)}
                bucket="product-images"
                prefix="gallery"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 display-serif text-xl">Settings</h2>
            <div className="space-y-4">
              <Field label="Slug" hint="URL-friendly. Auto from title if empty.">
                <Input
                  value={form.slug}
                  onChange={(e) => set("slug", e.currentTarget.value)}
                  placeholder="auto-generated"
                />
              </Field>
              <Field label="Category">
                <Select
                  value={form.category}
                  onChange={(e) => set("category", e.currentTarget.value as ProductCategory)}
                >
                  <option value="diy">DIY</option>
                  <option value="coaching">Coaching</option>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(e) => set("price", Number(e.currentTarget.value))}
                  />
                </Field>
                <Field label="Currency">
                  <Input
                    value={form.currency}
                    onChange={(e) => set("currency", e.currentTarget.value)}
                  />
                </Field>
              </div>
              <Field label="Format">
                <Select
                  value={form.format ?? "PDF"}
                  onChange={(e) => set("format", e.currentTarget.value)}
                >
                  <option>PDF</option>
                  <option>1:1</option>
                  <option>Group</option>
                  <option>Hybrid</option>
                </Select>
              </Field>
              <BilingualField
                label="Duration"
                valueEn={form.duration?.en ?? ""}
                valueAr={form.duration?.ar ?? ""}
                onChange={(v) => setLs("duration", v)}
              />
              <BilingualField
                label="Badge (optional)"
                valueEn={form.badge?.en ?? ""}
                valueAr={form.badge?.ar ?? ""}
                onChange={(v) => setLs("badge", v)}
              />
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
              <Field label="Position" hint="Lower numbers come first.">
                <Input
                  type="number"
                  value={form.position ?? 0}
                  onChange={(e) => set("position", Number(e.currentTarget.value))}
                />
              </Field>
              <Toggle
                label="Published"
                checked={form.isPublished ?? true}
                onChange={(v) => set("isPublished", v)}
              />
            </div>
          </Card>
        </div>
      </div>

    </form>
  );
}
