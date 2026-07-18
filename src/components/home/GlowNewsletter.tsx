import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { BorderGlow } from "@/components/ui/BorderGlow";
import { getSupabase } from "@/lib/supabase";

/**
 * Newsletter capture wrapped in an intense, animated BorderGlow — a dark
 * spotlight band that shows the effect off against the site's light editorial
 * sections. Colors: forest / coral / gold on ink.
 */
export function GlowNewsletter() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const sb = getSupabase();
    const payload = { email, locale: i18n.language, source: "home-glow" };
    try {
      if (sb) {
        const { error: fnErr } = await sb.functions.invoke("subscribe-newsletter", { body: payload });
        if (fnErr) {
          const { error } = await sb.from("newsletter").insert(payload);
          if (error) throw error;
        }
      }
      setStatus("ok");
      setEmail("");
    } catch (err) {
      console.error("[newsletter] subscribe failed:", err);
      setStatus("err");
    }
  };

  return (
    <Section variant="default" pad="lg">
      <Container>
        <BorderGlow
          animated
          glowIntensity={1.25}
          glowColor="0 108 69"
          colors={["#006c45", "#ff5757", "#a89160"]}
          backgroundColor="#0a1612"
          borderRadius={32}
          borderWidth={2}
          className="mx-auto max-w-5xl overflow-hidden"
        >
          <div className="relative px-8 py-12 text-bone-50 md:px-16 md:py-16">
            <div className="pointer-events-none absolute inset-0 bg-radial-forest opacity-40" />
            <div className="relative grid gap-10 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <div className="text-eyebrow uppercase text-forest-200/80 mb-4">
                  {t("newsletter.eyebrow")}
                </div>
                <h2 className="display-serif text-display-lg tracking-tightest text-balance">
                  {t("newsletter.title")}
                </h2>
                <p className="mt-5 max-w-md text-bone-200/70">{t("newsletter.lede")}</p>
              </div>

              <form onSubmit={submit} className="md:col-span-5">
                <label className="text-eyebrow uppercase text-bone-50/70 mb-3 block">
                  {t("cta.joinNewsletter")}
                </label>
                <div className="flex items-stretch gap-2 rounded-full bg-bone-50/5 p-1 ring-1 ring-bone-50/15 transition-shadow focus-within:ring-bone-50/40">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("newsletter.placeholder")}
                    className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm placeholder:text-bone-50/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="shrink-0 rounded-full bg-coral-500 px-6 py-2 text-sm font-semibold text-bone-50 transition-colors hover:bg-coral-400 disabled:opacity-60"
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
        </BorderGlow>
      </Container>
    </Section>
  );
}

export default GlowNewsletter;
