import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { HeaderDock } from "./HeaderDock";
import { Footer } from "./Footer";
import { Cursor } from "@/components/ui/Cursor";
import { PageTransitionCover } from "@/components/ui/PageTransition";
import { Loader } from "@/components/ui/Loader";
import { WhatsAppFab } from "@/components/ui/WhatsAppFab";
import { NavDock } from "@/components/ui/NavDock";
import { useLenis } from "@/hooks/useLenis";
import { DOCK_NAV } from "@/lib/navConfig";

export function Layout() {
  useLenis();
  return (
    <>
      <Loader />
      <Cursor />
      <PageTransitionCover />
      {DOCK_NAV ? <HeaderDock /> : <Header />}
      <main id="main" className={DOCK_NAV ? "relative pt-16 lg:pt-20" : "relative pt-20 lg:pt-24"}>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab />
      {DOCK_NAV && <NavDock />}
    </>
  );
}
