import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Instagram, Linkedin, Facebook, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";
import { useAccreditations } from "@/lib/queries";

export function Footer() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const isAr = i18n.language?.startsWith("ar");
  const { data: accreditations = [] } = useAccreditations();

  const explore = [
    { to: "/diy-plans", label: t("nav.diy") },
    { to: "/coaching", label: t("nav.coaching") },
    { to: "/consultations", label: t("nav.consultations") },
    { to: "/blog", label: t("nav.blog") },
    { to: "/recommended", label: t("nav.affiliate") },
  ];

  const company = [
    { to: "/about", label: t("nav.about") },
    { to: "/my-story", label: t("nav.myStory") },
    { to: "/why-us", label: t("nav.whyUs") },
    { to: "/b2b", label: t("nav.groupWorkshops") },
  ];

  const support = [
    { to: "/how-it-works", label: t("nav.howItWorks") },
    { to: "/contact", label: t("nav.contact") },
    { to: "/faq", label: t("nav.faq") },
    { to: "/privacy", label: t("nav.privacy", { defaultValue: "Privacy" }) },
    { to: "/terms", label: t("nav.terms", { defaultValue: "Terms" }) },
  ];

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const sb = getSupabase();
    try {
      if (sb) {
        const { error } = await sb
          .from("newsletter")
          .upsert(
            {
              email: email.trim().toLowerCase(),
              locale: i18n.language?.startsWith("ar") ? "ar" : "en",
              source: "footer",
            },
            { onConflict: "email", ignoreDuplicates: true }
          );
        if (error) throw error;
      }
      setStatus("ok");
      setEmail("");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Newsletter signup failed", err);
      setStatus("err");
    }
  };

  return (
    <footer className="relative bg-ink text-bone-50">
      <div className="absolute inset-0 bg-radial-forest opacity-50 pointer-events-none" />
      <Container className="relative py-20 md:py-28">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="display-serif text-display-lg leading-[1.02] tracking-tightest">
              {t("footer.tagline")}
            </div>
            <p className="mt-6 max-w-md text-bone-200/70">
              {t("footer.made")}
            </p>

            <form onSubmit={subscribe} className="mt-10">
              <label className="text-eyebrow uppercase opacity-70 mb-3 block">
                {t("footer.newsletter")}
              </label>
              <div className="flex items-stretch gap-2 rounded-full bg-bone-50/5 p-1 ring-1 ring-bone-50/10 focus-within:ring-bone-50/30 transition-shadow">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("newsletter.placeholder")}
                  className="flex-1 bg-transparent px-5 py-3 text-sm text-bone-50 placeholder:text-bone-50/40 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="rounded-full bg-coral-500 px-5 py-2 text-sm font-semibold transition-colors hover:bg-coral-400 disabled:opacity-60"
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

          <div className="md:col-span-7 grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterColumn title={t("footer.explore")} items={explore} />
            <FooterColumn title={t("footer.company")} items={company} />
            <FooterColumn title={t("footer.support")} items={support} />
          </div>
        </div>

        {accreditations.length > 0 && (
          <div className="mt-16 border-t border-bone-50/10 pt-10">
            <div className="text-eyebrow uppercase opacity-70 mb-5">
              {t("credentials.eyebrow", { defaultValue: "Accreditations" })}
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {accreditations.map((a) => (
                <li
                  key={a.id}
                  className="rounded-2xl border border-bone-50/10 bg-bone-50/[0.03] px-4 py-3 text-sm text-bone-200/90"
                >
                  <div className="font-medium text-bone-50">
                    {isAr ? a.name_ar : a.name_en}
                  </div>
                  {(isAr ? a.issuer_ar : a.issuer_en) && (
                    <div className="mt-0.5 text-xs text-bone-200/60">
                      {isAr ? a.issuer_ar : a.issuer_en}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-bone-50/10 pt-8 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral-500 text-bone-50 font-bold text-sm">
              L
            </span>
            <span className="text-sm text-bone-200/70">
              © {new Date().getFullYear()} Liv Functional · {t("footer.rights")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <SocialIcon href="https://www.instagram.com/livfunctional/" label="Instagram">
              <Instagram className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href="https://www.facebook.com/livfunctional/" label="Facebook">
              <Facebook className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href="https://x.com/livfunctional" label="X">
              <XGlyph />
            </SocialIcon>
            <SocialIcon href="https://www.linkedin.com/company/livfunctional/" label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href="https://www.tiktok.com/@livfunctional" label="TikTok">
              <TikTokGlyph />
            </SocialIcon>
            <SocialIcon href="https://www.threads.com/@livfunctional" label="Threads">
              <ThreadsGlyph />
            </SocialIcon>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { to: string; label: string }[];
}) {
  return (
    <div>
      <div className="text-eyebrow uppercase opacity-70 mb-5">{title}</div>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.to}>
            <Link
              to={it.to}
              className="group inline-flex items-center gap-1 text-sm text-bone-200/90 hover:text-bone-50"
            >
              {it.label}
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-bone-50/15 transition-colors hover:border-bone-50/50 hover:bg-bone-50/5"
    >
      {children}
    </a>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M18.244 2H21l-6.52 7.45L22 22h-6.797l-4.74-6.205L4.96 22H2.2l6.973-7.97L2 2h6.94l4.28 5.66L18.244 2zm-1.19 18h1.83L7.04 4H5.1l11.954 16z" />
    </svg>
  );
}

function TikTokGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M16.5 3v3.2a5.3 5.3 0 0 0 4.5 2.2v3.1a8.4 8.4 0 0 1-4.5-1.4v6.5a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.2a3 3 0 1 0 2 2.7V3h3z" />
    </svg>
  );
}

function ThreadsGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3a8 8 0 0 0-8 8c0 5.3 3.6 9 9 9 4 0 7-2.4 7-5.6 0-2.6-2-4.2-5-4.4-2.5-.2-4 .8-4.5 1.7M12 7c2.5 0 4 1.5 4.5 3" />
    </svg>
  );
}
