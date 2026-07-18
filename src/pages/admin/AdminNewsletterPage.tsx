import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2 } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";
import { Btn, Card, Input, PageHeader } from "@/components/admin/ui";

interface NewsletterRow {
  id: string;
  email: string;
  locale: string;
  source: string | null;
  unsubscribed_at: string | null;
  created_at: string;
}

export function AdminNewsletterPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-newsletter"],
    queryFn: async (): Promise<NewsletterRow[]> => {
      const sb = requireSupabase();
      const { data, error } = await sb
        .from("newsletter")
        .select("id,email,locale,source,unsubscribed_at,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as NewsletterRow[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.email.toLowerCase().includes(q));
  }, [rows, search]);

  const activeCount = rows.filter((r) => !r.unsubscribed_at).length;

  const onDelete = async (id: string) => {
    if (!confirm("Delete this subscriber?")) return;
    const sb = requireSupabase();
    const { error } = await sb.from("newsletter").delete().eq("id", id);
    if (error) return alert(error.message);
    qc.invalidateQueries({ queryKey: ["admin-newsletter"] });
  };

  const exportCsv = () => {
    const header = ["email", "locale", "source", "subscribed_at", "unsubscribed_at"];
    const lines = [header.join(",")];
    for (const r of filtered) {
      const row = [
        escapeCsv(r.email),
        escapeCsv(r.locale ?? ""),
        escapeCsv(r.source ?? ""),
        escapeCsv(r.created_at ?? ""),
        escapeCsv(r.unsubscribed_at ?? ""),
      ];
      lines.push(row.join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Newsletter"
        description="Subscribers who joined via the footer signup form."
      >
        <Btn variant="ghost" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="h-4 w-4" /> Export CSV
        </Btn>
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="rounded-2xl border border-ink/10 bg-surface-raised px-4 py-3 text-sm">
          <span className="text-ink-muted">Total: </span>
          <span className="font-semibold">{rows.length}</span>
          <span className="mx-2 text-ink-muted">·</span>
          <span className="text-ink-muted">Active: </span>
          <span className="font-semibold">{activeCount}</span>
        </div>
        <div className="flex-1 min-w-[220px] max-w-md">
          <Input
            type="search"
            placeholder="Search email…"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading && <div className="p-8 text-sm text-ink-muted">Loading…</div>}
        {!isLoading && filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-ink-muted">
            {rows.length === 0
              ? "No subscribers yet. Sign-ups from the footer form will appear here."
              : "No matches."}
          </div>
        )}
        {filtered.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 bg-bone-100/60 text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Locale</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Subscribed</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-ink/5 last:border-0 hover:bg-bone-100/30"
                >
                  <td className="px-6 py-4 font-medium">{r.email}</td>
                  <td className="px-6 py-4 text-ink-muted uppercase">{r.locale}</td>
                  <td className="px-6 py-4 text-ink-muted">{r.source || "footer"}</td>
                  <td className="px-6 py-4 text-ink-muted">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {r.unsubscribed_at ? (
                      <span className="text-xs text-ink-muted">Unsubscribed</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-forest-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-forest-500" /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onDelete(r.id)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-coral-100 hover:text-coral-700"
                        aria-label="Delete subscriber"
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
    </>
  );
}

function escapeCsv(value: string): string {
  if (value == null) return "";
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
