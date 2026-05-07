import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Box, FolderOpen, FileText, LogOut, Sparkles, CalendarDays, Wallet, Mail, Newspaper, Award, AtSign } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin/products", label: "Products", icon: Box },
  { to: "/admin/coaching", label: "Coaching", icon: Sparkles },
  { to: "/admin/collections", label: "Collections", icon: FolderOpen },
  { to: "/admin/pages", label: "Pages", icon: FileText },
  { to: "/admin/blog", label: "Blog", icon: Newspaper },
  { to: "/admin/accreditations", label: "Accreditations", icon: Award },
  { to: "/admin/consultations", label: "Consultations", icon: CalendarDays },
  { to: "/admin/inquiries", label: "Inquiries", icon: Mail },
  { to: "/admin/newsletter", label: "Newsletter", icon: AtSign },
  { to: "/admin/payments", label: "Payments & Orders", icon: Wallet },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-surface-base text-ink">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-ink/10 bg-surface-raised lg:border-b-0 lg:border-e">
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-forest-500 text-bone-50 display-serif text-xl">
              L
            </div>
            <div>
              <div className="display-serif text-lg leading-none">Liv Functional</div>
              <div className="text-xs text-ink-muted">Admin</div>
            </div>
          </div>
          <nav className="px-3 pb-4">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-forest-500 text-bone-50"
                      : "text-ink hover:bg-bone-100"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-ink/10 px-6 py-4">
            <div className="mb-2 truncate text-xs text-ink-muted">{user?.email}</div>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                nav("/admin/login", { replace: true });
              }}
              className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-coral-600"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="px-6 py-8 md:px-10 md:py-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
