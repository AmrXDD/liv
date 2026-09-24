/** Listing page for the downloadable self-guided programs (formerly /diy-plans, which now redirects here). */
export const SELF_GUIDED_PATH = "/self-guided-programs-خطة-مقاومة-الانسولين";

/** True when the current pathname (percent-encoded or not) is on the self-guided section. */
export const isSelfGuidedPath = (pathname: string) => {
  try {
    return decodeURI(pathname).startsWith(SELF_GUIDED_PATH);
  } catch {
    return pathname.startsWith(SELF_GUIDED_PATH);
  }
};
