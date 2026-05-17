import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Mail, CheckCircle2, Circle } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";
import { useNutritionIssues } from "@/lib/queries";
import { Card, PageHeader } from "@/components/admin/ui";
import { labelForIssueSlug } from "@/data/nutritionIssues";

interface ContactRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  locale: string;
  handled: boolean;
  created_at: string;
  nutrition_issues: string[] | null;
}

async function fetchContacts(): Promise<ContactRow[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContactRow[];
}

export function AdminInquiriesPage() {
  const qc = useQueryClient();
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: fetchContacts,
  });
  const { data: issueGroups = [] } = useNutritionIssues();

  const toggleHandled = async (id: string, handled: boolean) => {
    const sb = requireSupabase();
    const { error } = await sb.from("contacts").update({ handled: !handled }).eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-contacts"] });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    const sb = requireSupabase();
    const { error } = await sb.from("contacts").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-contacts"] });
  };

  const unread = contacts.filter((c) => !c.handled).length;

  return (
    <>
      <PageHeader
        title="Inquiries"
        description="Messages submitted from the Contact page."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 bg-surface-raised p-4">
          <div className="text-xs uppercase tracking-wider text-ink-muted">Total</div>
          <div className="display-serif text-3xl text-forest-700">{contacts.length}</div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-surface-raised p-4">
          <div className="text-xs uppercase tracking-wider text-ink-muted">New</div>
          <div className="display-serif text-3xl text-coral-600">{unread}</div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-surface-raised p-4">
          <div className="text-xs uppercase tracking-wider text-ink-muted">Handled</div>
          <div className="display-serif text-3xl text-forest-700">
            {contacts.length - unread}
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading && <div className="p-8 text-sm text-ink-muted">Loading…</div>}
        {!isLoading && contacts.length === 0 && (
          <div className="p-12 text-center text-sm text-ink-muted">No inquiries yet.</div>
        )}
        {contacts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink/10 bg-bone-100/60 text-left text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">When</th>
                  <th className="px-6 py-3">From</th>
                  <th className="px-6 py-3">Subject &amp; message</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-ink/5 last:border-0 hover:bg-bone-100/30 align-top"
                  >
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleHandled(c.id, c.handled)}
                        className="inline-flex items-center gap-2 text-xs"
                        aria-label={c.handled ? "Mark as new" : "Mark as handled"}
                      >
                        {c.handled ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-forest-600" />
                            <span className="text-ink-muted">Handled</span>
                          </>
                        ) : (
                          <>
                            <Circle className="h-4 w-4 text-coral-600" />
                            <span className="font-medium text-coral-700">New</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-ink-muted whitespace-nowrap">
                      {new Date(c.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{c.name}</div>
                      <a
                        href={`mailto:${c.email}`}
                        className="inline-flex items-center gap-1 text-xs text-forest-700 hover:underline"
                      >
                        <Mail className="h-3 w-3" />
                        {c.email}
                      </a>
                      <div className="text-xs text-ink-muted uppercase">{c.locale}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xl">
                      {c.subject && (
                        <div className="font-medium text-ink mb-1">{c.subject}</div>
                      )}
                      {c.nutrition_issues && c.nutrition_issues.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {c.nutrition_issues.map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-forest-500/10 px-2 py-0.5 text-[11px] font-medium text-forest-700"
                            >
                              {labelForIssueSlug(issueGroups, s, "en")}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-ink-muted whitespace-pre-wrap">
                        {c.message}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => onDelete(c.id)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-coral-100 hover:text-coral-700"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
