import { useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Credentials } from "@/components/home/Credentials";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { useProduct, useNutritionIssues } from "@/lib/queries";
import { getSupabase } from "@/lib/supabase";
import { cn, formatPrice } from "@/lib/utils";
import { labelForIssueSlug } from "@/data/nutritionIssues";

export function ApplyPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const { data: product, isLoading } = useProduct(slug);
  const { data: issueGroups = [] } = useNutritionIssues();
  const formRef = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [issues, setIssues] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  const toggleIssue = (id: string) => {
    setIssues((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
  // DIY products are not application-gated
  if (product.category === "diy") return <Navigate to={`/diy-plans/${product.slug}`} replace />;

  const productName = product.title[lang];
  const heroImage = product.heroImage ?? product.images?.[0];
  const galleryImages = product.images?.filter((src) => src !== heroImage).slice(0, 4) ?? [];

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    setStatus("loading");
    const sb = getSupabase();
    const selectedIssues = Array.from(issues);
    // Also pretty-print issues into the message body so they show up in the
    // admin email + the existing message column without a schema migration on
    // the email side. The structured array lives in nutrition_issues.
    const issuesEnglish = selectedIssues.map((s) =>
      labelForIssueSlug(issueGroups, s, "en"),
    );
    const issuesBlock =
      issuesEnglish.length > 0 ? `Nutrition issues: ${issuesEnglish.join(", ")}` : "";
    const payload = {
      name,
      email,
      phone,
      subject: `Apply: ${product.title.en}`,
      message: [
        `Program: ${product.title.en} (${product.slug})`,
        issuesBlock,
        message,
      ]
        .filter(Boolean)
        .join("\n\n"),
      locale: lang,
      nutrition_issues: selectedIssues,
    };
    try {
      if (sb) {
        const { error: fnErr } = await sb.functions.invoke("submit-contact", {
          body: payload,
        });
        if (fnErr) {
          const { error } = await sb.from("contacts").insert(payload);
          if (error) throw error;
        }
      }
      setStatus("ok");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setIssues(new Set());
    } catch (err) {
      console.error("[apply] submit failed:", err);
      setStatus("err");
    }
  };

  return (
    <>
      <SEO
        title={`${t("apply.title", { product: productName, defaultValue: `Apply for ${productName}` })} — ${product.tagline[lang]}`}
        description={product.description[lang]}
        path={`/apply/${product.slug}`}
      />

      {/* HERO — image left, summary + CTA right */}
      <Section variant="default" pad="md" className="bg-editorial">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-3xl bg-bone-100 shadow-elevation">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={productName}
                    className="aspect-[4/5] w-full object-contain"
                  />
                ) : (
                  <div className="grid aspect-[4/5] place-items-center display-serif text-8xl text-forest-700/30">
                    {productName[0]}
                  </div>
                )}
              </div>
              {galleryImages.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {galleryImages.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      loading="lazy"
                      className="aspect-square w-full rounded-xl bg-bone-100 object-contain"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-6 lg:sticky lg:top-32 self-start">
              <div className="eyebrow mb-4">
                {product.format} {product.duration?.[lang] && `· ${product.duration[lang]}`}
              </div>
              <Reveal as="h1" className="display-serif text-display-xl tracking-tightest text-balance">
                {productName}
              </Reveal>
              {product.badge && (
                <span className="mt-4 inline-flex rounded-full bg-coral-100 text-coral-700 px-3 py-1 text-eyebrow uppercase">
                  {product.badge[lang]}
                </span>
              )}
              <Reveal as="p" className="mt-6 text-xl text-ink-muted leading-relaxed">
                {product.tagline[lang]}
              </Reveal>

              <div className="mt-8 flex items-baseline gap-3">
                <span className="display-serif text-5xl text-forest-700">
                  {formatPrice(product.price, product.currency)}
                </span>
                {product.duration?.[lang] && (
                  <span className="text-sm text-ink-muted">/ {product.duration[lang]}</span>
                )}
              </div>

              <Button
                variant="primary"
                size="lg"
                arrow
                className="mt-8 w-full sm:w-auto"
                onClick={scrollToForm}
              >
                {t("apply.cta", {
                  product: productName,
                  defaultValue: `Apply for ${productName}`,
                })}
              </Button>

              <p className="mt-4 text-xs text-ink-muted">
                {t("coaching.discoveryNote", {
                  defaultValue: "Every program starts with a free 45-minute discovery call.",
                })}
              </p>

              {product.description[lang] && (
                <p className="mt-8 text-base leading-relaxed">{product.description[lang]}</p>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* WHAT'S INCLUDED + OUTCOMES */}
      {(product.inclusions.length > 0 || product.outcomes.length > 0) && (
        <Section variant="default" pad="md">
          <Container>
            <div className="grid gap-12 md:grid-cols-2 md:gap-16">
              {product.inclusions.length > 0 && (
                <div>
                  <div className="text-eyebrow uppercase mb-6 text-forest-700">
                    {t("common.includes", { defaultValue: "What's included" })}
                  </div>
                  <ul className="space-y-4">
                    {product.inclusions.map((o, i) => (
                      <li key={i} className="flex gap-3 text-base">
                        <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-forest-500" />
                        <span>{o[lang]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {product.outcomes.length > 0 && (
                <div>
                  <div className="text-eyebrow uppercase mb-6 text-coral-600">
                    {t("common.outcomes", { defaultValue: "Outcomes" })}
                  </div>
                  <ul className="space-y-4">
                    {product.outcomes.map((o, i) => (
                      <li key={i} className="flex gap-3 text-base">
                        <Check className="h-5 w-5 mt-0.5 flex-shrink-0 text-coral-500" />
                        <span>{o[lang]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {product.longDescription && (
              <div className="mt-16 max-w-3xl text-lg text-ink-muted leading-relaxed">
                {product.longDescription[lang]}
              </div>
            )}
          </Container>
        </Section>
      )}

      {/* APPLICATION FORM */}
      <Section variant="default" pad="md" className="bg-editorial">
        <Container>
          <div ref={formRef} className="mx-auto max-w-2xl scroll-mt-24">
            <div className="text-center">
              <div className="eyebrow mb-4">
                {t("apply.eyebrow", { defaultValue: "Application" })}
              </div>
              <h2 className="display-serif text-display-lg tracking-tightest text-balance">
                {t("apply.formTitle", {
                  product: productName,
                  defaultValue: `Apply for ${productName}`,
                })}
              </h2>
              <p className="mt-4 text-ink-muted">
                {t("apply.lede", {
                  defaultValue:
                    "Tell us a little about you and we'll be in touch within 1 business day to schedule a discovery call.",
                })}
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              className="mt-10 rounded-3xl border border-ink/10 bg-surface-raised p-6 md:p-10 shadow-elevation space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    {t("static.contact.form.name", { defaultValue: "Your name" })}
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    {t("static.contact.form.email", { defaultValue: "Email" })}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  {t("apply.phone", { defaultValue: "Phone" })}
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                />
              </div>
              <div className="rounded-2xl border border-ink/10 bg-surface-base p-5">
                <div className="text-eyebrow uppercase text-forest-700 mb-1">
                  {t("apply.issuesTitle", {
                    defaultValue: "Nutrition issues",
                  })}
                </div>
                <p className="text-xs text-ink-muted mb-5">
                  {t("apply.issuesHint", {
                    defaultValue: "Select any that apply — this helps us prep your discovery call.",
                  })}
                </p>
                <div className="space-y-6">
                  {issueGroups.map((group) => (
                    <div key={group.id}>
                      <div className="text-sm font-semibold mb-3">{group.label[lang]}</div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {group.items.map((item) => {
                          const checked = issues.has(item.slug);
                          return (
                            <label
                              key={item.id}
                              className={cn(
                                "flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                                checked
                                  ? "border-forest-500 bg-forest-500/5"
                                  : "border-ink/10 hover:border-ink/30"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleIssue(item.slug)}
                                className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-ink/30 accent-forest-500"
                              />
                              <span className="leading-snug">{item.label[lang]}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  {t("apply.notes", { defaultValue: "Anything else we should know?" })}
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-2xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                />
              </div>

              <Button variant="primary" size="lg" arrow type="submit" className="w-full">
                {status === "loading"
                  ? "…"
                  : t("apply.submit", {
                      product: productName,
                      defaultValue: `Apply for ${productName}`,
                    })}
              </Button>
              <p className="h-5 text-center text-xs text-ink-muted">
                {status === "ok" &&
                  t("apply.success", {
                    defaultValue: "Thanks — we'll be in touch within 1 business day.",
                  })}
                {status === "err" &&
                  t("apply.error", { defaultValue: "Couldn't submit. Try again?" })}
              </p>
            </form>
          </div>
        </Container>
      </Section>

      <Credentials />
      <TestimonialsSlider />
    </>
  );
}
