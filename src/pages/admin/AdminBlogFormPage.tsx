import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";
import { blogPostToRow, mapBlogPost } from "@/lib/mappers";
import {
  BilingualField,
  Btn,
  Card,
  Field,
  ImageUploader,
  Input,
  PageHeader,
  Select,
  Toggle,
} from "@/components/admin/ui";
import type { BlogPost, LocalizedString } from "@/types";
import { slugify } from "@/lib/utils";

const CATEGORIES = ["hormones", "gut", "metabolic", "mindset", "habits", "energy"];

interface BlogForm extends BlogPost {
  isPublished: boolean;
}

const blank: BlogForm = {
  id: "",
  slug: "",
  title: { en: "", ar: "" },
  excerpt: { en: "", ar: "" },
  content: { en: "", ar: "" },
  category: "metabolic",
  author: "Reham Alsharif",
  publishedAt: new Date().toISOString().slice(0, 10),
  readingMinutes: 5,
  heroImage: undefined,
  featured: false,
  isPublished: true,
};

export function AdminBlogFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<BlogForm>(blank);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-blog-post", id],
    enabled: !isNew,
    queryFn: async () => {
      const sb = requireSupabase();
      const { data, error } = await sb.from("blog_posts").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const post = mapBlogPost(data);
      return { ...post, isPublished: data.is_published } as BlogForm;
    },
  });

  useEffect(() => {
    if (existing) setForm(existing);
  }, [existing]);

  const set = <K extends keyof BlogForm>(k: K, v: BlogForm[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const setLs = (k: "title" | "excerpt" | "content", ls: LocalizedString) =>
    setForm((s) => ({ ...s, [k]: ls }));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const sb = requireSupabase();
      const slug = form.slug?.trim() || slugify(form.title.en || form.title.ar);
      const row = blogPostToRow({ ...form, slug });

      if (isNew) {
        const { data, error } = await sb.from("blog_posts").insert(row).select("id").single();
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
        qc.invalidateQueries({ queryKey: ["blog-posts"] });
        nav(`/admin/blog/${data.id}`);
      } else {
        const { error } = await sb.from("blog_posts").update(row).eq("id", id!);
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
        qc.invalidateQueries({ queryKey: ["admin-blog-post", id] });
        qc.invalidateQueries({ queryKey: ["blog-posts"] });
        qc.invalidateQueries({ queryKey: ["blog-post", form.slug] });
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && isLoading) return <div className="p-8 text-sm text-ink-muted">Loading…</div>;

  return (
    <form onSubmit={onSave} className="space-y-6">
      <PageHeader
        title={isNew ? "New blog post" : "Edit blog post"}
        description={isNew ? "Publish a new article on /blog." : `Editing /blog/${form.slug}`}
      >
        <Link
          to="/admin/blog"
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm hover:bg-bone-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <Btn type="submit" loading={saving}>{isNew ? "Create" : "Save"}</Btn>
      </PageHeader>

      {err && (
        <div className="rounded-2xl border border-coral-500/30 bg-coral-50 p-4 text-sm text-coral-700">
          {err}
        </div>
      )}

      <Card>
        <div className="space-y-5">
          <BilingualField
            label="Title"
            valueEn={form.title.en}
            valueAr={form.title.ar}
            onChange={(ls) => setLs("title", ls)}
            required
          />

          <Field label="Slug" hint="URL: /blog/<slug>. Leave blank to auto-generate from the English title.">
            <Input
              value={form.slug}
              onChange={(e) => set("slug", e.currentTarget.value)}
              placeholder="auto-from-title"
            />
          </Field>

          <BilingualField
            label="Excerpt"
            valueEn={form.excerpt.en}
            valueAr={form.excerpt.ar}
            onChange={(ls) => setLs("excerpt", ls)}
            textarea
          />

          <BilingualField
            label="Content"
            valueEn={form.content.en}
            valueAr={form.content.ar}
            onChange={(ls) => setLs("content", ls)}
            textarea
          />
        </div>
      </Card>

      <Card>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Category">
            <Select
              value={form.category}
              onChange={(e) => set("category", e.currentTarget.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>

          <Field label="Author">
            <Input value={form.author} onChange={(e) => set("author", e.currentTarget.value)} />
          </Field>

          <Field label="Reading minutes">
            <Input
              type="number"
              min={1}
              value={form.readingMinutes}
              onChange={(e) => set("readingMinutes", Number(e.currentTarget.value) || 1)}
            />
          </Field>

          <Field label="Published date">
            <Input
              type="date"
              value={form.publishedAt.slice(0, 10)}
              onChange={(e) => set("publishedAt", e.currentTarget.value)}
            />
          </Field>
        </div>

        <div className="mt-6">
          <ImageUploader
            label="Hero image"
            bucket="blog-images"
            value={form.heroImage}
            onChange={(url) => set("heroImage", url)}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-6">
          <Toggle
            label="Featured (shown at top of /blog)"
            checked={!!form.featured}
            onChange={(v) => set("featured", v)}
          />
          <Toggle
            label="Published"
            checked={form.isPublished}
            onChange={(v) => set("isPublished", v)}
          />
        </div>
      </Card>
    </form>
  );
}
