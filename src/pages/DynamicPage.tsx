import { useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { BlocksList } from "@/components/blocks/BlockRenderer";
import { usePage } from "@/lib/queries";
import { useInstagramEmbeds } from "@/lib/instagramEmbed";

export function DynamicPage({ slug: slugProp }: { slug?: string } = {}) {
  const params = useParams<{ slug: string }>();
  const slug = slugProp ?? params.slug;
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const { data: page, isLoading } = usePage(slug);

  // Render any Instagram blockquotes inside rich-text blocks.
  useInstagramEmbeds(`${page?.id ?? slug ?? ""}:${lang}`);

  if (isLoading) {
    return (
      <Section variant="default" pad="md">
        <Container>
          <div className="text-sm text-ink-muted">Loading…</div>
        </Container>
      </Section>
    );
  }
  if (!page) return <Navigate to="/" replace />;

  return (
    <>
      <SEO
        title={page.title[lang]}
        description={page.description?.[lang] ?? page.title[lang]}
        path={`/p/${page.slug}`}
      />
      <BlocksList blocks={page.blocks} />
    </>
  );
}
