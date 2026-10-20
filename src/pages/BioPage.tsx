import { useTranslation } from "react-i18next";
import { ArrowUpRight, Facebook, Instagram, Linkedin } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThreadsGlyph, TikTokGlyph, XGlyph } from "@/components/layout/Footer";
import { Link } from "@/lib/langRouting";
import { BIO_PATH, IR_QUIZ_PATH, LIV_AT_WORK_PATH, SELF_GUIDED_PATH } from "@/lib/routes";
import { cn } from "@/lib/utils";

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://www.livfunctional.com").replace(/\/$/, "");

const copy = {
  name: { en: "Liv Functional", ar: "ليف فنكشنال" },
  tagline: {
    en: "Functional nutrition for women with insulin resistance",
    ar: "تغذية وظيفية لمقاومة الإنسولين",
  },
  seoTitle: { en: "Liv Functional · Links", ar: "ليف فنكشنال · الروابط" },
  seoDesc: {
    en: "Take the free insulin resistance quiz, read Reham's book, start a ready-made plan or work with Reham 1:1.",
    ar: "إختبار مقاومة الأنسولين مجانا، وكتاب مقاومة الأنسولين، وخطط جاهزة، وتدريب شخصي.",
  },
} as const;

const links: {
  href: string;
  external: boolean;
  primary?: boolean;
  label: { en: string; ar: string };
}[] = [
  {
    href: IR_QUIZ_PATH,
    external: false,
    primary: true,
    label: { en: "Free insulin resistance quiz", ar: "إختبار مقاومة الأنسولين مجانا" },
  },
  {
    href: "/shop/كتاب-علاج-مقاومة-الانسولين-بالعربي",
    external: false,
    label: { en: "Insulin resistance book (Arabic)", ar: "كتاب مقاومة الأنسولين (عربي)" },
  },
  {
    href: "https://www.amazon.com/Reham-Alsharif/e/B0H2SCWWNJ",
    external: true,
    label: { en: "All my books on Amazon", ar: "جميع كتبي على أمازون" },
  },
  {
    href: SELF_GUIDED_PATH,
    external: false,
    label: { en: "Ready-made insulin resistance plans", ar: "خطط مقاومة الأنسولين الجاهزه" },
  },
  {
    href: "/coaching",
    external: false,
    label: { en: "1:1 coaching", ar: "التدريب الشخصي" },
  },
  {
    href: LIV_AT_WORK_PATH,
    external: false,
    label: { en: "Work with us: companies", ar: "التعاون مع الشركات" },
  },
];

const socials = [
  { href: "https://www.instagram.com/livfunctional/", label: "Instagram", icon: <Instagram className="h-5 w-5" /> },
  { href: "https://www.tiktok.com/@livfunctional", label: "TikTok", icon: <TikTokGlyph /> },
  { href: "https://www.facebook.com/liv.lowcarb/", label: "Facebook", icon: <Facebook className="h-5 w-5" /> },
  { href: "https://x.com/livfunctional", label: "X", icon: <XGlyph /> },
  { href: "https://www.linkedin.com/company/livfunctional/", label: "LinkedIn", icon: <Linkedin className="h-5 w-5" /> },
  { href: "https://www.threads.com/@livfunctional", label: "Threads", icon: <ThreadsGlyph /> },
];

const linkClass = (primary?: boolean) =>
  cn(
    "group flex min-h-[56px] w-full items-center justify-between gap-3 rounded-full px-6 py-4",
    "text-base font-semibold transition-colors",
    primary
      ? "bg-forest-500 text-bone-50 hover:bg-forest-600"
      : "border border-ink/15 bg-white text-ink hover:border-ink/40"
  );

/** Standalone link-in-bio page: no site header/footer, one focused column. */
export function BioPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";

  return (
    <div className="min-h-screen bg-bone-50 text-ink">
      <SEO
        title={copy.seoTitle[lang]}
        description={copy.seoDesc[lang]}
        path={BIO_PATH}
        image={`${SITE_URL}/og/bio.jpg`}
      />
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-5">
        <div className="flex justify-end">
          <LanguageSwitcher compact />
        </div>

        <header className="mt-4 text-center">
          <img
            src="/bio-avatar.webp"
            alt="Reham Alsharif"
            width={480}
            height={480}
            className="mx-auto h-28 w-28 rounded-full ring-4 ring-white shadow-md"
          />
          <h1 className="mt-5 text-2xl font-bold tracking-tight">{copy.name[lang]}</h1>
          <p className="mx-auto mt-2 max-w-xs text-balance text-sm leading-relaxed text-ink-muted">
            {copy.tagline[lang]}
          </p>
        </header>

        <nav className="mt-8 flex flex-col gap-3" aria-label="Links">
          {links.map((l) =>
            l.external ? (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={linkClass(l.primary)}>
                <span>{l.label[lang]}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 opacity-70 rtl:-scale-x-100" aria-hidden />
              </a>
            ) : (
              <Link key={l.href} to={l.href} className={linkClass(l.primary)}>
                <span>{l.label[lang]}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 opacity-70 rtl:-scale-x-100" aria-hidden />
              </Link>
            )
          )}
        </nav>

        <footer className="mt-auto pt-10">
          <ul className="flex flex-wrap items-center justify-center gap-3">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-ink/40"
                >
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </div>
  );
}
