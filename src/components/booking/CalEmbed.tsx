import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type Tab = "free" | "paid";

const URLS: Record<Tab, string> = {
  free: "https://cal.com/livfunctional/discovery",
  paid: "https://cal.com/livfunctional/holistic-consultation",
};

export function CalEmbed({ initial = "free" }: { initial?: Tab }) {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<Tab>(initial);
  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
  const src = `${URLS[tab]}?embed=true&theme=light&layout=month_view&lang=${lang}`;

  return (
    <div className="rounded-3xl border border-ink/10 bg-surface-raised p-4 sm:p-6 shadow-elevation">
      <div role="tablist" className="mb-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "free"}
          onClick={() => setTab("free")}
          className={cn(
            "flex-1 rounded-2xl border px-4 py-3 text-start transition-colors",
            tab === "free"
              ? "border-forest-500 bg-forest-500 text-bone-50"
              : "border-ink/10 bg-surface-base hover:bg-bone-100"
          )}
        >
          <div className="text-eyebrow uppercase opacity-80">
            {t("consultations.tabs.freeEyebrow", { defaultValue: "Discovery call" })}
          </div>
          <div className="mt-1 font-semibold">
            {t("consultations.tabs.freeTitle", { defaultValue: "Free · 20 minutes" })}
          </div>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "paid"}
          onClick={() => setTab("paid")}
          className={cn(
            "flex-1 rounded-2xl border px-4 py-3 text-start transition-colors",
            tab === "paid"
              ? "border-coral-500 bg-coral-500 text-bone-50"
              : "border-ink/10 bg-surface-base hover:bg-bone-100"
          )}
        >
          <div className="text-eyebrow uppercase opacity-80">
            {t("consultations.tabs.paidEyebrow", { defaultValue: "Holistic consultation" })}
          </div>
          <div className="mt-1 font-semibold">
            {t("consultations.tabs.paidTitle", { defaultValue: "135 KWD · 90 minutes" })}
          </div>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <iframe
          key={tab}
          title={tab === "free" ? "Free discovery booking" : "Holistic consultation booking"}
          src={src}
          loading="lazy"
          className="block h-[760px] w-full sm:h-[820px] md:h-[880px]"
          allow="payment; clipboard-write; fullscreen"
        />
      </div>

      <div className="mt-3 text-center text-xs text-ink-muted">
        <a
          href={URLS[tab]}
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
