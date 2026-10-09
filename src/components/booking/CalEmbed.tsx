import { useTranslation } from "react-i18next";

// Free discovery call only. The paid Functional Health Deep-Dive (Cal.com event
// "holistic-consultation") is hidden for now; restore the tab switcher from git
// history if it comes back.
const FREE_URL = "https://cal.com/livfunctional/discovery";

export function CalEmbed() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
  const src = `${FREE_URL}?embed=true&theme=light&layout=month_view&lang=${lang}`;

  return (
    <div className="rounded-3xl border border-ink/10 bg-surface-raised p-4 sm:p-6 shadow-elevation">
      <div className="mb-4 rounded-2xl border border-forest-500 bg-forest-500 px-4 py-3 text-start text-bone-50">
        <div className="text-eyebrow uppercase opacity-80">
          {t("consultations.tabs.freeEyebrow", { defaultValue: "Discovery call" })}
        </div>
        <div className="mt-1 font-semibold">
          {t("consultations.tabs.freeTitle", { defaultValue: "Free · 30 minutes" })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <iframe
          title="Free discovery booking"
          src={src}
          loading="lazy"
          className="block h-[760px] w-full sm:h-[820px] md:h-[880px]"
          allow="payment; clipboard-write; fullscreen"
        />
      </div>

      <div className="mt-3 text-center text-xs text-ink-muted">
        <a
          href={FREE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
        >
          {t("consultations.openInCal", { defaultValue: "Having trouble? Open in Cal.com" })} ↗
        </a>
      </div>
    </div>
  );
}
