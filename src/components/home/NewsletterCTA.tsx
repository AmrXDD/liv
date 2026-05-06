import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getSupabase } from "@/lib/supabase";

export function NewsletterCTA() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const sb = getSupabase();
    try {
      if (sb) {
        const { error } = await sb.from("newsletter").insert({ email, locale: i18n.language });
        if (error) throw error;
      }
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("err");
    }
  };

  return (
    <Section variant="default" pad="lg">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-ink p-10 md:p-16 text-bone-50">
          <div className="absolute inset-0 bg-radial-forest opacity-50" />
          <div className="absolute -top-24 -end-24 h-72 w-72 rounded-full bg-coral-500/30 blur-3xl" />
          <div className="absolute -bottom-24 -start-24 h-80 w-80 rounded-full bg-forest-400/40 blur-3xl" />

          <div className="relative grid gap-12 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <div className="text-eyebrow uppercase opacity-70 mb-4">
                {t("newsletter.eyebrow")}
              </div>
              <h2 className="display-serif text-display-lg tracking-tightest text-balance">
                {t("newsletter.title")}
              </h2>
              <p className="mt-5 max-w-md text-bone-200/70">{t("newsletter.lede")}</p>
            </div>

            <form onSubmit={submit} className="md:col-span-5">
              <label className="text-eyebrow uppercase opacity-70 mb-3 block">
                {t("cta.joinNewsletter")}
              </label>
              <div className="flex items-stretch gap-2 rounded-full bg-bone-50/5 p-1 ring-1 ring-bone-50/15 focus-within:ring-bone-50/40 transition-shadow">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("newsletter.placeholder")}
                  className="flex-1 bg-transparent px-5 py-3 text-sm placeholder:text-bone-50/40 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="rounded-full bg-coral-500 px-6 py-2 text-sm font-semibold transition-colors hover:bg-coral-400 disabled:opacity-60"
                >
                  {status === "loading" ? "…" : t("newsletter.button")}
                </button>
              </div>
              <p className="mt-3 h-5 text-xs text-bone-200/60">
                {status === "ok" && t("newsletter.success")}
                {status === "err" && t("newsletter.error")}
              </p>
            </form>
          </div>
        </div>
      </Container>
    </Section>
  );
}
