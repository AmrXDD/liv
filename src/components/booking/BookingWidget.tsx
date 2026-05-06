import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";
import type { BookingPayload, Locale } from "@/types";
import { buildGoogleCalendarUrl, PRACTITIONER_EMAIL } from "@/lib/googleCalendar";

function buildSchema(agreementErr: string) {
  return z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    date: z.string().min(1),
    time: z.string().min(1),
    topic: z.string().optional(),
    message: z.string().optional(),
    agreement: z.literal(true, {
      errorMap: () => ({ message: agreementErr }),
    }),
  });
}
type FormShape = z.infer<ReturnType<typeof buildSchema>>;

const TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function BookingWidget() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language?.startsWith("ar") ? "ar" : "en") as Locale;
  const isAr = locale === "ar";
  const L = {
    prevMonth: isAr ? "الشهر السابق" : "Previous month",
    nextMonth: isAr ? "الشهر التالي" : "Next month",
    dayHeaders: isAr ? ["ح", "ن", "ث", "ر", "خ", "ج", "س"] : ["S", "M", "T", "W", "T", "F", "S"],
    pickDateTime: isAr ? "اختاري التاريخ والوقت للمتابعة." : "Pick a date and time to continue.",
    agreementErr: isAr
      ? "يجب الموافقة على اتفاقية التدريب للمتابعة."
      : "You must accept the coaching agreement to continue.",
    agreementPre: isAr ? "قرأتُ ووافقتُ على " : "I have read and agree to the ",
    agreementLink: isAr ? "اتفاقية التدريب" : "Coaching Agreement",
    agreementPost: isAr ? "، بما في ذلك سياسات الإلغاء والاسترداد." : ", including the cancellation and refund policies.",
  };
  const schema = useMemo(() => buildSchema(L.agreementErr), [L.agreementErr]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [calendarUrl, setCalendarUrl] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormShape>({ resolver: zodResolver(schema) });

  const monthLabel = cursor.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    month: "long",
    year: "numeric",
  });

  const totalDays = daysInMonth(cursor);
  const offset = startOfMonth(cursor).getDay(); // 0–6, Sun=0

  const selectDate = (day: number) => {
    const picked = new Date(cursor.getFullYear(), cursor.getMonth(), day);
    if (picked < today) return;
    const iso = picked.toISOString().slice(0, 10);
    setDate(iso);
    setValue("date", iso, { shouldValidate: true });
  };

  const selectTime = (t: string) => {
    setTime(t);
    setValue("time", t, { shouldValidate: true });
  };

  const onSubmit = async (data: FormShape) => {
    setStatus("loading");
    const payload: BookingPayload = { ...data, locale };
    const sb = getSupabase();

    const fallbackUrl = buildGoogleCalendarUrl({
      title: `Liv Functional — Consultation${data.topic ? `: ${data.topic}` : ""}`,
      description: [
        `Booked by ${data.name} (${data.email}${data.phone ? `, ${data.phone}` : ""})`,
        data.message ? `\nNotes:\n${data.message}` : "",
        `\n\nPractitioner: Reham Al Sharif <${PRACTITIONER_EMAIL}>`,
      ].join(""),
      date: data.date,
      time: data.time,
      durationMinutes: 30,
      guestEmail: data.email,
    });

    try {
      if (!sb) throw new Error("Supabase not configured");
      const { data: res, error } = await sb.functions.invoke<{
        ok: boolean;
        html_link?: string;
        error?: string;
      }>("book-consultation", { body: payload });
      if (error) throw error;
      if (!res?.ok) throw new Error(res?.error ?? "Booking failed");
      setCalendarUrl(res.html_link ?? fallbackUrl);
      setStatus("ok");
    } catch (e) {
      console.error("[booking] failed:", e);
      setCalendarUrl(fallbackUrl);
      setStatus("err");
    }
  };

  if (status === "ok") {
    return (
      <div className="rounded-3xl border border-forest-500/20 bg-forest-50 p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-500 text-bone-50">
          <Check className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div className="mt-6 display-serif text-3xl">{t("consultations.form.success")}</div>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
          {t("consultations.form.calendarHint", {
            defaultValue:
              "We've added Reham as a guest. Save the event to your calendar so you don't miss it.",
          })}
        </p>
        {calendarUrl && (
          <a
            href={calendarUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest-500 px-6 py-3 text-sm font-semibold text-bone-50 hover:bg-forest-600"
          >
            <Calendar className="h-4 w-4" />
            {t("consultations.form.addToCalendar", { defaultValue: "Add to Google Calendar" })}
          </a>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-8 rounded-3xl border border-ink/10 bg-surface-raised p-6 shadow-elevation md:p-10 md:grid-cols-2"
    >
      <div>
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 hover:bg-bone-100"
            aria-label={L.prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="font-semibold">{monthLabel}</div>
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 hover:bg-bone-100"
            aria-label={L.nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-eyebrow uppercase text-ink-muted mb-2">
          {L.dayHeaders.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset }).map((_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1;
            const dt = new Date(cursor.getFullYear(), cursor.getMonth(), day);
            const iso = dt.toISOString().slice(0, 10);
            const past = dt < today;
            const selected = iso === date;
            return (
              <button
                type="button"
                key={day}
                disabled={past}
                onClick={() => selectDate(day)}
                className={cn(
                  "aspect-square rounded-xl text-sm font-medium transition-all",
                  past && "text-ink-muted/40 cursor-not-allowed",
                  !past && !selected && "hover:bg-bone-100",
                  selected && "bg-forest-500 text-bone-50"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="text-eyebrow uppercase text-ink-muted mb-3">
            {t("consultations.form.time")}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {TIMES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => selectTime(s)}
                disabled={!date}
                className={cn(
                  "min-h-[44px] rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                  !date && "opacity-40 cursor-not-allowed",
                  time === s && date
                    ? "bg-ink text-bone-50 border-ink"
                    : "border-ink/15 hover:border-ink"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <input type="hidden" {...register("date")} />
          <input type="hidden" {...register("time")} />
          {(errors.date || errors.time) && (
            <p className="mt-2 text-xs text-coral-600">{L.pickDateTime}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Field label={t("consultations.form.name")} error={errors.name?.message}>
          <input
            {...register("name")}
            className="w-full rounded-xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
          />
        </Field>
        <Field label={t("consultations.form.email")} error={errors.email?.message}>
          <input
            type="email"
            {...register("email")}
            className="w-full rounded-xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
          />
        </Field>
        <Field label={t("consultations.form.phone")}>
          <input
            type="tel"
            {...register("phone")}
            className="w-full rounded-xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
          />
        </Field>
        <Field label={t("consultations.form.topic")}>
          <input
            type="text"
            placeholder={t("consultations.form.topicPlaceholder")}
            {...register("topic")}
            className="w-full rounded-xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
          />
        </Field>
        <Field label={t("consultations.form.message")}>
          <textarea
            rows={4}
            {...register("message")}
            className="w-full rounded-xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
          />
        </Field>

        <label className="flex items-start gap-3 text-xs leading-relaxed text-ink-muted">
          <input
            type="checkbox"
            {...register("agreement")}
            className="mt-1 h-4 w-4 shrink-0 accent-forest-500"
          />
          <span>
            {L.agreementPre}
            <a
              href="/coaching-agreement"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ink underline underline-offset-2 hover:text-forest-700"
            >
              {L.agreementLink}
            </a>
            {L.agreementPost}
          </span>
        </label>
        {errors.agreement && (
          <p className="text-xs text-coral-600">{errors.agreement.message}</p>
        )}

        <Button type="submit" variant="primary" size="lg" arrow className="w-full">
          {status === "loading" ? t("consultations.form.submitting") : t("consultations.form.submit")}
        </Button>

        {status === "err" && (
          <p className="text-sm text-coral-600">{t("consultations.form.error")}</p>
        )}
      </div>
    </form>
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
