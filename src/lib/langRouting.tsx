import { forwardRef, useCallback, useEffect } from "react";
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  Navigate as RouterNavigate,
  useLocation,
  useNavigate as useRouterNavigate,
  type LinkProps,
  type NavLinkProps,
  type NavigateProps,
  type NavigateOptions,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Lang } from "@/lib/i18n";

/** URL prefix for the Arabic site. English lives at the unprefixed root. */
export const AR_PREFIX = "/ar";

/** Paths that are never language-prefixed. */
const isAdminPath = (p: string) => p === "/admin" || p.startsWith("/admin/");

/** Language encoded in a pathname: `/ar` or `/ar/...` is Arabic, everything else English. */
export function langFromPath(pathname: string): Lang {
  return pathname === AR_PREFIX || pathname.startsWith(`${AR_PREFIX}/`) ? "ar" : "en";
}

/** Remove the `/ar` prefix from a pathname (no-op for English paths). */
export function stripLang(pathname: string): string {
  if (pathname === AR_PREFIX) return "/";
  return pathname.startsWith(`${AR_PREFIX}/`) ? pathname.slice(AR_PREFIX.length) : pathname;
}

/** Add the `/ar` prefix when lang is Arabic. Leaves admin, external and relative targets alone. */
export function withLang<T extends string>(to: T, lang: Lang): T | string {
  if (lang !== "ar" || !to.startsWith("/") || to.startsWith("//")) return to;
  if (isAdminPath(to) || langFromPath(to) === "ar") return to;
  return to === "/" ? AR_PREFIX : `${AR_PREFIX}${to}`;
}

/** Current language as encoded in the URL (admin counts as English/unprefixed). */
export function useUrlLang(): Lang {
  return langFromPath(useLocation().pathname);
}

const localizeTo = (to: LinkProps["to"], lang: Lang): LinkProps["to"] => {
  if (typeof to === "string") return withLang(to, lang);
  if (to.pathname) return { ...to, pathname: withLang(to.pathname, lang) };
  return to;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, ...rest }, ref) {
  const lang = useUrlLang();
  return <RouterLink ref={ref} to={localizeTo(to, lang)} {...rest} />;
});

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink({ to, ...rest }, ref) {
  const lang = useUrlLang();
  return <RouterNavLink ref={ref} to={localizeTo(to, lang)} {...rest} />;
});

export function Navigate({ to, ...rest }: NavigateProps) {
  const lang = useUrlLang();
  return <RouterNavigate to={localizeTo(to, lang)} {...rest} />;
}

/** Like react-router's useNavigate, but keeps the current language prefix. */
export function useNavigate() {
  const navigate = useRouterNavigate();
  const lang = useUrlLang();
  return useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === "number") navigate(to);
      else navigate(withLang(to, lang), options);
    },
    [navigate, lang]
  );
}

/**
 * Keeps i18n in step with the URL (the URL is the source of truth) and, on the
 * first load, sends visitors whose saved/browser language is Arabic from the
 * unprefixed English URL to its `/ar` twin.
 */
export function LanguageRouteSync() {
  const { pathname, search, hash } = useLocation();
  const navigate = useRouterNavigate();
  const { i18n } = useTranslation();
  const urlLang = langFromPath(pathname);

  useEffect(() => {
    if (isAdminPath(pathname)) return;
    const preferred: Lang = i18n.language?.startsWith("ar") ? "ar" : "en";

    if (!firstLoadHandled) {
      firstLoadHandled = true;
      if (urlLang === "en" && preferred === "ar") {
        navigate(`${withLang(pathname, "ar")}${search}${hash}`, { replace: true });
        return;
      }
    }
    if (preferred !== urlLang) void i18n.changeLanguage(urlLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}

let firstLoadHandled = false;
