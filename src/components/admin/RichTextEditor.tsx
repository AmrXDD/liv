import { useEffect, useRef, useState } from "react";
import { useEditor, useEditorState, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Film,
  MousePointerClick,
  Loader2,
  RemoveFormatting,
  Undo2,
  Redo2,
} from "lucide-react";
import {
  BlockFormatting,
  CtaButton,
  InlineImage,
  LINE_HEIGHTS,
  MediaEmbed,
  normalizeLinkUrl,
  resolveMediaUrl,
  type TextAlign,
} from "./editorExtensions";
import { uploadImage, type Bucket } from "@/lib/storage";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  minHeight?: number;
  /** Storage bucket for images inserted into the body. Defaults to blog images. */
  imageBucket?: Bucket;
}

const editorClass = "rich-content text-[15px] max-w-none focus:outline-none px-4 py-3 min-h-[var(--rte-min)] [&_a]:text-forest-700 [&_a]:underline";

/**
 * Bilingual-safe WYSIWYG editor. Stores HTML in `value`. The `dir` prop sets
 * the visual direction so Arabic content renders right-to-left.
 *
 * Enter starts a new paragraph (press it twice for a blank line), Shift+Enter
 * breaks the line inside the same paragraph.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  dir = "ltr",
  minHeight = 180,
  imageBucket = "blog-images",
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Write something…" }),
      BlockFormatting,
      InlineImage,
      MediaEmbed,
      CtaButton,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        dir,
        class: editorClass,
        style: `--rte-min: ${minHeight}px;`,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep editor in sync if `value` changes externally (e.g. resetting forms)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        attributes: {
          dir,
          class: editorClass,
          style: `--rte-min: ${minHeight}px;`,
        },
      },
    });
  }, [editor, dir, minHeight]);

  if (!editor) return null;

  return (
    <div className="rounded-2xl border border-ink/10 bg-surface-base focus-within:border-forest-500 focus-within:ring-2 focus-within:ring-forest-500/20">
      <Toolbar editor={editor} imageBucket={imageBucket} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor, imageBucket }: { editor: Editor; imageBucket: Bucket }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // The editor doesn't re-render React on every transaction, so subscribe to
  // the bits the toolbar shows as "active".
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const block = e.isActive("heading", { level: 2 })
        ? "h2"
        : e.isActive("heading", { level: 3 })
          ? "h3"
          : "p";
      const blockAttrs = e.getAttributes(block === "p" ? "paragraph" : "heading");
      return {
        block,
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        underline: e.isActive("underline"),
        strike: e.isActive("strike"),
        bulletList: e.isActive("bulletList"),
        orderedList: e.isActive("orderedList"),
        blockquote: e.isActive("blockquote"),
        link: e.isActive("link"),
        textAlign: (blockAttrs.textAlign as TextAlign | null) ?? null,
        lineHeight: (blockAttrs.lineHeight as string | null) ?? "",
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
      };
    },
  });

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, imageBucket, "inline");
      editor.chain().focus().insertContent({ type: "image", attrs: { src: url, alt: "" } }).run();
    } catch (err) {
      window.alert(`Image upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  const insertVideo = () => {
    const raw = window.prompt(
      "Paste a video link (YouTube, Vimeo, Instagram, or a direct .mp4 URL)",
      "https://"
    );
    if (raw === null) return;
    const media = resolveMediaUrl(raw);
    if (!media) {
      window.alert(
        "Couldn't recognise that link. Use a YouTube, Vimeo, Instagram, or direct video (.mp4) URL."
      );
      return;
    }
    editor.chain().focus().insertContent({ type: "mediaEmbed", attrs: media }).run();
  };

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const raw = window.prompt("Hyperlink URL (leave blank to remove)", prev ?? "https://");
    if (raw === null) return;
    const url = raw.trim();
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const safe = normalizeLinkUrl(url);
    if (safe === null) {
      window.alert("That URL scheme isn't allowed.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: safe }).run();
  };

  const insertButton = () => {
    const text = window.prompt("Button text", "Buy the book →");
    if (text === null || !text.trim()) return;
    const raw = window.prompt("Where should the button go? (e.g. https://… or /shop)", "https://");
    if (raw === null) return;
    const href = raw.trim() && raw.trim() !== "https://" ? normalizeLinkUrl(raw) : "";
    if (href === null) {
      window.alert("That URL scheme isn't allowed.");
      return;
    }
    editor.chain().focus().insertContent({ type: "ctaButton", attrs: { text: text.trim(), href } }).run();
  };

  const setBlock = (block: string) => {
    const chain = editor.chain().focus();
    if (block === "h2") chain.setHeading({ level: 2 }).run();
    else if (block === "h3") chain.setHeading({ level: 3 }).run();
    else chain.setParagraph().run();
  };

  const toggleAlign = (align: TextAlign) =>
    editor.chain().focus().setTextAlign(state?.textAlign === align ? null : align).run();

  const aligns: { value: TextAlign; label: string; icon: typeof AlignLeft }[] = [
    { value: "left", label: "Align left", icon: AlignLeft },
    { value: "center", label: "Align center", icon: AlignCenter },
    { value: "right", label: "Align right", icon: AlignRight },
    { value: "justify", label: "Justify", icon: AlignJustify },
  ];

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-2xl border-b border-ink/10 bg-surface-base px-2 py-1.5">
      <ToolbarSelect
        aria="Text style"
        value={state?.block ?? "p"}
        onChange={setBlock}
        options={[
          { value: "p", label: "Paragraph" },
          { value: "h2", label: "Heading" },
          { value: "h3", label: "Subheading" },
        ]}
      />
      <Divider />
      <ToolbarBtn active={state?.bold} onClick={() => editor.chain().focus().toggleBold().run()} aria="Bold (Ctrl+B)">
        <Bold className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={state?.italic} onClick={() => editor.chain().focus().toggleItalic().run()} aria="Italic (Ctrl+I)">
        <Italic className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={state?.underline} onClick={() => editor.chain().focus().toggleUnderline().run()} aria="Underline (Ctrl+U)">
        <Underline className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={state?.strike} onClick={() => editor.chain().focus().toggleStrike().run()} aria="Strikethrough">
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={state?.link} onClick={setLink} aria="Hyperlink">
        <LinkIcon className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <Divider />
      {aligns.map(({ value, label, icon: Icon }) => (
        <ToolbarBtn key={value} active={state?.textAlign === value} onClick={() => toggleAlign(value)} aria={label}>
          <Icon className="h-3.5 w-3.5" />
        </ToolbarBtn>
      ))}
      <ToolbarSelect
        aria="Line spacing"
        value={state?.lineHeight ?? ""}
        onChange={(v) => editor.chain().focus().setLineHeight(v || null).run()}
        options={[{ value: "", label: "Line spacing: Normal" }, ...LINE_HEIGHTS.map((l) => ({ value: l.value, label: `Line spacing: ${l.label}` }))]}
      />
      <Divider />
      <ToolbarBtn active={state?.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()} aria="Bullet list">
        <List className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={state?.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria="Numbered list">
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={state?.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()} aria="Quote">
        <Quote className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} aria="Divider line">
        <Minus className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <Divider />
      <ToolbarBtn onClick={() => fileInput.current?.click()} aria="Insert image" disabled={uploading}>
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
      </ToolbarBtn>
      <ToolbarBtn onClick={insertVideo} aria="Insert video">
        <Film className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={insertButton} aria="Insert button (with link)">
        <MousePointerClick className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPickImage}
      />
      <Divider />
      <ToolbarBtn
        onClick={() => editor.chain().focus().unsetAllMarks().setTextAlign(null).setLineHeight(null).run()}
        aria="Clear formatting"
      >
        <RemoveFormatting className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} aria="Undo (Ctrl+Z)" disabled={!state?.canUndo}>
        <Undo2 className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} aria="Redo (Ctrl+Y)" disabled={!state?.canRedo}>
        <Redo2 className="h-3.5 w-3.5" />
      </ToolbarBtn>
    </div>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-ink/10" />;
}

function ToolbarSelect({
  aria,
  value,
  onChange,
  options,
}: {
  aria: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      aria-label={aria}
      title={aria}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      className="h-7 rounded-md border border-ink/10 bg-surface-raised px-1.5 text-xs font-medium text-ink hover:bg-bone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ToolbarBtn({
  active,
  onClick,
  aria,
  disabled,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  aria: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      aria-pressed={active}
      title={aria}
      className={
        "grid h-7 w-7 place-items-center rounded-md transition-colors disabled:opacity-40 " +
        (active ? "bg-forest-500 text-bone-50" : "text-ink hover:bg-bone-100")
      }
    >
      {children}
    </button>
  );
}
