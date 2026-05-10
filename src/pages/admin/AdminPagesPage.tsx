import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ExternalLink, Pencil, Plus, Trash2, Type } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";
import { mapPage } from "@/lib/mappers";
import { Card, PageHeader } from "@/components/admin/ui";
import { listManagedPages } from "@/lib/content";

export function AdminPagesPage() {
  const qc = useQueryClient();
  const sections = listManagedPages();

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const sb = requireSupabase();
      const { data, error } = await sb.from("pages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapPage);
    },
  });

  const onDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    const sb = requireSupabase();
    const { error } = await sb.from("pages").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-pages"] });
  };

  return (
    <>
      <PageHeader
        title="Pages"
        description="Edit text for every page on the site. Layout and structure are locked — text only."
      >
        <Link
          to="/admin/pages/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-forest-500 px-5 py-2.5 text-sm font-semibold text-bone-50 hover:bg-forest-600"
        >
          <Plus className="h-4 w-4" /> New custom page
        </Link>
      </PageHeader>

      {/* Site sections — static pages whose copy lives in content + site_content */}
      <Card className="mb-8 p-0 overflow-hidden">
        <div className="border-b border-ink/10 bg-bone-100/60 px-6 py-3">
          <h2 className="text-eyebrow uppercase tracking-wider text-ink-muted">Site sections</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-6 py-3">Section</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Text elements</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => (
              <tr key={s.slug} className="border-b border-ink/5 last:border-0 hover:bg-bone-100/30">
                <td className="px-6 py-4 font-medium">{s.label}</td>
                <td className="px-6 py-4 text-ink-muted font-mono text-xs">{s.slug}</td>
                <td className="px-6 py-4 text-ink-muted">{s.count}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/admin/pages/text/${s.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-semibold hover:bg-bone-100"
                    >
                      <Type className="h-3.5 w-3.5" /> Edit Text
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Custom pages — admin-built block pages live at /p/:slug */}
      <Card className="p-0 overflow-hidden">
        <div className="border-b border-ink/10 bg-bone-100/60 px-6 py-3">
          <h2 className="text-eyebrow uppercase tracking-wider text-ink-muted">Custom pages</h2>
        </div>
        {isLoading && <div className="p-8 text-sm text-ink-muted">Loading…</div>}
        {!isLoading && pages.length === 0 && (
          <div className="p-12 text-center text-sm text-ink-muted">No custom pages yet.</div>
        )}
        {pages.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">URL</th>
                <th className="px-6 py-3">Blocks</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} className="border-b border-ink/5 last:border-0 hover:bg-bone-100/30">
                  <td className="px-6 py-4 font-medium">{p.title.en}</td>
                  <td className="px-6 py-4 text-ink-muted">/p/{p.slug}</td>
                  <td className="px-6 py-4 text-ink-muted">{p.blocks.length}</td>
                  <td className="px-6 py-4">
                    {p.isPublished ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-forest-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-forest-500" /> Published
                      </span>
                    ) : (
                      <span className="text-xs text-ink-muted">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {p.isPublished && (
                        <a
                          href={`/p/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-bone-100"
                          title="View"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        to={`/admin/pages/${p.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-semibold hover:bg-bone-100"
                        title="Edit text & blocks"
                      >
                        <Type className="h-3.5 w-3.5" /> Edit Text
                      </Link>
                      <Link
                        to={`/admin/pages/${p.id}`}
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-bone-100"
                        title="Open page builder"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(p.id)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-coral-100 hover:text-coral-700"
                        title="Delete"
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
