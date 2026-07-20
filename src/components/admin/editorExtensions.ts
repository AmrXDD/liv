import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Inline image node for the WYSIWYG editor. Stores a plain <img> so the public
 * blog/page renderers (which inject the saved HTML) display it with no extra
 * styling wiring — the prose classes already size images responsively.
 */
export const InlineImage = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
    };
  },
  parseHTML() {
    return [{ tag: "img[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes, { loading: "lazy" })];
  },
});

/**
 * Embedded media node. Two modes:
 *  - "iframe": responsive embed (YouTube / Vimeo 16:9, or Instagram reels/posts
 *    which are portrait and narrower). `aspect` is the padding-bottom % and
 *    `width` an optional max-width in px. Rendered with inline styles (not
 *    Tailwind classes) so it survives being stored as raw HTML and re-injected
 *    on the public site, where the JIT CSS wouldn't include those utilities.
 *  - "video": a native <video> element for direct file URLs (.mp4, .webm…).
 */
export const MediaEmbed = Node.create({
  name: "mediaEmbed",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      mode: { default: "iframe" },
      aspect: { default: 56.25 },
      width: { default: null },
    };
  },
  parseHTML() {
    return [
      {
        // Round-trip our own wrapper (keeps aspect / max-width across edits).
        tag: "div[data-embed]",
        getAttrs: (el) => {
          const e = el as HTMLElement;
          const video = e.querySelector("video");
          if (video) return { src: video.getAttribute("src"), mode: "video" };
          const iframe = e.querySelector("iframe");
          return {
            src: iframe?.getAttribute("src") ?? "",
            mode: "iframe",
            aspect: Number(e.getAttribute("data-aspect")) || 56.25,
            width: e.getAttribute("data-width") ? Number(e.getAttribute("data-width")) : null,
          };
        },
      },
      { tag: "iframe[src]", getAttrs: (el) => ({ src: (el as HTMLElement).getAttribute("src"), mode: "iframe" }) },
      { tag: "video[src]", getAttrs: (el) => ({ src: (el as HTMLElement).getAttribute("src"), mode: "video" }) },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as { src?: string; mode?: string; aspect?: number; width?: number | null };
    const src = attrs.src ?? "";

    if (attrs.mode === "video") {
      return [
        "video",
        {
          src,
          controls: "true",
          playsinline: "true",
          style: "max-width:100%;height:auto;border-radius:0.75rem;display:block;margin:0 auto;",
        },
      ];
    }

    const aspect = Number(attrs.aspect) || 56.25;
    const width = attrs.width ? Number(attrs.width) : null;

    return [
      "div",
      {
        "data-embed": "iframe",
        "data-aspect": String(aspect),
        "data-width": width ? String(width) : "",
        style: `max-width:${width ? `${width}px` : "100%"};margin:0 auto;`,
      },
      [
        "div",
        {
          style: `position:relative;width:100%;padding-bottom:${aspect}%;height:0;border-radius:0.75rem;overflow:hidden;`,
        },
        [
          "iframe",
          {
            src,
            frameborder: "0",
            scrolling: "no",
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
            allowfullscreen: "true",
            style: "position:absolute;top:0;left:0;width:100%;height:100%;border:0;",
          },
        ],
      ],
    ];
  },
});

export interface MediaDescriptor {
  src: string;
  mode: "iframe" | "video";
  aspect?: number;
  width?: number | null;
}

/**
 * Convert a user-supplied media URL into an embed descriptor.
 * Supports YouTube, Vimeo, Instagram (reels/posts/tv/igtv) and direct video
 * files. Returns null for unsafe / unrecognised URLs.
 */
export function resolveMediaUrl(raw: string): MediaDescriptor | null {
  const url = raw.trim();
  if (!url) return null;
  // Only allow http(s) sources.
  if (!/^https?:\/\//i.test(url)) return null;

  // YouTube
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i)?.[1];
  if (yt) return { src: `https://www.youtube.com/embed/${yt}`, mode: "iframe" };

  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i)?.[1];
  if (vimeo) return { src: `https://player.vimeo.com/video/${vimeo}`, mode: "iframe" };

  // Instagram (reel / post / tv). Uses the public /embed/ iframe endpoint.
  const ig = url.match(/instagram\.com\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  if (ig) {
    const type = ig[1].toLowerCase() === "reels" ? "reel" : ig[1].toLowerCase();
    const code = ig[2];
    // Portrait, ~400px wide. Reels/IGTV are taller than square posts; extra
    // height accounts for Instagram's own header/footer chrome.
    const aspect = type === "p" ? 128 : 178;
    return { src: `https://www.instagram.com/${type}/${code}/embed/`, mode: "iframe", aspect, width: 400 };
  }

  // Direct video file
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return { src: url, mode: "video" };

  // Already an embeddable player URL
  if (/\/embed\/|player\./i.test(url)) return { src: url, mode: "iframe" };

  return null;
}
