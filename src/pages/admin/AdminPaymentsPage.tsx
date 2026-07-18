import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Trash2, ExternalLink } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";
import { Card, PageHeader, Select, Btn, Input } from "@/components/admin/ui";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  product_id: string;
  slug: string;
  category: string;
  title_en: string;
  title_ar: string;
  price: number;
  currency?: string;
  quantity: number;
  hero_image?: string | null;
}

interface OrderRow {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  items: OrderItem[];
  subtotal: number;
  total: number;
  currency: string;
  notes: string | null;
  status: string;
  payment_ref: string | null;
  stripe_payment_intent: string | null;
  stripe_session_id: string | null;
  paid_at: string | null;
  locale: string;
  created_at: string;
}

interface DigitalOrderRow {
  id: string;
  email: string;
  product_slug: string;
  download_url: string | null;
  download_expires_at: string | null;
  locale: string;
  created_at: string;
}

const STATUSES = ["pending", "paid", "fulfilled", "refunded", "cancelled"];

// Build a Stripe dashboard URL from a payment reference. Webhook stores
// payment_intent IDs (pi_…), but fall back to checkout sessions (cs_…) or
// charges (ch_…) defensively. Returns null for unknown shapes.
function stripeUrlFor(ref: string): string | null {
  const r = ref.trim();
  if (r.startsWith("pi_")) return `https://dashboard.stripe.com/payments/${r}`;
  if (r.startsWith("ch_")) return `https://dashboard.stripe.com/payments/${r}`;
  if (r.startsWith("cs_")) return `https://dashboard.stripe.com/payments?query=${r}`;
  if (r.startsWith("in_")) return `https://dashboard.stripe.com/invoices/${r}`;
  return null;
}

async function fetchOrders(): Promise<OrderRow[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as OrderRow[];
}

async function fetchDigitalOrders(): Promise<DigitalOrderRow[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("digital_orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DigitalOrderRow[];
}

export function AdminPaymentsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"orders" | "digital">("orders");
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchOrders,
  });
  const { data: digital = [] } = useQuery({
    queryKey: ["admin-digital-orders"],
    queryFn: fetchDigitalOrders,
  });

  const updateStatus = async (id: string, status: string) => {
    const sb = requireSupabase();
    const { error } = await sb.from("orders").update({ status }).eq("id", id);
    if (error) return alert(error.message);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const updateRef = async (id: string, payment_ref: string) => {
    const sb = requireSupabase();
    const { error } = await sb.from("orders").update({ payment_ref }).eq("id", id);
    if (error) return alert(error.message);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const markPaid = async (id: string) => {
    const sb = requireSupabase();
    const { error } = await sb.from("orders").update({ status: "paid" }).eq("id", id);
    if (error) return alert(error.message);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    const sb = requireSupabase();
    const { error } = await sb.from("orders").delete().eq("id", id);
    if (error) return alert(error.message);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const totalRevenue = orders
    .filter((o) => ["paid", "fulfilled"].includes(o.status))
    .reduce((s, o) => s + Number(o.total ?? 0), 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const currency = orders[0]?.currency ?? "USD";

  return (
    <>
      <PageHeader
        title="Payments & Orders"
        description="All cart checkouts plus DIY email-gated downloads."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label={`Total revenue (${currency})`}
          value={new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(totalRevenue)}
          accent="forest"
        />
        <Stat label="Pending" value={String(pendingCount)} accent="coral" />
        <Stat label="Cart orders" value={String(orders.length)} />
        <Stat label="Digital captures" value={String(digital.length)} />
      </div>

      <div className="mb-6 inline-flex rounded-full border border-ink/10 bg-surface-raised p-1">
        <TabBtn active={tab === "orders"} onClick={() => setTab("orders")}>
          Cart orders ({orders.length})
        </TabBtn>
        <TabBtn active={tab === "digital"} onClick={() => setTab("digital")}>
          Digital downloads ({digital.length})
        </TabBtn>
      </div>

      {tab === "orders" && (
        <Card className="p-0 overflow-hidden">
          {isLoading && <div className="p-8 text-sm text-ink-muted">Loading…</div>}
          {!isLoading && orders.length === 0 && (
            <div className="p-12 text-center text-sm text-ink-muted">No orders yet.</div>
          )}
          {orders.length > 0 && (
            <div className="divide-y divide-ink/5">
              {orders.map((o) => (
                <div key={o.id} className="p-6 hover:bg-bone-100/30">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-ink-muted">
                        #{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleString()}
                      </div>
                      <div className="mt-1 font-semibold">{o.name}</div>
                      <div className="text-sm text-ink-muted">{o.email}</div>
                      {o.phone && <div className="text-sm text-ink-muted">{o.phone}</div>}
                    </div>
                    <div className="text-end">
                      <div className="display-serif text-2xl text-forest-700">
                        {formatPrice(Number(o.total ?? 0), o.currency)}
                      </div>
                      <Select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.currentTarget.value)}
                        className="!py-1.5 !px-3 !text-xs !rounded-full w-auto mt-1"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <ul className="mt-4 divide-y divide-ink/5 rounded-xl border border-ink/10">
                    {(Array.isArray(o.items) ? o.items : []).map((item, i) => {
                      const title = item.title_en || item.title_ar || item.slug || "Item";
                      const qty = Number(item.quantity ?? 1);
                      const price = Number(item.price ?? 0);
                      return (
                        <li key={i} className="flex items-center justify-between gap-4 p-3 text-sm">
                          <div>
                            <div className="font-medium">{title}</div>
                            <div className="text-xs text-ink-muted">
                              {item.category ?? "—"} · qty {qty}
                            </div>
                          </div>
                          <div className="font-medium">
                            {formatPrice(price * qty, o.currency)}
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {o.notes && (
                    <div className="mt-3 rounded-xl bg-bone-100 px-4 py-3 text-xs text-ink-muted">
                      <strong>Note:</strong> {o.notes}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Input
                      placeholder="Payment reference / Stripe ID"
                      defaultValue={o.payment_ref ?? ""}
                      onBlur={(e) => {
                        const v = e.currentTarget.value;
                        if (v !== (o.payment_ref ?? "")) updateRef(o.id, v);
                      }}
                      className="max-w-xs !py-2 !text-xs"
                    />
                    {(() => {
                      const ref = o.stripe_payment_intent || o.stripe_session_id || o.payment_ref;
                      const url = ref ? stripeUrlFor(ref) : null;
                      return url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-3 py-1.5 text-xs hover:bg-bone-100"
                        >
                          Open in Stripe <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null;
                    })()}
                    {o.status === "pending" && (
                      <Btn type="button" variant="primary" size="sm" onClick={() => markPaid(o.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark paid
                      </Btn>
                    )}
                    <Btn
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(o.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "digital" && (
        <Card className="p-0 overflow-hidden">
          {digital.length === 0 ? (
            <div className="p-12 text-center text-sm text-ink-muted">
              No digital download captures yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-ink/10 bg-bone-100/60 text-left text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-6 py-3">When</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Link</th>
                </tr>
              </thead>
              <tbody>
                {digital.map((d) => (
                  <tr key={d.id} className="border-b border-ink/5 last:border-0 hover:bg-bone-100/30">
                    <td className="px-6 py-4 text-xs text-ink-muted">
                      {new Date(d.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium">{d.email}</td>
                    <td className="px-6 py-4">
                      <code className="rounded bg-bone-100 px-2 py-0.5 text-xs">{d.product_slug}</code>
                    </td>
                    <td className="px-6 py-4">
                      {d.download_url ? (
                        <a
                          href={d.download_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-forest-700 hover:underline"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-ink-muted">— not generated —</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "forest" | "coral";
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-surface-raised p-4">
      <div className="text-xs uppercase tracking-wider text-ink-muted">{label}</div>
      <div
        className={`display-serif text-3xl ${
          accent === "forest"
            ? "text-forest-700"
            : accent === "coral"
            ? "text-coral-600"
            : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? "bg-ink text-bone-50" : "text-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
