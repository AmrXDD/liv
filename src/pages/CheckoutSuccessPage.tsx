import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SEO } from "@/components/seo/SEO";
import { useCart } from "@/lib/cart";
import { getSupabase } from "@/lib/supabase";

interface DigitalRow {
  id: string;
  product_slug: string;
  download_url: string | null;
  download_expires_at: string | null;
}

export function CheckoutSuccessPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { clear } = useCart();

  const [downloads, setDownloads] = useState<DigitalRow[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "pending" | "err">("loading");
  const [titleBySlug, setTitleBySlug] = useState<Record<string, string>>({});

  useEffect(() => {
    // Stripe redirected the customer back; they paid. Webhook may not have
    // landed yet — poll briefly until digital_orders rows show up.
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
      const { data, error } = await sb
        .from("digital_orders")
        .select("id, product_slug, download_url, download_expires_at")
        .eq("stripe_session_id", sessionId);
      if (cancelled) return;
      if (error) {
        setStatus("err");
        return;
      }
      if (data && data.length > 0) {
        setDownloads(data);
        // Pull titles for each product slug
        const slugs = Array.from(new Set(data.map((d) => d.product_slug)));
        const { data: prods } = await sb
          .from("products")
          .select("slug, title_en, title_ar")
          .in("slug", slugs);
        const map: Record<string, string> = {};
        for (const p of prods ?? []) {
          map[p.slug] = (lang === "ar" ? p.title_ar : p.title_en) || p.slug;
        }
        if (!cancelled) {
          setTitleBySlug(map);
          setStatus("ready");
        }
        return;
      }
      if (attempts >= 8) {
        setStatus("pending");
        return;
      }
      setTimeout(tick, 1500);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [sessionId, clear, lang]);

  return (
    <>
      <SEO title="Order received" description="Thank you for your order" path="/checkout/success" />
      <Section variant="default" pad="md" className="bg-editorial">
        <Container>
          <div className="mx-auto max-w-xl py-20 text-center">
            <div className="text-eyebrow uppercase mb-4 text-forest-700">
              {t("checkout.successEyebrow", { defaultValue: "Payment received" })}
            </div>
            <h1 className="display-serif text-display-lg tracking-tightest">
              {t("checkout.successTitle", { defaultValue: "Thank you." })}
            </h1>
            <p className="mt-6 text-ink-muted">
              {t("checkout.successLede", {
                defaultValue:
                  "Your payment is confirmed and a receipt has been sent to your email.",
              })}
            </p>

            {status === "loading" && (
              <p className="mt-8 text-sm text-ink-muted">Preparing your downloads…</p>
            )}

            {status === "pending" && (
              <p className="mt-8 text-sm text-ink-muted">
                Your downloads will arrive by email shortly. Refresh this page in a moment if
                you'd like to download here.
              </p>
            )}

            {status === "err" && (
              <p className="mt-8 text-sm text-coral-600">
                We couldn't load your downloads here. Check your email — or contact us if it
                doesn't arrive in 10 minutes.
              </p>
            )}

            {status === "ready" && downloads.length > 0 && (
              <div className="mt-10 rounded-3xl border border-forest-500/30 bg-forest-50 p-6 text-start">
                <div className="text-eyebrow uppercase text-forest-700 mb-3">
                  Your digital products
                </div>
                <ul className="space-y-3">
                  {downloads.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium">
                        {titleBySlug[d.product_slug] ?? d.product_slug}
                      </span>
                      {d.download_url ? (
                        <a
                          href={d.download_url}
                          download
                          className="inline-flex items-center gap-1.5 rounded-full bg-forest-600 px-4 py-2 text-xs font-semibold text-bone-50 transition-colors hover:bg-forest-700"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </a>
                      ) : (
                        <span className="text-xs text-ink-muted">Sent by email</span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-ink-muted">
                  Links are valid for 7 days. We've also emailed you a copy.
                </p>
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
    </>
  );
}
