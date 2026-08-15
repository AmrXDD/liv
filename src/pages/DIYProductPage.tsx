import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, BadgeCheck } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { useProduct } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { productSchema, buildCanonical } from "@/lib/seo";
import { useCart } from "@/lib/cart";

/**
 * Product detail page for digital (DIY plans / books) and physical (shop)
 * products. Single "Buy now" flow → checkout; digital delivery is handled
 * post-purchase by the checkout/webhook + email templates.
 */
export function DIYProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const { data: product, isLoading } = useProduct(slug);
  const { addItem } = useCart();
  const navigate = useNavigate();

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

  const isPhysical = product.category === "physical" || product.format === "Physical";
  const basePath = isPhysical ? "/shop" : "/diy-plans";
  const cover = product.heroImage ?? product.images?.[0];
  const gallery = (product.images ?? []).filter((src) => src !== cover).slice(0, 4);
  const hasOutcomes = (product.outcomes?.length ?? 0) > 0;
  const hasInclusions = (product.inclusions?.length ?? 0) > 0;
  const soldOut = isPhysical && product.stock != null && product.stock <= 0;
  const lowStock = isPhysical && product.stock != null && product.stock > 0 && product.stock <= 5;

  const buyNow = () => {
    if (soldOut) return;
    addItem(product, 1);
    navigate("/checkout");
  };

  return (
    <>
      <SEO
        title={`${product.title[lang]} — ${product.tagline[lang]}`}
        description={product.description[lang]}
        path={`${basePath}/${product.slug}`}
        type="product"
        keywords={product.seoKeywords}
        schema={productSchema({
          name: product.title.en,
          description: product.description.en,
          image: cover,
          price: product.price,
          currency: product.currency,
          url: buildCanonical(`${basePath}/${product.slug}`),
        })}
      />

      <Section variant="default" pad="md" className="bg-editorial">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="eyebrow mb-6">
                {product.format}
                {product.duration?.[lang] ? ` · ${product.duration[lang]}` : ""}
              </div>
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

              {gallery.length > 0 && (
                <div className="mt-10 grid grid-cols-2 gap-3">
                  {gallery.map((src) => (
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

              {(hasOutcomes || hasInclusions) && (
                <div className="mt-10 grid gap-8 md:grid-cols-2">
                  {hasOutcomes && (
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
                  )}
                  {hasInclusions && (
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
                  )}
                </div>
              )}
            </div>

            <aside className="lg:col-span-5 lg:sticky lg:top-32 self-start">
              {cover && (
                <div className="mb-6 overflow-hidden rounded-3xl bg-bone-100 shadow-elevation">
                  <img
                    src={cover}
                    alt={product.title[lang]}
                    className="mx-auto max-h-[440px] w-full object-contain"
                  />
                </div>
              )}

              <div className="rounded-3xl border border-ink/10 bg-surface-raised p-8 shadow-elevation">
                <div className="text-eyebrow uppercase text-ink-muted">{t("common.investment")}</div>
                <div className="mt-2 display-serif text-5xl text-forest-700 tracking-tightest">
                  {formatPrice(product.price, product.currency)}
                </div>

                {lowStock && (
                  <div className="mt-3 text-sm font-medium text-coral-600">
                    {lang === "ar"
                      ? `متبقي ${product.stock} فقط في المخزون`
                      : `Only ${product.stock} left in stock`}
                  </div>
                )}
                {soldOut && (
                  <div className="mt-3 text-sm font-medium text-coral-600">
                    {lang === "ar" ? "نفدت الكمية حالياً" : "Currently out of stock"}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    arrow={!soldOut}
                    className="w-full"
                    onClick={buyNow}
                    disabled={soldOut}
                  >
                    {soldOut
                      ? (lang === "ar" ? "نفدت الكمية" : "Sold out")
                      : (lang === "ar" ? "شراء الآن" : "Buy now")}
                  </Button>
                  {!soldOut && (
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full"
                      onClick={() => addItem(product, 1)}
                    >
                      {lang === "ar" ? "إضافة إلى السلة" : "Add to cart"}
                    </Button>
                  )}
                </div>

                {/* Trust snippet, right next to the buy box */}
                <div className="mt-5 flex items-start gap-2.5 text-xs leading-relaxed text-ink-muted">
                  <BadgeCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-forest-600" strokeWidth={2} />
                  <span>{t("product.trust")}</span>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 text-xs text-ink-muted">
                  {isPhysical ? (
                    <>
                      <span className="rounded-full bg-bone-100 px-3 py-1">Ships worldwide</span>
                      <span className="rounded-full bg-bone-100 px-3 py-1">Secure checkout</span>
                    </>
                  ) : (
                    <>
                      <span className="rounded-full bg-bone-100 px-3 py-1">Instant access</span>
                      <span className="rounded-full bg-bone-100 px-3 py-1">Bilingual EN/AR</span>
                      <span className="rounded-full bg-bone-100 px-3 py-1">Lifetime updates</span>
                    </>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <TestimonialsSlider />
    </>
  );
}
