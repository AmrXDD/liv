import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, MessageCircle, Trash2 } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";
import { Card, PageHeader } from "@/components/admin/ui";
import { QUIZ_BANDS } from "@/data/irQuiz";

interface LeadRow {
  id: string;
  created_at: string;
  source: string;
  name: string;
  phone: string;
  locale: string;
  score: number;
  score_max: number;
  band: string;
  utm: Record<string, string> | null;
  handled: boolean;
}

async function fetchLeads(): Promise<LeadRow[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.from("quiz_leads").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LeadRow[];
}

export function AdminQuizLeadsPage() {
  const qc = useQueryClient();
  const { data: leads = [], isLoading, error } = useQuery({ queryKey: ["admin-quiz-leads"], queryFn: fetchLeads });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-quiz-leads"] });

  const toggleHandled = async (id: string, handled: boolean) => {
    const { error: e } = await requireSupabase().from("quiz_leads").update({ handled: !handled }).eq("id", id);
    if (e) return alert(e.message);
    refresh();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    const { error: e } = await requireSupabase().from("quiz_leads").delete().eq("id", id);
    if (e) return alert(e.message);
    refresh();
  };

  const bandLabel = (id: string) => QUIZ_BANDS.find((b) => b.id === id)?.label.en ?? id;
  const unread = leads.filter((l) => !l.handled).length;

  return (
    <>
      <PageHeader
        title="Quiz leads"
        description="People who finished a lead-gen quiz and left a WhatsApp number. Source shows which page they came from."
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          ["Total", leads.length],
          ["New", unread],
          ["Handled", leads.length - unread],
        ].map(([label, n]) => (
          <div key={label as string} className="rounded-2xl border border-ink/10 bg-surface-raised p-4">
            <div className="text-xs uppercase tracking-wider text-ink-muted">{label}</div>
            <div className="display-serif text-3xl text-forest-700">{n}</div>
          </div>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading && <div className="p-8 text-sm text-ink-muted">Loading…</div>}
        {error && (
          <div className="p-8 text-sm text-coral-700">
            Could not load leads. If the <code>quiz_leads</code> table does not exist yet, run{" "}
            <code>supabase/quiz_leads.sql</code> in the Supabase SQL editor.
          </div>
        )}
        {!isLoading && !error && leads.length === 0 && (
          <div className="p-12 text-center text-sm text-ink-muted">No quiz leads yet.</div>
        )}
        {leads.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink/10 bg-bone-100/60 text-left text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">When</th>
                  <th className="px-6 py-3">Lead</th>
                  <th className="px-6 py-3">Result</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-ink/5 align-top last:border-0 hover:bg-bone-100/30">
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleHandled(l.id, l.handled)}
                        className="inline-flex items-center gap-2 text-xs"
                      >
                        {l.handled ? (
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
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-ink-muted">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{l.name}</div>
                      <a
                        href={`https://wa.me/${l.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-forest-700 hover:underline"
                      >
                        <MessageCircle className="h-3 w-3" />
                        {l.phone}
                      </a>
                      <div className="text-xs uppercase text-ink-muted">{l.locale}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{bandLabel(l.band)}</div>
                      <div className="text-xs text-ink-muted">
                        {l.score}/{l.score_max}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-medium">{l.source}</div>
                      {l.utm && Object.keys(l.utm).length > 0 && (
                        <div className="mt-1 text-ink-muted">
                          {Object.entries(l.utm)
                            .map(([k, v]) => `${k}=${v}`)
                            .join(" · ")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(l.id)}
                        className="text-ink-muted hover:text-coral-600"
                        aria-label="Delete lead"
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
