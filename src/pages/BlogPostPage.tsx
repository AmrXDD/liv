import { useParams, Navigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { findPostBySlug, posts as fallbackPosts } from "@/data/posts";
import { useBlogPost, useBlogPosts } from "@/lib/queries";
import { articleSchema, buildCanonical } from "@/lib/seo";
import { formatDate, cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { useDirection } from "@/hooks/useDirection";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { isRtl } = useDirection();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";

  const { data: dbPost, isLoading } = useBlogPost(slug);
  const { data: dbPosts = [] } = useBlogPosts();

  const post = dbPost ?? (slug ? findPostBySlug(slug) : undefined);
  if (!post && !isLoading) return <Navigate to="/blog" replace />;
  if (!post) return null;

  const allPosts = dbPosts.length > 0 ? dbPosts : fallbackPosts;
  const related = allPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <>
      <SEO
        title={post.title[lang]}
        description={post.excerpt[lang]}
        path={`/blog/${post.slug}`}
        type="article"
        schema={articleSchema({
          title: post.title.en,
          description: post.excerpt.en,
          datePublished: post.publishedAt,
          author: post.author,
          url: buildCanonical(`/blog/${post.slug}`),
        })}
      />

      <Section variant="default" pad="md" className="bg-editorial">
        <Container>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink mb-10"
          >
            <ArrowLeft className={cn("h-4 w-4", isRtl && "flip-rtl")} />
            {t("nav.blog")}
          </Link>

          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 text-eyebrow uppercase text-ink-muted">
              <span className="rounded-full bg-coral-100 text-coral-700 px-3 py-1">{post.category}</span>
              <span>{formatDate(post.publishedAt, lang === "ar" ? "ar-SA" : "en-US")}</span>
              <span>·</span>
              <span>{post.readingMinutes} {t("blog.minRead")}</span>
            </div>

            <Reveal as="h1" className="mt-6 display-serif text-display-xl tracking-tightest text-balance">
              {post.title[lang]}
            </Reveal>

            <Reveal as="p" className="mt-6 text-xl text-ink-muted leading-relaxed">
              {post.excerpt[lang]}
            </Reveal>

            <div className="mt-10 flex items-center gap-4 border-y border-ink/10 py-6">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-forest-500 text-bone-50 font-bold">
                {post.author[0]}
              </div>
              <div>
                <div className="text-eyebrow uppercase text-ink-muted">{t("blog.byAuthor")}</div>
                <div className="font-semibold">{post.author}</div>
              </div>
            </div>
          </div>

          <article className="mx-auto mt-12 max-w-2xl prose prose-lg leading-relaxed">
            <p className="text-lg text-ink leading-loose whitespace-pre-line text-pretty">
              {post.content[lang]}
            </p>
          </article>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section variant="sunken" pad="md">
          <Container>
            <div className="mb-10 display-serif text-display-md tracking-tightest">More to read</div>
            <div className="grid gap-8 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="group block rounded-2xl border border-ink/10 bg-surface-raised p-8 transition-all hover:-translate-y-1 hover:shadow-elevation"
                >
                  <div className="text-eyebrow uppercase text-coral-600">{p.category}</div>
                  <h3 className="mt-4 display-serif text-xl tracking-tight">{p.title[lang]}</h3>
                  <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{p.excerpt[lang]}</p>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <NewsletterCTA />
    </>
  );
}
