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
 *  - "iframe": responsive 16:9 video embed (YouTube / Vimeo). Rendered with
 *    inline styles (not Tailwind classes) so it survives being stored as raw
 *    HTML and re-injected on the public site, where the JIT CSS wouldn't
 *    otherwise include those utility classes.
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
    };
  },
  parseHTML() {
    return [
      { tag: "iframe[src]", getAttrs: (el) => ({ src: (el as HTMLElement).getAttribute("src"), mode: "iframe" }) },
      { tag: "video[src]", getAttrs: (el) => ({ src: (el as HTMLElement).getAttribute("src"), mode: "video" }) },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const src = (HTMLAttributes as { src?: string }).src ?? "";
    if ((HTMLAttributes as { mode?: string }).mode === "video") {
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
    return [
      "div",
      { style: "position:relative;width:100%;padding-bottom:56.25%;height:0;border-radius:0.75rem;overflow:hidden;" },
      [
        "iframe",
        {
          src,
          frameborder: "0",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          allowfullscreen: "true",
          style: "position:absolute;top:0;left:0;width:100%;height:100%;border:0;",
        },
      ],
    ];
  },
});

/**
 * Convert a user-supplied media URL into an embed descriptor.
 * Returns null for unsafe / unrecognised URLs.
 */
export function resolveMediaUrl(raw: string): { src: string; mode: "iframe" | "video" } | null {
  const url = raw.trim();
  if (!url) return null;
  // Only allow http(s) sources.
  if (!/^https?:\/\//i.test(url)) return null;

  // YouTube
  const yt =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i)?.[1];
  if (yt) return { src: `https://www.youtube.com/embed/${yt}`, mode: "iframe" };

  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i)?.[1];
  if (vimeo) return { src: `https://player.vimeo.com/video/${vimeo}`, mode: "iframe" };

  // Direct video file
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return { src: url, mode: "video" };

  // Already an embeddable player URL
  if (/\/embed\/|player\./i.test(url)) return { src: url, mode: "iframe" };

  return null;
}
