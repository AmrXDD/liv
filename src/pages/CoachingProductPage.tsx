import { useState } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { useProduct } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

export function CoachingProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const { data: product, isLoading } = useProduct(slug);
  const [agreed, setAgreed] = useState(false);

  if (isLoading) {
    return (
      <Section variant="default" pad="md">
        <Container>
          <div className="text-sm text-ink-muted">Loading…</div>
        </Container>
      </Section>
    );
  }
  if (!product) return <Navigate to="/coaching" replace />;

  return (
    <>
      <SEO
        title={`${product.title[lang]} — ${product.tagline[lang]}`}
        description={product.description[lang]}
        path={`/coaching/${product.slug}`}
        type="product"
        keywords={product.seoKeywords}
      />

      <Section variant="default" pad="md" className="bg-editorial">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="eyebrow mb-6">{product.format} · {product.duration?.[lang]}</div>
              <Reveal as="h1" className="display-serif text-display-xl tracking-tightest text-balance">
                {product.title[lang]}
              </Reveal>
              <Reveal as="p" className="mt-6 max-w-2xl text-xl text-ink-muted">
                {product.tagline[lang]}
              </Reveal>
              <Reveal as="p" className="mt-6 max-w-2xl text-base">
                {product.description[lang]}
              </Reveal>
              {product.longDescription && (
                <Reveal as="p" className="mt-4 max-w-2xl text-base text-ink-muted">
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
                      className="aspect-[4/3] w-full rounded-2xl bg-bone-100 object-contain"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              <div className="mt-12 grid gap-8 md:grid-cols-2">
                <div>
                  <div className="text-eyebrow uppercase mb-4 text-coral-600">{t("common.outcomes")}</div>
                  <ul className="space-y-3">
                    {product.outcomes.map((o, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <Check className="h-5 w-5 flex-shrink-0 text-coral-500" />
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
                        <Check className="h-5 w-5 flex-shrink-0 text-forest-500" />
                        <span>{o[lang]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-5 lg:sticky lg:top-32 self-start">
              <div className="rounded-3xl border border-ink/10 bg-ink p-8 text-bone-50 shadow-elevation">
                <div className="absolute inset-0 bg-radial-forest opacity-30 rounded-3xl pointer-events-none" />
                <div className="relative">
                  <div className="text-eyebrow uppercase opacity-70">{t("common.investment")}</div>
                  <div className="mt-2 display-serif text-5xl tracking-tightest">
                    {formatPrice(product.price, product.currency)}
                  </div>
                  <div className="mt-1 text-sm opacity-70">{product.duration?.[lang]}</div>

                  <Button
                    variant="secondary"
                    arrow
                    size="lg"
                    className="mt-8 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!agreed}
                    onClick={() => {
                      if (!agreed) return;
                      navigate(`/apply/${product.slug}`);
                    }}
                  >
                    {t("apply.cta", {
                      product: product.title[lang],
                      defaultValue: `Apply for ${product.title[lang]}`,
                    })}
                  </Button>

                  <label className="mt-4 flex items-start gap-3 text-xs leading-relaxed text-bone-200/90">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.currentTarget.checked)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-bone-50/30 bg-transparent accent-coral-500"
                    />
                    <span>
                      {t("coaching.agreePrefix", {
                        defaultValue: "I agree to the",
                      })}{" "}
                      <Link
                        to="/coaching-agreement"
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-2 hover:text-bone-50"
                      >
                        {t("coaching.agreementLink", {
                          defaultValue: "coaching terms",
                        })}
                      </Link>
                      .
                    </span>
                  </label>

                  <p className="mt-3 text-xs opacity-70">
                    {t("coaching.discoveryNote", {
                      defaultValue:
                        "Every program starts with a free 45-minute discovery call.",
                    })}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
