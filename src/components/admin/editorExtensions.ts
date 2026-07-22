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

const IG_BLOCKQUOTE_STYLE =
  "background:#FFF;border:0;border-radius:3px;box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15);margin:1px auto;max-width:540px;min-width:326px;padding:0;width:99.375%;";

/**
 * Embedded media node. Three modes:
 *  - "iframe": responsive 16:9 embed (YouTube / Vimeo), inline-styled so it
 *    survives being stored as raw HTML and re-injected on the public site.
 *  - "video": a native <video> element for direct file URLs (.mp4, .webm…).
 *  - "instagram": Instagram's official blockquote. Instagram forbids raw
 *    iframes (X-Frame-Options: DENY), so their reels/posts must be rendered via
 *    embed.js, which turns this blockquote into a correctly-sized embed. See
 *    lib/instagramEmbed.ts for the script that processes it on the public site.
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
      href: { default: null },
    };
  },
  parseHTML() {
    return [
      {
        // Instagram official embed markup — must win over StarterKit's blockquote.
        tag: "blockquote.instagram-media",
        priority: 100,
        getAttrs: (el) => {
          const e = el as HTMLElement;
          return {
            mode: "instagram",
            href: e.getAttribute("data-instgrm-permalink") || e.querySelector("a")?.getAttribute("href") || "",
          };
        },
      },
      {
        // Round-trip our own iframe wrapper (keeps aspect / max-width).
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
    const attrs = HTMLAttributes as {
      src?: string;
      mode?: string;
      aspect?: number;
      width?: number | null;
      href?: string;
    };

    if (attrs.mode === "instagram") {
      const href = attrs.href ?? attrs.src ?? "";
      return [
        "blockquote",
        {
          class: "instagram-media",
          "data-instgrm-permalink": href,
          "data-instgrm-version": "14",
          style: IG_BLOCKQUOTE_STYLE,
        },
        [
          "a",
          {
            href,
            target: "_blank",
            rel: "noopener noreferrer",
            style: "display:block;padding:16px;color:#3897f0;font-weight:600;text-decoration:none;font-size:14px;",
          },
          "View this post on Instagram",
        ],
      ];
    }

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
  mode: "iframe" | "video" | "instagram";
  aspect?: number;
  width?: number | null;
  href?: string;
}

/**
 * Convert a user-supplied media URL into an embed descriptor.
 * Supports YouTube, Vimeo, Instagram (reels/posts/tv, with or without a
 * username in the path) and direct video files. Returns null for unsafe /
 * unrecognised URLs.
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

  // Instagram (reel / post / tv) — optional "/username/" segment before the type.
  const ig = url.match(/instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  if (ig) {
    const type = ig[1].toLowerCase() === "reels" ? "reel" : ig[1].toLowerCase();
    const href = `https://www.instagram.com/${type}/${ig[2]}/`;
    return { src: href, href, mode: "instagram" };
  }

  // Direct video file
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return { src: url, mode: "video" };

  // Already an embeddable player URL
  if (/\/embed\/|player\./i.test(url)) return { src: url, mode: "iframe" };

  return null;
}
