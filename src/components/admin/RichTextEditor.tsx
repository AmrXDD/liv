import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Undo2,
  Redo2,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  minHeight?: number;
}

/**
 * Bilingual-safe WYSIWYG editor. Stores HTML in `value`. The `dir` prop sets
 * the visual direction so Arabic content renders right-to-left.
 */
export function RichTextEditor({ value, onChange, placeholder, dir = "ltr", minHeight = 180 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Write something…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        dir,
        class:
          "prose prose-sm max-w-none focus:outline-none px-4 py-3 min-h-[var(--rte-min)] [&_a]:text-forest-700 [&_a]:underline",
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
          class:
            "prose prose-sm max-w-none focus:outline-none px-4 py-3 min-h-[var(--rte-min)] [&_a]:text-forest-700 [&_a]:underline",
          style: `--rte-min: ${minHeight}px;`,
        },
      },
    });
  }, [editor, dir, minHeight]);

  if (!editor) return null;

  return (
    <div className="rounded-2xl border border-ink/10 bg-surface-base focus-within:border-forest-500 focus-within:ring-2 focus-within:ring-forest-500/20">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const raw = window.prompt("Hyperlink URL (leave blank to remove)", prev ?? "https://");
    if (raw === null) return;
    const url = raw.trim();
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    // Reject unsafe schemes; auto-prefix bare domains so /blog renders <a> safely.
    if (/^\s*javascript:/i.test(url) || /^\s*data:/i.test(url) || /^\s*vbscript:/i.test(url)) {
      window.alert("That URL scheme isn't allowed.");
      return;
    }
    const safe = /^(https?:|mailto:|tel:|\/|#)/i.test(url) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: safe }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 px-2 py-1.5">
      <ToolbarBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} aria="Bold">
        <Bold className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} aria="Italic">
        <Italic className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria="Heading 2"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        aria="Heading 3"
      >
        <Heading3 className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} aria="Bullet list">
        <List className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria="Numbered list">
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} aria="Quote">
        <Quote className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive("link")} onClick={setLink} aria="Hyperlink">
        <LinkIcon className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <div className="mx-1 h-5 w-px bg-ink/10" />
      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} aria="Undo">
        <Undo2 className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} aria="Redo">
        <Redo2 className="h-3.5 w-3.5" />
      </ToolbarBtn>
    </div>
  );
}

function ToolbarBtn({
  active,
  onClick,
  aria,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  aria: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      title={aria}
      className={
        "grid h-7 w-7 place-items-center rounded-md transition-colors " +
        (active ? "bg-forest-500 text-bone-50" : "text-ink hover:bg-bone-100")
      }
    >
      {children}
    </button>
  );
}
