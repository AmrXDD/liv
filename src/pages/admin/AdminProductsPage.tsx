import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";
import { mapProduct, productToRow } from "@/lib/mappers";
import { Card, PageHeader } from "@/components/admin/ui";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

async function fetchAllProducts() {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("products")
    .select(
      "id,slug,category,title_en,title_ar,tagline_en,tagline_ar,description_en,description_ar,long_en,long_ar,price,currency,duration_en,duration_ar,format,badge_en,badge_ar,hero_image,images,accent,outcomes,inclusions,is_published,position"
    )
    .order("category")
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export function AdminProductsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchAllProducts,
  });

  const onDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const sb = requireSupabase();
    const { error } = await sb.from("products").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["featured-products"] });
  };

  const onDuplicate = async (p: Product) => {
    const sb = requireSupabase();
    // Slugs are unique — find a free "<slug>-copy", "<slug>-copy-2", etc.
    const taken = new Set(products.map((x) => x.slug));
    let newSlug = `${p.slug}-copy`;
    let n = 2;
    while (taken.has(newSlug)) newSlug = `${p.slug}-copy-${n++}`;

    const row = productToRow({
      ...p,
      slug: newSlug,
      title: { en: `${p.title.en} (Copy)`, ar: `${p.title.ar} (نسخة)` },
      isPublished: false,
      position: (p.position ?? 0) + 1,
    });
    const { data, error } = await sb
      .from("products")
      .insert(row)
      .select("id")
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["featured-products"] });
    navigate(`/admin/products/${data.id}`);
  };

  return (
    <>
      <PageHeader title="Products" description="Manage DIY plans and coaching programs.">
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-forest-500 px-5 py-2.5 text-sm font-semibold text-bone-50 hover:bg-forest-600"
        >
          <Plus className="h-4 w-4" /> New product
        </Link>
      </PageHeader>

      <Card className="p-0 overflow-hidden">
        {isLoading && <div className="p-8 text-sm text-ink-muted">Loading…</div>}
        {!isLoading && products.length === 0 && (
          <div className="p-12 text-center text-sm text-ink-muted">No products yet.</div>
        )}
        {products.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 bg-bone-100/60 text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-ink/5 last:border-0 hover:bg-bone-100/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.heroImage ? (
                        <img src={p.heroImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-bone-200 text-xs text-ink-muted">
                          —
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{p.title.en}</div>
                        <div className="text-xs text-ink-muted">/{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-medium uppercase tracking-wider">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{formatPrice(p.price, p.currency)}</td>
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
                      <Link
                        to={`/admin/products/${p.id}`}
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-bone-100"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDuplicate(p)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-bone-100"
                        aria-label="Duplicate"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p.id)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-coral-100 hover:border-coral-200 hover:text-coral-700"
                        aria-label="Delete"
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
