import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SEO } from "@/components/seo/SEO";
import { CollectionHero } from "@/components/product/CollectionHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";
import type { ContactPayload, Locale } from "@/types";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(10),
});
type Shape = z.infer<typeof schema>;

export function ContactPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language?.startsWith("ar") ? "ar" : "en") as Locale;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Shape>({ resolver: zodResolver(schema) });
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  const onSubmit = async (data: Shape) => {
    setStatus("loading");
    const sb = getSupabase();
    const payload: ContactPayload = { ...data, locale };
    try {
      if (sb) {
        const { error } = await sb.from("contacts").insert(payload);
        if (error) throw error;
      }
      setStatus("ok");
      reset();
    } catch (e) {
      console.error("[contact] insert failed:", e);
      setStatus("err");
    }
  };

  return (
    <>
      <SEO title={t("static.contact.title")} description={t("static.contact.lede")} path="/contact" />
      <CollectionHero
        eyebrow={t("nav.contact")}
        title={t("static.contact.title")}
        lede={t("static.contact.lede")}
      />
      <Section variant="default" pad="md">
        <Container>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto grid max-w-2xl gap-5 rounded-3xl border border-ink/10 bg-surface-raised p-8 md:p-10 shadow-elevation"
          >
            <Field label={t("static.contact.form.name")} error={errors.name?.message}>
              <input
                {...register("name")}
                className="w-full rounded-xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </Field>
            <Field label={t("static.contact.form.email")} error={errors.email?.message}>
              <input
                type="email"
                {...register("email")}
                className="w-full rounded-xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </Field>
            <Field label={t("static.contact.form.subject")}>
              <input
                {...register("subject")}
                className="w-full rounded-xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </Field>
            <Field label={t("static.contact.form.message")} error={errors.message?.message}>
              <textarea
                rows={6}
                {...register("message")}
                className="w-full rounded-xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </Field>
            <Button type="submit" variant="primary" size="lg" arrow>
              {status === "loading" ? "…" : t("static.contact.form.submit")}
            </Button>
            {status === "ok" && (
              <p className="text-sm text-forest-700">{t("static.contact.form.success")}</p>
            )}
            {status === "err" && (
              <p className="text-sm text-coral-600">{t("static.contact.form.error")}</p>
            )}
          </form>
        </Container>
      </Section>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-eyebrow uppercase text-ink-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-coral-600">{error}</span>}
    </label>
  );
}
