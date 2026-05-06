import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Instagram, Linkedin, MessageCircle, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";

export function Footer() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  const explore = [
    { to: "/diy-plans", label: t("nav.diy") },
    { to: "/coaching", label: t("nav.coaching") },
    { to: "/consultations", label: t("nav.consultations") },
    { to: "/blog", label: t("nav.blog") },
    { to: "/recommended", label: t("nav.recommended") },
  ];

  const company = [
    { to: "/my-story", label: t("nav.myStory") },
    { to: "/why-us", label: t("nav.whyUs") },
    { to: "/how-it-works", label: t("nav.howItWorks") },
    { to: "/b2b", label: t("nav.b2b") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const support = [
    { to: "/faq", label: t("nav.faq") },
    { to: "/privacy", label: "Privacy" },
    { to: "/terms", label: "Terms" },
  ];

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
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

            <a
              href="https://chat.whatsapp.com/livfunctional"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-bone-50/15 px-5 py-3 text-sm font-medium hover:border-bone-50/40 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              {t("footer.whatsapp")}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterColumn title={t("footer.explore")} items={explore} />
            <FooterColumn title={t("footer.company")} items={company} />
            <FooterColumn title={t("footer.support")} items={support} />
          </div>
        </div>

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
            <SocialIcon href="https://instagram.com/livfunctional" label="Instagram">
              <Instagram className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href="https://linkedin.com/company/liv-functional" label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href="https://tiktok.com/@livfunctional" label="TikTok">
              <TikTokGlyph />
            </SocialIcon>
            <SocialIcon href="https://www.threads.net/@livfunctional" label="Threads">
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
