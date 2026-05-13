import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useProducts, useProductsByIds } from "@/lib/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import type { Block, Locale } from "@/types";

function useLang(): Locale {
  const { i18n } = useTranslation();
  return i18n.language?.startsWith("ar") ? "ar" : "en";
}

export function BlockRenderer({ block }: { block: Block }) {
  const lang = useLang();

  switch (block.type) {
    case "heading": {
      const sizes = {
        1: "text-display-xl",
        2: "text-display-lg",
        3: "text-display-md",
      } as const;
      const Tag = (`h${block.level}` as unknown) as keyof JSX.IntrinsicElements;
      return (
        <Container>
          <Tag
            className={cn(
              "display-serif tracking-tightest text-balance",
              sizes[block.level],
              block.align === "center" && "text-center"
            )}
          >
            {block.text[lang]}
          </Tag>
        </Container>
      );
    }
    case "text":
      return (
        <Container>
          <p
            className={cn(
              "max-w-3xl text-base leading-relaxed text-ink",
              block.align === "center" && "mx-auto text-center"
            )}
          >
            {block.text[lang]}
          </p>
        </Container>
      );
    case "image": {
      const isPortrait = block.id === "founder-portrait";
      return (
        <Container>
          <figure className={cn(isPortrait && "max-w-[14rem] sm:max-w-[16rem] me-auto")}>
            <img
              src={block.url}
              alt={block.alt ?? ""}
              className={cn(
                "object-cover",
                isPortrait ? "w-full aspect-[3/4]" : "w-full",
                block.rounded || isPortrait ? "rounded-3xl" : "rounded-none"
              )}
              loading="lazy"
            />
            {block.caption && (
              <figcaption
                className={cn(
                  "mt-3 text-sm text-ink-muted",
                  isPortrait ? "text-start" : "text-center"
                )}
              >
                {block.caption[lang]}
              </figcaption>
            )}
          </figure>
        </Container>
      );
    }
    case "button":
      return (
        <Container>
          <div className={cn(block.align === "center" ? "text-center" : "text-start")}>
            {block.href.startsWith("/") ? (
              <Button to={block.href} variant={block.variant ?? "primary"} arrow>
                {block.label[lang]}
              </Button>
            ) : (
              <Button href={block.href} variant={block.variant ?? "primary"} arrow>
                {block.label[lang]}
              </Button>
            )}
          </div>
        </Container>
      );
    case "divider":
      return (
        <Container>
          <hr className="border-ink/10" />
        </Container>
      );
    case "productGrid":
      return <ProductGridBlockRenderer block={block} />;
    case "coachingGrid":
      return <CoachingGridBlockRenderer block={block} />;
    default:
      return null;
  }
}

function ProductGridBlockRenderer({
  block,
}: {
  block: Extract<Block, { type: "productGrid" }>;
}) {
  const lang = useLang();
  const { data: products = [] } = useProductsByIds(block.productIds);
  const cols = block.columns ?? 3;
  if (products.length === 0) return null;
  return (
    <Container>
      {block.heading && (
        <h2 className="display-serif text-display-md tracking-tightest mb-8 text-balance">
          {block.heading[lang]}
        </h2>
      )}
      <div
        className={cn(
          "grid gap-8",
          cols === 2 && "md:grid-cols-2",
          cols === 3 && "md:grid-cols-2 xl:grid-cols-3",
          cols === 4 && "md:grid-cols-2 xl:grid-cols-4"
        )}
      >
        {products.map((p) => (
          <Link
            key={p.id}
            to={p.category === "diy" ? `/diy-plans/${p.slug}` : `/coaching/${p.slug}`}
          >
            <ProductCard product={p} />
          </Link>
        ))}
      </div>
    </Container>
  );
}

function CoachingGridBlockRenderer({
  block,
}: {
  block: Extract<Block, { type: "coachingGrid" }>;
}) {
  const lang = useLang();
  const { data: all = [] } = useProducts("coaching");
  const filtered =
    block.productIds && block.productIds.length > 0
      ? all.filter((p) => block.productIds!.includes(p.id))
      : all;
  const cols = block.columns ?? 3;
  if (filtered.length === 0) return null;
  return (
    <Container>
      {block.heading && (
        <h2 className="display-serif text-display-md tracking-tightest mb-8 text-balance">
          {block.heading[lang]}
        </h2>
      )}
      <div
        className={cn(
          "grid gap-8",
          cols === 2 && "md:grid-cols-2",
          cols === 3 && "md:grid-cols-2 xl:grid-cols-3",
          cols === 4 && "md:grid-cols-2 xl:grid-cols-4"
        )}
      >
        {filtered.map((p) => (
          <Link key={p.id} to={`/coaching/${p.slug}`}>
            <ProductCard product={p} />
          </Link>
        ))}
      </div>
    </Container>
  );
}

export function BlocksList({ blocks }: { blocks: Block[] }) {
  const lang = useLang();
  const out: JSX.Element[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const next = blocks[i + 1];
    if (
      b.type === "image" &&
      b.id === "founder-portrait" &&
      next &&
      next.type === "text"
    ) {
      out.push(
        <Container key={b.id}>
          <div className="grid items-start gap-6 md:gap-8 md:grid-cols-[14rem_1fr] lg:grid-cols-[16rem_1fr]">
            <figure className="m-0">
              <img
                src={b.url}
                alt={b.alt ?? ""}
                className="w-full aspect-[3/4] rounded-3xl object-cover"
                loading="lazy"
              />
              {b.caption && (
                <figcaption className="mt-3 text-start text-sm text-ink-muted">
                  {b.caption[lang]}
                </figcaption>
              )}
            </figure>
            <p className="max-w-3xl text-base leading-relaxed text-ink">
              {next.text[lang]}
            </p>
          </div>
        </Container>
      );
      i++;
      continue;
    }
    out.push(<BlockRenderer key={b.id} block={b} />);
  }
  return <div className="space-y-12 py-12 md:space-y-16 md:py-20">{out}</div>;
}
