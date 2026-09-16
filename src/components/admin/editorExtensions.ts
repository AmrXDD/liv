import { Extension, Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageNodeView } from "./ImageNodeView";

export type ImageAlign = "left" | "center" | "right";

/** Inline styles for a sized / aligned image in the saved HTML. */
function imageStyle(width: number | null, align: ImageAlign | null): string {
  const parts: string[] = [];
  if (width) parts.push(`width:${width}%`);
  if (align === "left") parts.push("margin-left:0", "margin-right:auto");
  if (align === "right") parts.push("margin-left:auto", "margin-right:0");
  if (align === "center") parts.push("margin-left:auto", "margin-right:auto");
  return parts.join(";");
}

/**
 * Inline image node for the WYSIWYG editor. Stores a plain <img> (with inline
 * width / alignment styles) so the public blog/page renderers, which inject the
 * saved HTML, display it exactly as sized in the editor.
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
      // Percentage of the content column; null = natural size (capped at 100%).
      width: {
        default: null,
        parseHTML: (el) => {
          const raw = el.getAttribute("data-width") || el.style.width.match(/^(\d+(?:\.\d+)?)%$/)?.[1];
          const n = raw ? Math.round(Number(raw)) : NaN;
          return n >= 10 && n <= 100 ? n : null;
        },
        renderHTML: () => ({}),
      },
      align: {
        default: null,
        parseHTML: (el) => {
          const a = el.getAttribute("data-align");
          return a === "left" || a === "center" || a === "right" ? a : null;
        },
        renderHTML: () => ({}),
      },
    };
  },
  parseHTML() {
    return [{ tag: "img[src]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const { width, align } = node.attrs as { width: number | null; align: ImageAlign | null };
    const style = imageStyle(width, align);
    return [
      "img",
      mergeAttributes(HTMLAttributes, {
        loading: "lazy",
        ...(width ? { "data-width": String(width) } : {}),
        ...(align ? { "data-align": align } : {}),
        ...(style ? { style } : {}),
      }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

export type TextAlign = "left" | "center" | "right" | "justify";
const TEXT_ALIGNS: TextAlign[] = ["left", "center", "right", "justify"];

/** Line-spacing presets offered in the toolbar (CSS line-height values). */
export const LINE_HEIGHTS = [
  { value: "1.3", label: "Compact" },
  { value: "2", label: "Relaxed" },
  { value: "2.5", label: "Double" },
] as const;
const LINE_HEIGHT_VALUES: string[] = LINE_HEIGHTS.map((l) => l.value);

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockFormatting: {
      setTextAlign: (align: TextAlign | null) => ReturnType;
      setLineHeight: (lineHeight: string | null) => ReturnType;
    };
  }
}

const FORMATTED_BLOCKS = ["paragraph", "heading"];

/**
 * Paragraph-level formatting: text alignment and line spacing, stored as
 * inline styles on <p>/<h2>/<h3> so they carry over to the public pages.
 */
export const BlockFormatting = Extension.create({
  name: "blockFormatting",
  addGlobalAttributes() {
    return [
      {
        types: FORMATTED_BLOCKS,
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (el) => {
              const a = el.style.textAlign as TextAlign;
              return TEXT_ALIGNS.includes(a) ? a : null;
            },
            renderHTML: (attrs) => (attrs.textAlign ? { style: `text-align:${attrs.textAlign}` } : {}),
          },
          lineHeight: {
            default: null,
            // Only keep our presets — pasted Google Docs / Word line-heights are dropped.
            parseHTML: (el) => (LINE_HEIGHT_VALUES.includes(el.style.lineHeight) ? el.style.lineHeight : null),
            renderHTML: (attrs) => (attrs.lineHeight ? { style: `line-height:${attrs.lineHeight}` } : {}),
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setTextAlign:
        (align) =>
        ({ commands }) =>
          FORMATTED_BLOCKS.map((type) => commands.updateAttributes(type, { textAlign: align })).some(Boolean),
      setLineHeight:
        (lineHeight) =>
        ({ commands }) =>
          FORMATTED_BLOCKS.map((type) => commands.updateAttributes(type, { lineHeight })).some(Boolean),
    };
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
