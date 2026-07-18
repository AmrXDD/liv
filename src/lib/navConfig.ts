/**
 * Navigation mode switch.
 *
 * DOCK_NAV = true  → new experience: slim centered header (logo + language +
 *                    cart + book CTA) with a floating macOS-style dock for the
 *                    main navigation (including an "About" dropdown).
 * DOCK_NAV = false → original experience: full top navbar with inline links and
 *                    the mobile hamburger menu; no dock.
 *
 * This is a deliberate on/off so the whole redesign can be reverted in one line
 * if the client prefers the original. The old Header/MobileMenu code is kept
 * intact and used when this is false.
 */
export const DOCK_NAV = false;
