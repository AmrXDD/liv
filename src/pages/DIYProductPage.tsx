import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { useProduct } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { productSchema, buildCanonical } from "@/lib/seo";
import { getSupabase } from "@/lib/supabase";
import { Reveal } from "@/components/ui/Reveal";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export function DIYProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const { data: product, isLoading } = useProduct(slug);

  if (isLoading) {
    return (
      <Section variant="default" pad="md">
        <Container>
          <div className="text-sm text-ink-muted">Loading…</div>
        </Container>
      </Section>
    );
  }
  if (!product) return <Navigate to="/diy-plans" replace />;

  const requestDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const sb = getSupabase();
    try {
      if (sb) {
        const { error } = await sb.from("digital_orders").insert({
          email,
          product_slug: product.slug,
          locale: i18n.language,
        });
        if (error) throw error;
      }
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("err");
    }
  };

  return (
    <>
      <SEO
        title={`${product.title[lang]} — ${product.tagline[lang]}`}
        description={product.description[lang]}
        path={`/diy-plans/${product.slug}`}
        type="product"
        schema={productSchema({
          name: product.title.en,
          description: product.description.en,
          price: product.price,
          currency: product.currency,
          url: buildCanonical(`/diy-plans/${product.slug}`),
        })}
      />

      <Section variant="default" pad="md" className="bg-editorial">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="eyebrow mb-6">{product.format} · {product.duration?.[lang]}</div>
              <Reveal as="h1" className="display-serif text-display-xl tracking-tightest text-balance">
                {product.title[lang]}
              </Reveal>
              <Reveal as="p" className="mt-6 max-w-2xl text-xl text-ink-muted leading-relaxed">
                {product.tagline[lang]}
              </Reveal>
              <Reveal as="p" className="mt-6 max-w-2xl text-base text-ink leading-relaxed">
                {product.description[lang]}
              </Reveal>
              {product.longDescription && (
                <Reveal as="p" className="mt-4 max-w-2xl text-base text-ink-muted leading-relaxed">
                  {product.longDescription[lang]}
                </Reveal>
              )}

              {product.images && product.images.length > 0 && (
                <div className="mt-10 grid grid-cols-2 gap-3">
                  {product.images.slice(0, 4).map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="aspect-[4/3] w-full rounded-2xl object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              <div className="mt-10 grid gap-8 md:grid-cols-2">
                <div>
                  <div className="text-eyebrow uppercase mb-4 text-forest-700">{t("common.outcomes")}</div>
                  <ul className="space-y-3">
                    {product.outcomes.map((o, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <Check className="h-5 w-5 flex-shrink-0 text-coral-500" strokeWidth={2.5} />
                        <span>{o[lang]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-eyebrow uppercase mb-4 text-forest-700">{t("common.includes")}</div>
                  <ul className="space-y-3">
                    {product.inclusions.map((o, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <Check className="h-5 w-5 flex-shrink-0 text-forest-500" strokeWidth={2.5} />
                        <span>{o[lang]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-5 lg:sticky lg:top-32 self-start">
              <div className="rounded-3xl border border-ink/10 bg-surface-raised p-8 shadow-elevation">
                <div className="text-eyebrow uppercase text-ink-muted">{t("common.investment")}</div>
                <div className="mt-2 flex items-baseline gap-3">
                  <div className="display-serif text-5xl text-forest-700 tracking-tightest">
                    {formatPrice(product.price, product.currency)}
                  </div>
                  <span className="text-sm text-ink-muted">{t("common.from")}</span>
                </div>

                <div className="mt-6">
                  <AddToCartButton product={product} />
                </div>

                <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-ink-muted">
                  <span className="h-px flex-1 bg-ink/10" />
                  or get the file by email
                  <span className="h-px flex-1 bg-ink/10" />
                </div>

                <form onSubmit={requestDownload} className="mt-2">
                  <label className="text-sm font-medium block mb-2">
                    {t("static.contact.form.email")}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("newsletter.placeholder")}
                    className="w-full rounded-2xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                  />
                  <Button
                    variant="primary"
                    size="lg"
                    arrow
                    className="mt-4 w-full"
                    type="submit"
                  >
                    {status === "loading" ? "…" : t("cta.downloadNow")}
                  </Button>
                  <p className="mt-3 h-5 text-xs text-ink-muted">
                    {status === "ok" && "Check your inbox for the download link."}
                    {status === "err" && "Couldn't process. Try again?"}
                  </p>
                </form>

                <div className="mt-6 flex flex-wrap gap-2 text-xs text-ink-muted">
                  <span className="rounded-full bg-bone-100 px-3 py-1">Instant access</span>
                  <span className="rounded-full bg-bone-100 px-3 py-1">Bilingual EN/AR</span>
                  <span className="rounded-full bg-bone-100 px-3 py-1">Lifetime updates</span>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
