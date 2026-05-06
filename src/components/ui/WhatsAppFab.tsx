import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const PHONE = "96595597962";

export function WhatsAppFab() {
  const { t } = useTranslation();
  const label = t("whatsapp.label", { defaultValue: "Chat on WhatsApp" });
  return (
    <a
      href={`https://wa.me/${PHONE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-6 end-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-elevation transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={2.25} />
      <span className="sr-only">{label}</span>
    </a>
  );
}
