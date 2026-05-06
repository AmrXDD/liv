import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useProductsByIds } from "@/lib/queries";
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
    case "image":
      return (
        <Container>
          <figure>
            <img
              src={block.url}
              alt={block.alt ?? ""}
              className={cn(
                "w-full object-cover",
                block.rounded ? "rounded-3xl" : "rounded-none"
              )}
              loading="lazy"
            />
            {block.caption && (
              <figcaption className="mt-3 text-center text-sm text-ink-muted">
                {block.caption[lang]}
              </figcaption>
            )}
          </figure>
        </Container>
      );
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

export function BlocksList({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-12 py-12 md:space-y-16 md:py-20">
      {blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} />
      ))}
    </div>
  );
}
