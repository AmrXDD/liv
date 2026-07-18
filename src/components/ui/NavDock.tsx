import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardList, CalendarHeart, HeartHandshake, BookOpen, Info } from "lucide-react";
import { Dock, type DockItemData } from "./Dock";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return mobile;
}

/**
 * Floating navigation dock, docked bottom-centre. Replaces the top navbar's
 * link list — mirrors the same destinations, including the "About" dropdown.
 * Heavily size-tuned for mobile (smaller icons, magnification off on touch).
 */
export function NavDock() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const nav = useNavigate();
  const isMobile = useIsMobile();

  const aboutLinks = [
    { to: "/about", label: t("nav.about") },
    { to: "/why-us", label: t("nav.whyUs") },
    { to: "/my-story", label: t("nav.myStory") },
    { to: "/contact", label: t("nav.contact") },
  ];
  const aboutActive = aboutLinks.some((l) => pathname.startsWith(l.to));

  const items: DockItemData[] = [
    {
      icon: <ClipboardList />,
      label: t("nav.diy"),
      ariaLabel: t("nav.diy"),
      active: pathname.startsWith("/diy-plans"),
      onClick: () => nav("/diy-plans"),
    },
    {
      icon: <CalendarHeart />,
      label: t("nav.consultations"),
      ariaLabel: t("nav.consultations"),
      active: pathname.startsWith("/consultations"),
      onClick: () => nav("/consultations"),
    },
    {
      icon: <HeartHandshake />,
      label: t("nav.coaching"),
      ariaLabel: t("nav.coaching"),
      active: pathname.startsWith("/coaching"),
      onClick: () => nav("/coaching"),
    },
    {
      icon: <Info />,
      label: t("nav.about"),
      ariaLabel: t("nav.about"),
      active: aboutActive,
      submenu: aboutLinks.map((l) => ({
        label: l.label,
        active: pathname.startsWith(l.to),
        onClick: () => nav(l.to),
      })),
    },
    {
      icon: <BookOpen />,
      label: t("nav.blog"),
      ariaLabel: t("nav.blog"),
      active: pathname.startsWith("/blog"),
      onClick: () => nav("/blog"),
    },
  ];

  return (
    <div className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 lg:bottom-8">
      <Dock
        items={items}
        magnify={!isMobile}
        baseItemSize={isMobile ? 46 : 52}
        panelHeight={isMobile ? 62 : 70}
        magnification={72}
      />
    </div>
  );
}

export default NavDock;
