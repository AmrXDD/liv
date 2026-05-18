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
import type { B2bPillar } from "@/lib/queries";

type Draft = Omit<B2bPillar, "id"> & { id?: string };

const EMPTY: Draft = {
  tag: "",
  title_en: "",
  title_ar: "",
  body_en: "",
  body_ar: "",
  link_url: "",
  position: 0,
  is_published: true,
};

export function AdminB2bPillarsPage() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-b2b-pillars"],
    queryFn: async (): Promise<B2bPillar[]> => {
      const sb = requireSupabase();
      const { data, error } = await sb
        .from("b2b_pillars")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as B2bPillar[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-b2b-pillars"] });
    qc.invalidateQueries({ queryKey: ["b2b-pillars"] });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this card?")) return;
    const sb = requireSupabase();
    const { error } = await sb.from("b2b_pillars").delete().eq("id", id);
    if (error) return alert(error.message);
    invalidate();
  };

  return (
    <>
      <PageHeader
        title="Group & Workshops"
        description="Cards shown on /b2b — keynote, cohort, leadership 1:1, etc."
      >
        <Btn onClick={() => setDraft({ ...EMPTY, position: rows.length })}>
          <Plus className="h-4 w-4" /> New card
        </Btn>
      </PageHeader>

      <Card className="p-0 overflow-hidden">
        {isLoading && <div className="p-8 text-sm text-ink-muted">Loading…</div>}
        {!isLoading && rows.length === 0 && (
          <div className="p-12 text-center text-sm text-ink-muted">
            No cards yet — add the first one to populate the page.
          </div>
        )}
        {rows.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 bg-bone-100/60 text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-6 py-3">Tag</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Link</th>
                <th className="px-6 py-3">Position</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-ink/5 last:border-0 hover:bg-bone-100/30">
                  <td className="px-6 py-4 font-mono text-coral-600">{r.tag}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{r.title_en}</div>
                    <div className="text-xs text-ink-muted" dir="rtl">{r.title_ar}</div>
                  </td>
                  <td className="px-6 py-4 text-ink-muted truncate max-w-xs">{r.link_url || "—"}</td>
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
    if (!d.tag.trim() || !d.title_en.trim()) {
      alert("Tag and English title are required.");
      return;
    }
    setSaving(true);
    try {
      const sb = requireSupabase();
      const payload = {
        tag: d.tag.trim(),
        title_en: d.title_en.trim(),
        title_ar: d.title_ar?.trim() || null,
        body_en: d.body_en?.trim() || null,
        body_ar: d.body_ar?.trim() || null,
        link_url: d.link_url?.trim() || null,
        position: Number(d.position) || 0,
        is_published: d.is_published,
      };
      const { error } = d.id
        ? await sb.from("b2b_pillars").update(payload).eq("id", d.id)
        : await sb.from("b2b_pillars").insert(payload);
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
          <h2 className="display-serif text-2xl">{d.id ? "Edit card" : "New card"}</h2>
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
          <Field label="Tag (e.g. 01, 02)" hint="Short label shown above the title.">
            <Input
              value={d.tag}
              onChange={(e) => setD({ ...d, tag: e.currentTarget.value })}
              placeholder="01"
            />
          </Field>
          <BilingualField
            label="Title *"
            valueEn={d.title_en}
            valueAr={d.title_ar ?? ""}
            onChange={(v) => setD({ ...d, title_en: v.en, title_ar: v.ar })}
            required
          />
          <BilingualField
            label="Body"
            valueEn={d.body_en ?? ""}
            valueAr={d.body_ar ?? ""}
            onChange={(v) => setD({ ...d, body_en: v.en, body_ar: v.ar })}
            textarea
          />
          <Field label="Hyperlink (optional)" hint="Visitors clicking the card go here.">
            <Input
              value={d.link_url ?? ""}
              onChange={(e) => setD({ ...d, link_url: e.currentTarget.value })}
              placeholder="https://… or /contact"
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
            <div className="flex items-end">
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
