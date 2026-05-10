import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useProduct } from "@/lib/queries";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

export function ApplyPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const { data: product, isLoading } = useProduct(slug);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setStatus("loading");
    const sb = getSupabase();
    try {
      if (sb) {
        const { error } = await sb.from("contacts").insert({
          name,
          email,
          subject: `Apply: ${product.title.en}`,
          message: [
            phone ? `Phone: ${phone}` : null,
            `Program: ${product.title.en} (${product.slug})`,
            message,
          ]
            .filter(Boolean)
            .join("\n\n"),
          locale: lang,
        });
        if (error) throw error;
      }
      setStatus("ok");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
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

      <Section variant="default" pad="md" className="bg-editorial">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="eyebrow mb-6">
                {t("apply.eyebrow", { defaultValue: "Application" })}
              </div>
              <Reveal as="h1" className="display-serif text-display-xl tracking-tightest text-balance">
                {t("apply.title", { product: productName, defaultValue: `Apply for ${productName}` })}
              </Reveal>
              <Reveal as="p" className="mt-6 max-w-2xl text-xl text-ink-muted leading-relaxed">
                {product.tagline[lang]}
              </Reveal>
              <Reveal as="p" className="mt-6 max-w-2xl text-base">
                {t("apply.lede", {
                  defaultValue:
                    "Tell us a little about you and we'll be in touch within 1 business day to schedule a discovery call.",
                })}
              </Reveal>

              <div className="mt-10 inline-flex items-baseline gap-3 rounded-2xl bg-surface-raised border border-ink/10 px-5 py-3">
                <span className="text-eyebrow uppercase text-ink-muted">
                  {t("common.investment")}
                </span>
                <span className="display-serif text-2xl text-forest-700">
                  {formatPrice(product.price, product.currency)}
                </span>
                {product.duration?.[lang] && (
                  <span className="text-sm text-ink-muted">· {product.duration[lang]}</span>
                )}
              </div>
            </div>

            <aside className="lg:col-span-5">
              <form
                onSubmit={onSubmit}
                className="rounded-3xl border border-ink/10 bg-surface-raised p-8 shadow-elevation space-y-4"
              >
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
                <div>
                  <label className="text-sm font-medium block mb-2">
                    {t("apply.phone", { defaultValue: "Phone (optional)" })}
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    {t("apply.notes", { defaultValue: "Anything we should know?" })}
                  </label>
                  <textarea
                    rows={4}
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
                <p className="h-5 text-xs text-ink-muted">
                  {status === "ok" &&
                    t("apply.success", {
                      defaultValue: "Thanks — we'll be in touch within 1 business day.",
                    })}
                  {status === "err" &&
                    t("apply.error", { defaultValue: "Couldn't submit. Try again?" })}
                </p>
              </form>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
