import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDirection } from "@/hooks/useDirection";
import { GlassLinkCard, HeroFrame, Sparkle } from "./HeroShowcase";

export interface HeroListRow {
  key: string;
  /** Number ("01") or an icon shown before the title. */
  lead: ReactNode;
  title: string;
  meta?: string;
  href?: string;
}

/**
 * Dark, gold-trimmed card listing a few entries (pillars, picks, ways to
 * reach us), tilted slightly inside the ring frame.
 */
export function HeroListCard({ eyebrow, rows }: { eyebrow: string; rows: HeroListRow[] }) {
  const { isRtl } = useDirection();
  if (rows.length === 0) return null;

  return (
    <HeroFrame>
      <div className="absolute inset-x-[6%] top-1/2 -translate-y-1/2">
        <div className="motion-safe:animate-floaty">
          <div className="relative -rotate-2 overflow-hidden rounded-[1.75rem] bg-ink p-6 text-bone-50 shadow-[0_45px_80px_-30px_rgba(0,40,25,0.6)] ring-1 ring-bone-400/30 sm:p-8">
            <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-forest-500/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -start-10 h-40 w-40 rounded-full bg-coral-500/20 blur-3xl" />
            <div className="relative flex items-center gap-2 text-eyebrow uppercase text-bone-300">
              <Sparkle className="h-3 w-3" />
              {eyebrow}
            </div>
            <ul className="relative mt-5 divide-y divide-bone-50/10">
              {rows.map((row) => {
                const external = !!row.href && /^https?:/.test(row.href);
                const content = (
                  <>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-bone-400/40 font-mono text-xs text-bone-300">
                      {row.lead}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate display-serif text-lg leading-tight">{row.title}</span>
                      {row.meta && <span className="mt-0.5 block truncate text-xs text-bone-50/60">{row.meta}</span>}
                    </span>
                    {row.href && (
                      <ArrowUpRight
                        className={cn(
                          "h-4 w-4 shrink-0 text-bone-300 transition-transform duration-500 group-hover:rotate-45",
                          isRtl && "flip-rtl"
                        )}
                      />
                    )}
                  </>
                );
                const cls = "group flex items-center gap-4 py-3.5";
                return (
                  <li key={row.key}>
                    {!row.href ? (
                      <div className={cls}>{content}</div>
                    ) : external ? (
                      <a href={row.href} target="_blank" rel="noopener noreferrer" className={cls}>
                        {content}
                      </a>
                    ) : (
                      <Link to={row.href} className={cls}>
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </HeroFrame>
  );
}

/** Arched portrait inside the ring frame with a glass name card. */
export function HeroPortrait({
  src,
  isLoading = false,
  alt,
  objectPosition = "50% 35%",
  zoom = 1,
  name,
  role,
  href,
}: {
  src?: string;
  isLoading?: boolean;
  alt: string;
  objectPosition?: string;
  /** Scale the photo around objectPosition, e.g. to frame a face in a wide shot. */
  zoom?: number;
  name: string;
  role: string;
  href: string;
}) {
  if (!src && !isLoading) return null;
  return (
    <HeroFrame>
      {src ? (
        <div className="absolute left-1/2 top-[5%] w-[56%] -translate-x-1/2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-b-[1.25rem] rounded-t-full bg-bone-100 shadow-[0_45px_80px_-30px_rgba(0,40,25,0.55)] ring-1 ring-bone-400/40">
            <img
              src={src}
              alt={alt}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition, transform: zoom !== 1 ? `scale(${zoom})` : undefined, transformOrigin: objectPosition }}
            />
            <div className="absolute inset-0 rounded-b-[1.25rem] rounded-t-full ring-1 ring-inset ring-white/30" />
          </div>
        </div>
      ) : (
        <div className="absolute left-1/2 top-[5%] aspect-[4/5] w-[56%] -translate-x-1/2 animate-pulse rounded-b-[1.25rem] rounded-t-full bg-bone-200" />
      )}
      <GlassLinkCard to={href} label={role} title={name} className="absolute bottom-[6%] start-[4%] w-[74%]" />
    </HeroFrame>
  );
}
