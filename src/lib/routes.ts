/** Listing page for the downloadable self-guided programs (formerly /diy-plans, which now redirects here). */
export const SELF_GUIDED_PATH = "/self-guided-programs-خطة-مقاومة-الانسولين";

/** True when the current pathname (percent-encoded or not) is on the self-guided section. */
export const isSelfGuidedPath = (pathname: string) => {
  const p = pathname === "/ar" || pathname.startsWith("/ar/") ? pathname.slice(3) : pathname;
  try {
    return decodeURI(p).startsWith(SELF_GUIDED_PATH);
  } catch {
    return p.startsWith(SELF_GUIDED_PATH);
  }
};

/** Lead-gen quiz. Not in the nav on purpose: it is linked from ads and social only. */
export const IR_QUIZ_PATH =
  "/what-are-insulin-resistance-symptoms-how-do-i-know-if-i-have-it-كيف-اعرف-إذا-في-عندي-مقاومة-انسولين";

/** Slug of the retired "Do I have Insulin Resistance?" free-assessment product (redirects to the quiz). */
export const FREE_ASSESSMENT_SLUG = "free-assessment-كيف-اعرف-إذا-عندي-مقاومة-انسولين";

/** Corporate wellness landing page (replaces the old /b2b page). */
export const LIV_AT_WORK_PATH = "/liv-at-work";

/** Slug of the old "Liv At work | Corporate Wellness Coaching" product (redirects to the page above). */
export const CORPORATE_PRODUCT_SLUG = "HR-corporate-wellness-coaching-program-corporate-event-idea-in-kuwait";
