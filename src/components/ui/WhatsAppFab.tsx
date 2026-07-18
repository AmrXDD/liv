import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { DOCK_NAV } from "@/lib/navConfig";

const PHONE = "96595597962";

/** Official WhatsApp glyph (phone in a speech bubble). */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.57-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.667 1.443h.005c6.585 0 11.946-5.359 11.949-11.893a11.821 11.821 0 00-3.481-8.449Z" />
    </svg>
  );
}

export function WhatsAppFab() {
  const { t } = useTranslation();
  const label = t("whatsapp.label", { defaultValue: "Chat on WhatsApp" });
  return (
    <a
      href={`https://wa.me/${PHONE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "fixed end-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-elevation transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]",
        // Lift above the floating dock on small screens when the dock is enabled.
        DOCK_NAV ? "bottom-24 sm:bottom-6 sm:end-6" : "bottom-6 end-6"
      )}
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="sr-only">{label}</span>
    </a>
  );
}
