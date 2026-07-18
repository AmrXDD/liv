import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";
import { Btn, Card, Field, Input, PageHeader, Textarea } from "@/components/admin/ui";

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  subject_en: string;
  subject_ar: string;
  body_en: string;
  body_ar: string;
  is_active: boolean;
  updated_at: string;
}

async function fetchTemplates(): Promise<EmailTemplate[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("email_templates")
    .select("*")
    .order("key", { ascending: true });
  if (error) throw error;
  return (data ?? []) as EmailTemplate[];
}

const VARIABLES_HELP: Record<string, string> = {
  welcome: "Available variables: {{name}}",
  booking_confirmation: "Available variables: {{name}}, {{topic}}, {{date}}, {{time}}",
  payment_confirmation:
    "Available variables: {{name}}, {{product}}, {{amount}}, {{download_or_next_steps}}",
  digital_delivery: "Available variables: {{name}}, {{product}}, {{download_url}}",
};

export function AdminEmailsPage() {
  const qc = useQueryClient();
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["admin-email-templates"],
    queryFn: fetchTemplates,
  });

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<EmailTemplate | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeKey && templates.length) setActiveKey(templates[0].key);
  }, [templates, activeKey]);

  useEffect(() => {
    const tmpl = templates.find((t) => t.key === activeKey);
    if (tmpl) setDraft({ ...tmpl });
  }, [activeKey, templates]);

  const onSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const sb = requireSupabase();
      const { error } = await sb
        .from("email_templates")
        .update({
          subject_en: draft.subject_en,
          subject_ar: draft.subject_ar,
          body_en: draft.body_en,
          body_ar: draft.body_ar,
          is_active: draft.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", draft.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["admin-email-templates"] });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Emails"
        description="Edit confirmation, welcome, and delivery emails. Variables in {{double-curly}} are filled in at send time."
      />

      {isLoading && <div className="p-8 text-sm text-ink-muted">Loading…</div>}

      {!isLoading && templates.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-3xl border border-ink/10 bg-surface-raised p-3">
            {templates.map((tmpl) => (
              <button
                key={tmpl.key}
                type="button"
                onClick={() => setActiveKey(tmpl.key)}
                className={`mb-1 flex w-full items-center justify-between rounded-xl px-4 py-3 text-start text-sm transition-colors ${
                  activeKey === tmpl.key
                    ? "bg-forest-500 text-bone-50"
                    : "text-ink hover:bg-bone-100"
                }`}
              >
                <span>
                  <div className="font-semibold">{tmpl.name}</div>
                  <div className="text-xs opacity-70">{tmpl.key}</div>
                </span>
                {!tmpl.is_active && (
                  <span className="text-[10px] uppercase opacity-60">off</span>
                )}
              </button>
            ))}
          </aside>

          {draft && (
            <Card>
              <div className="space-y-5">
                <div className="text-xs text-ink-muted">
                  {VARIABLES_HELP[draft.key] ?? ""}
                </div>

                <Field label="Subject (English)">
                  <Input
                    value={draft.subject_en}
                    onChange={(e) => setDraft({ ...draft, subject_en: e.currentTarget.value })}
                  />
                </Field>

                <Field label="Body (English)">
                  <Textarea
                    rows={10}
                    value={draft.body_en}
                    onChange={(e) => setDraft({ ...draft, body_en: e.currentTarget.value })}
                  />
                </Field>

                <Field label="Subject (العربية)">
                  <Input
                    dir="rtl"
                    value={draft.subject_ar}
                    onChange={(e) => setDraft({ ...draft, subject_ar: e.currentTarget.value })}
                  />
                </Field>

                <Field label="Body (العربية)">
                  <Textarea
                    dir="rtl"
                    rows={10}
                    value={draft.body_ar}
                    onChange={(e) => setDraft({ ...draft, body_ar: e.currentTarget.value })}
                  />
                </Field>

                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.is_active}
                    onChange={(e) => setDraft({ ...draft, is_active: e.currentTarget.checked })}
                  />
                  Active — send this email automatically
                </label>

                <div className="flex items-center justify-between border-t border-ink/10 pt-5">
                  <div className="text-xs text-ink-muted">
                    Last updated {new Date(draft.updated_at).toLocaleString()}
                  </div>
                  <Btn onClick={onSave} loading={saving}>
                    <Save className="h-4 w-4" />
                    Save
                  </Btn>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
