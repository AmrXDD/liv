import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import { useDirection } from "@/hooks/useDirection";

interface PillarItem {
  tag: string;
  title: string;
  summary: string;
  outcome: string;
  href: string;
}

export function ServicesPillars() {
  const { t } = useTranslation();
  const { isRtl } = useDirection();
  const ref = useScrollReveal({ selector: "[data-pillar]", stagger: 0.12, y: 60 });

  const items = (t("services.items", { returnObjects: true }) as PillarItem[]) || [];

  return (
    <Section variant="default" pad="lg" className="bg-editorial">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16" ref={ref as React.RefObject<HTMLDivElement>}>
          <div className="lg:col-span-4">
            <div className="eyebrow mb-6" data-reveal>
              {t("services.eyebrow")}
            </div>
            <h2
              data-reveal
              className="display-serif text-display-lg tracking-tightest text-balance"
            >
              {t("services.title")}
            </h2>
            <p data-reveal className="mt-6 max-w-md text-ink-muted leading-relaxed">
              {t("services.lede")}
            </p>
          </div>

          <div className="lg:col-span-8">
            <ul className="divide-y divide-ink/10 border-y border-ink/10">
              {items.map((it) => (
                <li key={it.tag} data-pillar>
                  <Link
                    to={it.href}
                    className={cn(
                      "group grid grid-cols-1 items-start gap-4 py-8 transition-colors md:grid-cols-12 md:gap-6 md:py-10",
                      "hover:bg-bone-100/60"
                    )}
                  >
                    <div className="text-eyebrow uppercase font-mono text-forest-500 md:col-span-2">
                      {it.tag}
                    </div>
                    <div className="md:col-span-7">
                      <div className="display-serif text-2xl md:text-4xl tracking-tight text-balance">
                        {it.title}
                      </div>
                      <p className="mt-3 max-w-md text-ink-muted md:mt-4">{it.summary}</p>
                      <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-forest-700 md:mt-4">
                        <span>{it.outcome}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end md:col-span-3">
                      <span
                        className={cn(
                          "grid h-14 w-14 place-items-center rounded-full border border-ink/15 transition-all duration-500",
                          "group-hover:bg-forest-500 group-hover:text-bone-50 group-hover:border-forest-500",
                          "group-hover:rotate-45"
                        )}
                      >
                        <ArrowUpRight
                          className={cn("h-5 w-5", isRtl && "flip-rtl")}
                          strokeWidth={1.75}
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
