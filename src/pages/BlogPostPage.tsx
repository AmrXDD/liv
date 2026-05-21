import { useParams, Link } from "react-router-dom";
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

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { isRtl } = useDirection();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";

  const { data: dbPost, isLoading } = useBlogPost(slug);
  const { data: dbPosts = [] } = useBlogPosts();

  const post = dbPost ?? (slug ? findPostBySlug(slug) : undefined);

  if (!post) {
    // Don't bounce to /blog — that confuses users who hard-load or share a
    // post URL while the DB query is still in flight. Show inline state.
    return (
      <Section variant="default" pad="md" className="bg-editorial">
        <Container>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink mb-10"
          >
            <ArrowLeft className={cn("h-4 w-4", isRtl && "flip-rtl")} />
            {t("nav.blog")}
          </Link>
          <div className="mx-auto max-w-2xl py-16 text-center">
            <div className="display-serif text-display-md tracking-tightest">
              {isLoading ? "…" : t("blog.empty")}
            </div>
            {!isLoading && (
              <Link
                to="/blog"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bone-50 hover:bg-forest-700"
              >
                {t("nav.blog")}
              </Link>
            )}
          </div>
        </Container>
      </Section>
    );
  }

  const allPosts = dbPosts.length > 0 ? dbPosts : fallbackPosts;
  const related = allPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  // Language fallbacks: if the current language's field is empty, use the other
  // one so the post stays openable even when content was only authored in one.
  const otherLang = lang === "en" ? "ar" : "en";
  const title = post.title[lang] || post.title[otherLang] || "";
  const excerpt = post.excerpt[lang] || post.excerpt[otherLang] || "";
  const body = post.content[lang] || post.content[otherLang] || "";
  const bodyDir = post.content[lang] ? lang : post.content[otherLang] ? otherLang : lang;

  return (
    <>
      <SEO
        title={title}
        description={excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        schema={articleSchema({
          title: post.title.en || post.title.ar,
          description: post.excerpt.en || post.excerpt.ar,
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

            <Reveal as="h1" className="mt-6 display-serif text-display-xl tracking-tightest text-balance break-words">
              {title}
            </Reveal>

            {excerpt && (
              <Reveal as="p" className="mt-6 text-xl text-ink-muted leading-relaxed break-words">
                {excerpt}
              </Reveal>
            )}

            <div className="mt-10 flex items-center gap-4 border-y border-ink/10 py-6">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-forest-500 text-bone-50 font-bold">
                {(post.author || "·")[0]}
              </div>
              <div>
                <div className="text-eyebrow uppercase text-ink-muted">{t("blog.byAuthor")}</div>
                <div className="font-semibold">{post.author}</div>
              </div>
            </div>
          </div>

          {body ? (
            <article
              className="mx-auto mt-12 w-full max-w-2xl prose prose-lg leading-relaxed break-words [overflow-wrap:anywhere] [&_a]:text-forest-700 [&_a]:underline [&_a:hover]:text-coral-600 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_iframe]:max-w-full [&_iframe]:w-full [&_video]:max-w-full [&_video]:h-auto [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_code]:break-words [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
              dir={bodyDir === "ar" ? "rtl" : "ltr"}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : (
            <p className="mx-auto mt-12 max-w-2xl text-center text-ink-muted">
              {t("blog.empty")}
            </p>
          )}
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

    </>
  );
}
