import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { CollectionHero } from "@/components/product/CollectionHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";

interface Item {
  category: string;
  name: string;
  why: string;
  url: string;
  affiliate?: boolean;
}

const items: Item[] = [
  { category: "Movement", name: "AG1", why: "The one greens powder we trust for travel days when produce isn't an option.", url: "https://drinkag1.com", affiliate: true },
  { category: "Sleep", name: "Oura Ring", why: "Sleep tracking that respects your data and surfaces meaningful patterns.", url: "https://ouraring.com", affiliate: true },
  { category: "Light", name: "Bon Charge SAD lamp", why: "Cheap, portable, evidence-based light therapy for grey-month motivation.", url: "https://boncharge.com" },
  { category: "Kitchen", name: "All-Clad D3 frying pan", why: "Buy once. The skillet most of our recipes assume you have.", url: "https://all-clad.com", affiliate: true },
  { category: "Recovery", name: "BlackRoll smartball", why: "The one mobility tool that earned a permanent spot in our routine.", url: "https://blackroll.com" },
  { category: "Reading", name: "Why We Sleep — Matthew Walker", why: "If you read one sleep book, this is the one. Every program graduate gets it.", url: "https://amazon.com" },
];

export function RecommendedProductsPage() {
  const { t } = useTranslation();
  const { isRtl } = useDirection();
  const ref = useScrollReveal({ selector: "[data-rec]", stagger: 0.06, y: 30 });

  return (
    <>
      <SEO
        title={t("static.recommended.title")}
        description={t("static.recommended.lede")}
        path="/recommended"
      />
      <CollectionHero
        eyebrow={t("nav.recommended")}
        title={t("static.recommended.title")}
        lede={t("static.recommended.lede")}
      />
      <Section variant="default" pad="md">
        <Container>
          <ul ref={ref as React.RefObject<HTMLUListElement>} className="divide-y divide-ink/10 border-y border-ink/10">
            {items.map((it) => (
              <li key={it.name} data-rec>
                <a
                  href={it.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group grid grid-cols-12 items-start gap-6 py-8 transition-colors hover:bg-bone-100/60"
                >
                  <div className="col-span-2 text-eyebrow uppercase font-mono text-forest-500">
                    {it.category}
                  </div>
                  <div className="col-span-9 md:col-span-7">
                    <div className="display-serif text-2xl tracking-tight">
                      {it.name}
                      {it.affiliate && (
                        <span className="ms-2 align-middle text-eyebrow uppercase text-coral-500">
                          affiliate
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-xl">{it.why}</p>
                  </div>
                  <div className="col-span-1 md:col-span-3 flex items-center justify-end">
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-ink/15 transition-all duration-500 group-hover:bg-ink group-hover:text-bone-50 group-hover:border-ink group-hover:rotate-45">
                      <ArrowUpRight className={cn("h-4 w-4", isRtl && "flip-rtl")} />
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
