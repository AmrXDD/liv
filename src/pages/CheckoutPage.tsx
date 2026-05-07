import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { SEO } from "@/components/seo/SEO";
import { useCart } from "@/lib/cart";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import type { Product } from "@/types";

export function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const { items, subtotal, currency, updateQty, removeItem, clear } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [downloads, setDownloads] = useState<
    Array<{ slug: string; title: string; url: string }>
  >([]);
  const qc = useQueryClient();

  if (items.length === 0 && status !== "ok") {
    return <Navigate to="/" replace />;
  }

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const sb = getSupabase();
    try {
      if (sb) {
        const payload = {
          email,
          name,
          phone: phone || null,
          items: items.map((i) => ({
            product_id: i.productId,
            slug: i.slug,
            category: i.category,
            title: i.title,
            price: i.price,
            qty: i.qty,
          })),
          subtotal,
          total: subtotal,
          currency,
          notes: notes || null,
          status: "pending",
          locale: lang,
        };
        const { error } = await sb.from("orders").insert(payload);
        if (error) throw error;
      }
      const purchasedDownloads = items
        .filter((i) => i.category === "diy")
        .map((i) => {
          const cached = qc
            .getQueriesData<Product[]>({ queryKey: ["products", "diy"] })
            .flatMap(([, data]) => data ?? [])
            .find((p) => p?.id === i.productId);
          const single = qc.getQueryData<Product | null>(["product", i.slug]);
          const product = cached ?? single ?? null;
          if (!product?.downloadUrl) return null;
          return {
            slug: i.slug,
            title: product.title[lang] || i.title[lang],
            url: product.downloadUrl,
          };
        })
        .filter(Boolean) as Array<{ slug: string; title: string; url: string }>;
      setDownloads(purchasedDownloads);
      setStatus("ok");
      clear();
      if (purchasedDownloads.length === 0) {
        setTimeout(() => navigate("/"), 4000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Order failed.");
      setStatus("err");
    }
  };

  if (status === "ok") {
    return (
      <Section variant="default" pad="md" className="bg-editorial">
        <Container>
          <div className="mx-auto max-w-xl py-20 text-center">
            <div className="text-eyebrow uppercase mb-4 text-forest-700">Order received</div>
            <h1 className="display-serif text-display-lg tracking-tightest">
              Thank you{name ? `, ${name}` : ""}.
            </h1>
            <p className="mt-6 text-ink-muted">
              We've received your order and will email you shortly with payment instructions and
              next steps.
            </p>
            {downloads.length > 0 && (
              <div className="mt-10 rounded-3xl border border-forest-500/30 bg-forest-50 p-6 text-start">
                <div className="text-eyebrow uppercase text-forest-700 mb-3">
                  Your digital products
                </div>
                <ul className="space-y-3">
                  {downloads.map((d) => (
                    <li key={d.slug} className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium">{d.title}</span>
                      <a
                        href={d.url}
                        download
                        className="inline-flex items-center rounded-full bg-forest-600 px-4 py-2 text-xs font-semibold text-bone-50 transition-colors hover:bg-forest-700"
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link
              to="/"
              className="mt-8 inline-flex rounded-full bg-forest-500 px-6 py-3 text-sm font-semibold text-bone-50 hover:bg-forest-600"
            >
              Back to home
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <>
      <SEO title="Checkout" description="Complete your order" path="/checkout" />
      <Section variant="default" pad="md" className="bg-editorial">
        <Container>
          <div className="mb-10">
            <div className="eyebrow mb-3">Checkout</div>
            <h1 className="display-serif text-display-lg tracking-tightest">
              {t("checkout.title", { defaultValue: "Review and confirm" })}
            </h1>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <form onSubmit={placeOrder} className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border border-ink/10 bg-surface-raised p-6 md:p-8">
                <h2 className="display-serif text-2xl mb-6">Contact details</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Full name" required>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Email" required>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Phone (optional)" className="md:col-span-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Notes (optional)" className="md:col-span-2">
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={`${inputClass} resize-y`}
                    />
                  </Field>
                </div>
              </div>

              <div className="rounded-3xl border border-ink/10 bg-surface-raised p-6 md:p-8">
                <h2 className="display-serif text-2xl mb-2">Payment</h2>
                <p className="text-sm text-ink-muted mb-4">
                  We'll email you secure payment instructions once you confirm. Bank transfer,
                  KNET, or Stripe link — your choice.
                </p>
                <div className="rounded-xl bg-bone-100 px-4 py-3 text-xs text-ink-muted">
                  No card is charged on this page. Your order is held as <strong>pending</strong>{" "}
                  until payment is confirmed.
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                arrow
                className="w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Placing order…" : "Place order"}
              </Button>
              {status === "err" && (
                <p className="text-sm text-coral-600">{errorMsg || "Couldn't place order."}</p>
              )}
            </form>

            <aside className="lg:col-span-5 lg:sticky lg:top-32 self-start">
              <div className="rounded-3xl border border-ink/10 bg-surface-raised p-6 md:p-8">
                <h2 className="display-serif text-2xl mb-6">Your cart</h2>
                <ul className="divide-y divide-ink/10">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-4 py-4">
                      <div className="grid h-16 w-16 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-bone-100">
                        {item.image ? (
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="display-serif text-xl text-forest-700">
                            {item.title[lang][0]}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-semibold leading-snug">
                            {item.title[lang]}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            aria-label="Remove"
                            className="text-ink-muted hover:text-coral-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="inline-flex items-center rounded-full border border-ink/10">
                            <button
                              type="button"
                              onClick={() => updateQty(item.productId, item.qty - 1)}
                              className="grid h-7 w-7 place-items-center hover:text-coral-600"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-medium">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.productId, item.qty + 1)}
                              className="grid h-7 w-7 place-items-center hover:text-coral-600"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="text-sm font-semibold text-forest-700">
                            {formatPrice(item.price * item.qty, item.currency)}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 space-y-2 border-t border-ink/10 pt-4">
                  <Row label="Subtotal" value={formatPrice(subtotal, currency)} />
                  <Row label="Shipping" value="—" />
                  <Row
                    label="Total"
                    value={formatPrice(subtotal, currency)}
                    bold
                  />
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}

const inputClass =
  "w-full rounded-2xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20";

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-2 block text-sm font-medium">
        {label}
        {required && <span className="text-coral-600">*</span>}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? "font-semibold" : "text-ink-muted"}>{label}</span>
      <span className={bold ? "display-serif text-xl text-forest-700" : ""}>{value}</span>
    </div>
  );
}
