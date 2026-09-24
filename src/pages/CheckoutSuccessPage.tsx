import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Download, PackageCheck, Truck, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SEO } from "@/components/seo/SEO";
import { useCart } from "@/lib/cart";
import { getSupabase } from "@/lib/supabase";
import type { Order } from "@/types";

interface DigitalRow {
  id: string;
  product_slug: string;
  download_url: string | null;
  download_expires_at: string | null;
}

export function CheckoutSuccessPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const isAr = lang === "ar";
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { clear } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [downloads, setDownloads] = useState<DigitalRow[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "pending" | "err">("loading");
  const [titleBySlug, setTitleBySlug] = useState<Record<string, string>>({});

  useEffect(() => {
    clear();
    if (!sessionId) {
      setStatus("err");
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      setStatus("err");
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const tick = async () => {
      attempts += 1;

      // Order + downloads for this exact session only. The orders and
      // digital_orders tables are not readable by the anon key; see
      // supabase/security_fix_orders_2026_09_23.sql.
      const { data, error } = await sb.rpc("get_order_confirmation", {
        p_session_id: sessionId,
      });

      if (cancelled) return;
      if (error) {
        setStatus("err");
        return;
      }

      const result = data as { order: Order | null; downloads: DigitalRow[] } | null;
      const orderData = result?.order ?? null;
      const digitalData = result?.downloads ?? [];

      if (orderData) {
        setOrder(orderData);
      }

      if (digitalData && digitalData.length > 0) {
        setDownloads(digitalData);
        const slugs = Array.from(new Set(digitalData.map((d) => d.product_slug)));
        const { data: prods } = await sb
          .from("products")
          .select("slug, title_en, title_ar")
          .in("slug", slugs);

        const map: Record<string, string> = {};
        for (const p of prods ?? []) {
          map[p.slug] = (isAr ? p.title_ar : p.title_en) || p.slug;
        }
        if (!cancelled) {
          setTitleBySlug(map);
          setStatus("ready");
        }
        return;
      }

      // If order is found and is confirmed (or paid)
      if (orderData) {
        if (!cancelled) {
          setStatus("ready");
        }
        return;
      }

      if (attempts >= 15) {
        setStatus("ready");
        return;
      }

      setTimeout(tick, 1500);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [sessionId, clear, isAr]);

  const hasPhysical =
    order?.has_physical ||
    order?.shipping_address != null ||
    order?.items?.some((i) => i.category === "physical" || i.is_physical);

  return (
    <>
      <SEO
        title={isAr ? "تم استلام طلبك" : "Order received"}
        description={isAr ? "شكراً لطلبك" : "Thank you for your order"}
        path="/checkout/success"
      />
      <Section variant="default" pad="md" className="bg-editorial">
        <Container>
          <div className="mx-auto max-w-2xl py-16 text-center">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-forest-100 text-forest-700">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="text-eyebrow uppercase mb-3 text-forest-700">
              {t("checkout.successEyebrow", {
                defaultValue: isAr ? "تم الدفع بنجاح" : "Payment received",
              })}
            </div>
            <h1 className="display-serif text-display-lg tracking-tightest">
              {t("checkout.successTitle", {
                defaultValue: isAr ? "شكراً لك." : "Thank you.",
              })}
            </h1>
            <p className="mt-4 text-ink-muted leading-relaxed">
              {t("checkout.successLede", {
                defaultValue: isAr
                  ? "تم تأكيد عملية الدفع بنجاح وإرسال إيصال وتفاصيل الطلب إلى بريدك الإلكتروني."
                  : "Your payment is confirmed and an order confirmation receipt has been sent to your email.",
              })}
            </p>

            {status === "loading" && (
              <p className="mt-8 text-sm text-ink-muted">
                {isAr ? "جاري تجهيز تفاصيل طلبك…" : "Preparing your order details…"}
              </p>
            )}

            {/* Physical Order Shipping Information */}
            {hasPhysical && order?.shipping_address && (
              <div className="mt-8 rounded-3xl border border-ink/10 bg-surface-raised p-6 text-start shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-coral-100 text-coral-700">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {isAr ? "طلب منتجات ملموسة" : "Physical shipment"}
                    </div>
                    <div className="text-xs text-ink-muted">
                      {isAr
                        ? "نحن نجهز طلبك للشحن وسنرسل رقم التتبع فور انطلاقه."
                        : "We are preparing your shipment and will send tracking updates to your email."}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-bone-100/60 p-4 text-xs text-ink space-y-1">
                  <div className="font-medium text-forest-800">
                    {isAr ? "عنوان التوصيل:" : "Delivering to:"}
                  </div>
                  <div>{order.name}</div>
                  <div>{order.shipping_address.line1}</div>
                  {order.shipping_address.line2 && <div>{order.shipping_address.line2}</div>}
                  <div>
                    {[
                      order.shipping_address.city,
                      order.shipping_address.state,
                      order.shipping_address.postal_code,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                  <div>{order.shipping_address.country}</div>
                </div>
              </div>
            )}

            {/* Digital Downloads Box */}
            {downloads.length > 0 && (
              <div className="relative z-10 mt-8 rounded-3xl border border-forest-500/30 bg-forest-50 p-6 text-start shadow-sm">
                <div className="flex items-center gap-2 text-eyebrow uppercase text-forest-700 mb-3">
                  <PackageCheck className="h-4 w-4" />
                  <span>{isAr ? "ملفاتك الرقمية للتحميل" : "Your digital downloads"}</span>
                </div>
                <ul className="space-y-4">
                  {downloads.map((d) => {
                    const url = (d.download_url ?? "").trim();
                    const isAbsolute = /^https?:\/\//i.test(url);
                    return (
                      <li key={d.id} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">
                            {titleBySlug[d.product_slug] ?? d.product_slug}
                          </span>
                          {isAbsolute ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const win = window.open(url, "_blank", "noopener,noreferrer");
                                if (!win) window.location.href = url;
                              }}
                              className="relative z-20 inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-forest-600 px-4 py-2 text-xs font-semibold text-bone-50 no-underline transition-colors hover:bg-forest-700"
                            >
                              <Download className="h-3.5 w-3.5" />
                              {isAr ? "تحميل الملف" : "Download"}
                            </a>
                          ) : (
                            <span className="text-xs text-ink-muted">
                              {isAr ? "أُرسل عبر البريد الإلكتروني" : "Sent by email"}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-4 text-xs text-ink-muted">
                  {isAr
                    ? "الروابط فعّالة لمدة 7 أيام. كما أرسلنا نسخة كاملة إلى بريدك الإلكتروني."
                    : "Links are valid for 7 days. We've also emailed you a copy."}
                </p>
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/"
                className="inline-flex rounded-full bg-forest-500 px-6 py-3 text-sm font-semibold text-bone-50 hover:bg-forest-600 transition-colors"
              >
                {isAr ? "العودة للرئيسية" : "Back to home"}
              </Link>
              <Link
                to="/shop"
                className="inline-flex rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink hover:bg-bone-100 transition-colors"
              >
                {isAr ? "تصفح المتجر" : "Browse Shop"}
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
