import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";
import { useNutritionIssues } from "@/lib/queries";
import {
  Btn,
  Card,
  Field,
  Input,
  PageHeader,
} from "@/components/admin/ui";

// Drafts can be a new row (no id) or an existing row (id).
type GroupDraft = {
  id?: string;
  slug: string;
  label_en: string;
  label_ar: string;
  position: number;
};

type ItemDraft = {
  id?: string;
  group_id: string;
  slug: string;
  label_en: string;
  label_ar: string;
  position: number;
};

export function AdminNutritionIssuesPage() {
  const qc = useQueryClient();
  const { data: groups = [], isLoading } = useNutritionIssues();
  const [groupDraft, setGroupDraft] = useState<GroupDraft | null>(null);
  const [itemDraft, setItemDraft] = useState<ItemDraft | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["nutrition-issues"] });
  };

  const onDeleteGroup = async (id: string, label: string) => {
    if (!confirm(`Delete group "${label}" and all its issues?`)) return;
    const sb = requireSupabase();
    const { error } = await sb.from("nutrition_issue_groups").delete().eq("id", id);
    if (error) return alert(error.message);
    invalidate();
  };

  const onDeleteItem = async (id: string, label: string) => {
    if (!confirm(`Delete "${label}"? Existing inquiries will keep the slug but lose its label.`))
      return;
    const sb = requireSupabase();
    const { error } = await sb.from("nutrition_issue_items").delete().eq("id", id);
    if (error) return alert(error.message);
    invalidate();
  };

  return (
    <>
      <PageHeader
        title="Nutrition issues"
        description="Categories and items shown on every coaching application form."
      >
        <Btn
          onClick={() =>
            setGroupDraft({
              slug: "",
              label_en: "",
              label_ar: "",
              position: groups.length,
            })
          }
        >
          <Plus className="h-4 w-4" /> New group
        </Btn>
      </PageHeader>

      {isLoading && (
        <Card>
          <div className="text-sm text-ink-muted">Loading…</div>
        </Card>
      )}

      {!isLoading && groups.length === 0 && (
        <Card>
          <div className="py-8 text-center text-sm text-ink-muted">
            No groups yet. Add one to start building the form.
          </div>
        </Card>
      )}

      <div className="space-y-5">
        {groups.map((g) => (
          <Card key={g.id} className="p-0 overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 px-6 py-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-muted">
                  {g.slug} · position {g.position}
                </div>
                <div className="display-serif text-xl">{g.label.en}</div>
                <div className="text-sm text-ink-muted" dir="rtl">
                  {g.label.ar}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Btn
                  variant="subtle"
                  size="sm"
                  onClick={() =>
                    setItemDraft({
                      group_id: g.id,
                      slug: "",
                      label_en: "",
                      label_ar: "",
                      position: g.items.length,
                    })
                  }
                >
                  <Plus className="h-3 w-3" /> Add item
                </Btn>
                <button
                  type="button"
                  onClick={() =>
                    setGroupDraft({
                      id: g.id,
                      slug: g.slug,
                      label_en: g.label.en,
                      label_ar: g.label.ar,
                      position: g.position,
                    })
                  }
                  className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-bone-100"
                  aria-label="Edit group"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteGroup(g.id, g.label.en)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-coral-100 hover:text-coral-700"
                  aria-label="Delete group"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {g.items.length === 0 ? (
              <div className="px-6 py-6 text-sm text-ink-muted">No items in this group.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-ink/10 bg-bone-100/40 text-left text-xs uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th className="px-6 py-2">Slug</th>
                    <th className="px-6 py-2">Label (EN)</th>
                    <th className="px-6 py-2">Label (AR)</th>
                    <th className="px-6 py-2">Position</th>
                    <th className="px-6 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((it) => (
                    <tr
                      key={it.id}
                      className="border-b border-ink/5 last:border-0 hover:bg-bone-100/30"
                    >
                      <td className="px-6 py-3 font-mono text-xs text-ink-muted">{it.slug}</td>
                      <td className="px-6 py-3">{it.label.en}</td>
                      <td className="px-6 py-3" dir="rtl">
                        {it.label.ar}
                      </td>
                      <td className="px-6 py-3 text-ink-muted">{it.position}</td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setItemDraft({
                                id: it.id,
                                group_id: g.id,
                                slug: it.slug,
                                label_en: it.label.en,
                                label_ar: it.label.ar,
                                position: it.position,
                              })
                            }
                            className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 hover:bg-bone-100"
                            aria-label="Edit item"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteItem(it.id, it.label.en)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 hover:bg-coral-100 hover:text-coral-700"
                            aria-label="Delete item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        ))}
      </div>

      {groupDraft && (
        <GroupDialog
          draft={groupDraft}
          onClose={() => setGroupDraft(null)}
          onSaved={() => {
            setGroupDraft(null);
            invalidate();
          }}
        />
      )}
      {itemDraft && (
        <ItemDialog
          draft={itemDraft}
          onClose={() => setItemDraft(null)}
          onSaved={() => {
            setItemDraft(null);
            invalidate();
          }}
        />
      )}
    </>
  );
}

function Dialog({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-surface-base p-8 shadow-elevation">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="display-serif text-2xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-bone-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-5">{children}</div>
        <div className="mt-8 flex justify-end gap-3">{footer}</div>
      </div>
    </div>
  );
}

function GroupDialog({
  draft,
  onClose,
  onSaved,
}: {
  draft: GroupDraft;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [d, setD] = useState<GroupDraft>(draft);
  const [saving, setSaving] = useState(false);
  useEffect(() => setD(draft), [draft]);

  const save = async () => {
    if (!d.slug.trim() || !d.label_en.trim() || !d.label_ar.trim()) {
      alert("Slug, English label and Arabic label are required.");
      return;
    }
    setSaving(true);
    try {
      const sb = requireSupabase();
      const payload = {
        slug: d.slug.trim(),
        label_en: d.label_en.trim(),
        label_ar: d.label_ar.trim(),
        position: Number(d.position) || 0,
      };
      const { error } = d.id
        ? await sb.from("nutrition_issue_groups").update(payload).eq("id", d.id)
        : await sb.from("nutrition_issue_groups").insert(payload);
      if (error) throw error;
      onSaved();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      title={d.id ? "Edit group" : "New group"}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Btn>
          <Btn onClick={save} loading={saving}>
            Save
          </Btn>
        </>
      }
    >
      <Field label="Slug *" hint="Lowercase, hyphens only — used internally. Don't change after publishing.">
        <Input
          value={d.slug}
          onChange={(e) => setD({ ...d, slug: e.currentTarget.value })}
          placeholder="weight"
        />
      </Field>
      <Field label="Label (English) *">
        <Input
          value={d.label_en}
          onChange={(e) => setD({ ...d, label_en: e.currentTarget.value })}
        />
      </Field>
      <Field label="Label (Arabic) *">
        <Input
          dir="rtl"
          value={d.label_ar}
          onChange={(e) => setD({ ...d, label_ar: e.currentTarget.value })}
        />
      </Field>
      <Field label="Position">
        <Input
          type="number"
          value={d.position}
          onChange={(e) => setD({ ...d, position: Number(e.currentTarget.value) })}
        />
      </Field>
    </Dialog>
  );
}

function ItemDialog({
  draft,
  onClose,
  onSaved,
}: {
  draft: ItemDraft;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [d, setD] = useState<ItemDraft>(draft);
  const [saving, setSaving] = useState(false);
  useEffect(() => setD(draft), [draft]);

  const save = async () => {
    if (!d.slug.trim() || !d.label_en.trim() || !d.label_ar.trim()) {
      alert("Slug, English label and Arabic label are required.");
      return;
    }
    setSaving(true);
    try {
      const sb = requireSupabase();
      const payload = {
        group_id: d.group_id,
        slug: d.slug.trim(),
        label_en: d.label_en.trim(),
        label_ar: d.label_ar.trim(),
        position: Number(d.position) || 0,
      };
      const { error } = d.id
        ? await sb.from("nutrition_issue_items").update(payload).eq("id", d.id)
        : await sb.from("nutrition_issue_items").insert(payload);
      if (error) throw error;
      onSaved();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      title={d.id ? "Edit issue" : "New issue"}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Btn>
          <Btn onClick={save} loading={saving}>
            Save
          </Btn>
        </>
      }
    >
      <Field
        label="Slug *"
        hint="Stored on inquiries. Don't change after going live — old inquiries would lose the label."
      >
        <Input
          value={d.slug}
          onChange={(e) => setD({ ...d, slug: e.currentTarget.value })}
          placeholder="pcos"
        />
      </Field>
      <Field label="Label (English) *">
        <Input
          value={d.label_en}
          onChange={(e) => setD({ ...d, label_en: e.currentTarget.value })}
        />
      </Field>
      <Field label="Label (Arabic) *">
        <Input
          dir="rtl"
          value={d.label_ar}
          onChange={(e) => setD({ ...d, label_ar: e.currentTarget.value })}
        />
      </Field>
      <Field label="Position">
        <Input
          type="number"
          value={d.position}
          onChange={(e) => setD({ ...d, position: Number(e.currentTarget.value) })}
        />
      </Field>
    </Dialog>
  );
}
