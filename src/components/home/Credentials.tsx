import { useTranslation } from "react-i18next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useAccreditations } from "@/lib/queries";

export function Credentials() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const ref = useScrollReveal({ selector: "[data-cred]", stagger: 0.1, y: 40 });
  const { data: items = [] } = useAccreditations();

  if (!items.length) return null;

  return (
    <Section variant="raised" pad="lg">
      <Container>
        <div ref={ref as React.RefObject<HTMLDivElement>} className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="eyebrow mb-6" data-cred>{t("credentials.eyebrow")}</div>
            <h2 data-cred className="display-serif text-display-lg tracking-tightest text-balance">
              {t("credentials.title")}
            </h2>
          </div>
          <div className="lg:col-span-7">
            <div className="grid gap-6 sm:grid-cols-2">
              {items.map((it, i) => {
                const name = isAr ? it.name_ar : it.name_en;
                const issuer = isAr ? it.issuer_ar : it.issuer_en;
                const card = (
                  <div
                    data-cred
                    className="group relative h-full rounded-2xl border border-ink/10 bg-surface-base p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-elevation"
                  >
                    <div className="font-mono text-eyebrow uppercase text-coral-500">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="mt-4 display-serif text-2xl">{name}</div>
                    {issuer && (
                      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{issuer}</p>
                    )}
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-forest-500/0 transition-all duration-500 group-hover:ring-forest-500/30 pointer-events-none" />
                  </div>
                );
                return it.link_url ? (
                  <a key={it.id} href={it.link_url} target="_blank" rel="noopener noreferrer" className="block">
                    {card}
                  </a>
                ) : (
                  <div key={it.id}>{card}</div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
