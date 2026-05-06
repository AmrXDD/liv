import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Cursor } from "@/components/ui/Cursor";
import { PageTransitionCover } from "@/components/ui/PageTransition";
import { Loader } from "@/components/ui/Loader";
import { WhatsAppFab } from "@/components/ui/WhatsAppFab";
import { useLenis } from "@/hooks/useLenis";

export function Layout() {
  useLenis();
  return (
    <>
      <Loader />
      <Cursor />
      <PageTransitionCover />
      <Header />
      <main id="main" className="relative pt-20 lg:pt-24">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
