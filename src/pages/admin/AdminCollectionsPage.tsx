import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";
import { mapCollection } from "@/lib/mappers";
import { Card, PageHeader } from "@/components/admin/ui";

export function AdminCollectionsPage() {
  const qc = useQueryClient();
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: async () => {
      const sb = requireSupabase();
      const { data, error } = await sb
        .from("collections")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapCollection);
    },
  });

  const onDelete = async (id: string) => {
    if (!confirm("Delete this collection?")) return;
    const sb = requireSupabase();
    const { error } = await sb.from("collections").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-collections"] });
    qc.invalidateQueries({ queryKey: ["collections"] });
  };

  return (
    <>
      <PageHeader title="Collections" description="Curated groupings of products.">
        <Link
          to="/admin/collections/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-forest-500 px-5 py-2.5 text-sm font-semibold text-bone-50 hover:bg-forest-600"
        >
          <Plus className="h-4 w-4" /> New collection
        </Link>
      </PageHeader>

      <Card className="p-0 overflow-hidden">
        {isLoading && <div className="p-8 text-sm text-ink-muted">Loading…</div>}
        {!isLoading && collections.length === 0 && (
          <div className="p-12 text-center text-sm text-ink-muted">No collections yet.</div>
        )}
        {collections.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 bg-bone-100/60 text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c) => (
                <tr key={c.id} className="border-b border-ink/5 last:border-0 hover:bg-bone-100/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {c.coverImage ? (
                        <img src={c.coverImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-bone-200 text-xs text-ink-muted">
                          —
                        </div>
                      )}
                      <div className="font-medium">{c.title.en}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-ink-muted">/{c.slug}</td>
                  <td className="px-6 py-4">
                    {c.isPublished ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-forest-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-forest-500" /> Published
                      </span>
                    ) : (
                      <span className="text-xs text-ink-muted">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`/collections/${c.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title={c.isPublished ? "View live" : "Preview (draft — not visible publicly)"}
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-bone-100"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <Link
                        to={`/admin/collections/${c.id}`}
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-bone-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(c.id)}
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
    </>
  );
}
