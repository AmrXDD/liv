import { useTranslation } from "react-i18next";
import { Marquee } from "@/components/ui/Marquee";

export function MarqueeBand() {
  const { t } = useTranslation();
  const items = (t("marquee", { returnObjects: true }) as string[]) || [];
  return (
    <div className="border-y border-ink/10 bg-surface-base py-6">
      <Marquee
        items={items}
        speed={50}
        separator={<span className="mx-8 inline-block h-2 w-2 rounded-full bg-coral-500" />}
      />
    </div>
  );
}
