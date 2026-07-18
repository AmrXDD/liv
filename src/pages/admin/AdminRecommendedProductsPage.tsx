import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";
import {
  BilingualField,
  Btn,
  Card,
  Field,
  Input,
  PageHeader,
  Toggle,
} from "@/components/admin/ui";
import type { RecommendedProduct } from "@/lib/queries";

type Draft = Omit<RecommendedProduct, "id"> & { id?: string };

const EMPTY: Draft = {
  category_en: "",
  category_ar: "",
  name_en: "",
  name_ar: "",
  why_en: "",
  why_ar: "",
  url: "",
  is_affiliate: false,
  position: 0,
  is_published: true,
};

export function AdminRecommendedProductsPage() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-recommended-products"],
    queryFn: async (): Promise<RecommendedProduct[]> => {
      const sb = requireSupabase();
      const { data, error } = await sb
        .from("recommended_products")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RecommendedProduct[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-recommended-products"] });
    qc.invalidateQueries({ queryKey: ["recommended-products"] });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const sb = requireSupabase();
    const { error } = await sb.from("recommended_products").delete().eq("id", id);
    if (error) return alert(error.message);
    invalidate();
  };

  return (
    <>
      <PageHeader
        title="Recommended products"
        description="Affiliate / favorite tools shown on /recommended."
      >
        <Btn onClick={() => setDraft({ ...EMPTY, position: rows.length })}>
          <Plus className="h-4 w-4" /> New item
        </Btn>
      </PageHeader>

      <Card className="p-0 overflow-hidden">
        {isLoading && <div className="p-8 text-sm text-ink-muted">Loading…</div>}
        {!isLoading && rows.length === 0 && (
          <div className="p-12 text-center text-sm text-ink-muted">No items yet.</div>
        )}
        {rows.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 bg-bone-100/60 text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Affiliate</th>
                <th className="px-6 py-3">Position</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-ink/5 last:border-0 hover:bg-bone-100/30">
                  <td className="px-6 py-4">
                    <div className="font-medium">{r.name_en}</div>
                    <div className="text-xs text-ink-muted truncate max-w-xs">{r.url}</div>
                  </td>
                  <td className="px-6 py-4 text-ink-muted">{r.category_en}</td>
                  <td className="px-6 py-4">
                    {r.is_affiliate ? (
                      <span className="rounded-full bg-coral-100 px-2 py-0.5 text-xs text-coral-700">Yes</span>
                    ) : (
                      <span className="text-xs text-ink-muted">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-ink-muted">{r.position}</td>
                  <td className="px-6 py-4">
                    {r.is_published ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-forest-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-forest-500" /> Published
                      </span>
                    ) : (
                      <span className="text-xs text-ink-muted">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDraft({ ...r })}
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-bone-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(r.id)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-coral-100 hover:text-coral-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {draft && (
        <EditDialog
          draft={draft}
          onClose={() => setDraft(null)}
          onSaved={() => {
            setDraft(null);
            invalidate();
          }}
        />
      )}
    </>
  );
}

function EditDialog({
  draft,
  onClose,
  onSaved,
}: {
  draft: Draft;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [d, setD] = useState<Draft>(draft);
  const [saving, setSaving] = useState(false);

  useEffect(() => setD(draft), [draft]);

  const save = async () => {
    if (!d.name_en.trim() || !d.category_en.trim() || !d.url.trim()) {
      alert("Name, Category, and URL are required.");
      return;
    }
    setSaving(true);
    try {
      const sb = requireSupabase();
      const payload = {
        category_en: d.category_en.trim(),
        category_ar: d.category_ar?.trim() || null,
        name_en: d.name_en.trim(),
        name_ar: d.name_ar?.trim() || null,
        why_en: d.why_en?.trim() || null,
        why_ar: d.why_ar?.trim() || null,
        url: d.url.trim(),
        is_affiliate: d.is_affiliate,
        position: Number(d.position) || 0,
        is_published: d.is_published,
      };
      const { error } = d.id
        ? await sb.from("recommended_products").update(payload).eq("id", d.id)
        : await sb.from("recommended_products").insert(payload);
      if (error) throw error;
      onSaved();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-surface-base p-8 shadow-elevation">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="display-serif text-2xl">{d.id ? "Edit item" : "New item"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-bone-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          <BilingualField
            label="Category *"
            valueEn={d.category_en}
            valueAr={d.category_ar ?? ""}
            onChange={(v) => setD({ ...d, category_en: v.en, category_ar: v.ar })}
            required
          />
          <BilingualField
            label="Name *"
            valueEn={d.name_en}
            valueAr={d.name_ar ?? ""}
            onChange={(v) => setD({ ...d, name_en: v.en, name_ar: v.ar })}
            required
          />
          <BilingualField
            label="Why we recommend it"
            valueEn={d.why_en ?? ""}
            valueAr={d.why_ar ?? ""}
            onChange={(v) => setD({ ...d, why_en: v.en, why_ar: v.ar })}
            textarea
          />
          <Field label="Hyperlink (URL) *">
            <Input
              value={d.url}
              onChange={(e) => setD({ ...d, url: e.currentTarget.value })}
              placeholder="https://…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Position">
              <Input
                type="number"
                value={d.position}
                onChange={(e) => setD({ ...d, position: Number(e.currentTarget.value) })}
              />
            </Field>
            <div className="flex items-end gap-4">
              <Toggle
                label="Affiliate link"
                checked={d.is_affiliate}
                onChange={(v) => setD({ ...d, is_affiliate: v })}
              />
              <Toggle
                label="Published"
                checked={d.is_published}
                onChange={(v) => setD({ ...d, is_published: v })}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Btn variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Btn>
          <Btn onClick={save} loading={saving}>
            Save
          </Btn>
        </div>
      </div>
    </div>
  );
}
