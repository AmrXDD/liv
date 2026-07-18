import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Loader2, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bucket } from "@/lib/storage";
import { uploadImage, uploadImages, uploadFile, deleteByPublicUrl } from "@/lib/storage";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display-serif text-3xl tracking-tightest">{title}</h1>
        {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-3xl border border-ink/10 bg-surface-raised p-6 md:p-8", className)}>
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}

const inputBase =
  "w-full rounded-2xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20 placeholder:text-ink-muted/60";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(inputBase, "min-h-[100px] resize-y", props.className)}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputBase, "appearance-none", props.className)} />;
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "subtle";
  size?: "sm" | "md";
  loading?: boolean;
}

export function Btn({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }: BtnProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-5 py-2.5 text-sm" };
  const variants = {
    primary: "bg-forest-500 text-bone-50 hover:bg-forest-600 disabled:opacity-60",
    ghost: "border border-ink/15 text-ink hover:bg-ink hover:text-bone-50 hover:border-ink",
    danger: "bg-coral-500 text-bone-50 hover:bg-coral-600",
    subtle: "bg-bone-100 text-ink hover:bg-bone-200",
  };
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(base, sizes[size], variants[variant], className)}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

// ---- Bilingual text input ----
export function BilingualField({
  label,
  valueEn,
  valueAr,
  onChange,
  required,
  textarea,
}: {
  label: string;
  valueEn: string;
  valueAr: string;
  onChange: (next: { en: string; ar: string }) => void;
  required?: boolean;
  textarea?: boolean;
}) {
  const Cmp = textarea ? Textarea : Input;
  return (
    <div>
      <div className="mb-2 text-sm font-medium">{label}</div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="mb-1 text-xs uppercase tracking-wider text-ink-muted">English</div>
          <Cmp
            required={required}
            value={valueEn}
            onChange={(e) => onChange({ en: e.currentTarget.value, ar: valueAr })}
          />
        </div>
        <div>
          <div className="mb-1 text-xs uppercase tracking-wider text-ink-muted">العربية</div>
          <Cmp
            required={required}
            dir="rtl"
            value={valueAr}
            onChange={(e) => onChange({ en: valueEn, ar: e.currentTarget.value })}
          />
        </div>
      </div>
    </div>
  );
}

// ---- Image uploader ----
export function ImageUploader({
  value,
  onChange,
  bucket,
  prefix,
  label = "Image",
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
  bucket: Bucket;
  prefix?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file, bucket, prefix);
      onChange(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert("Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-2 text-sm font-medium">{label}</div>
      {value ? (
        <div className="relative inline-block overflow-hidden rounded-2xl border border-ink/10">
          <img src={value} alt="" className="h-40 w-64 object-cover" />
          <button
            type="button"
            onClick={async () => {
              await deleteByPublicUrl(value, bucket);
              onChange(undefined);
            }}
            className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-ink/80 text-bone-50 hover:bg-coral-500"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/20 text-sm text-ink-muted hover:border-forest-500 hover:text-forest-700"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          {busy ? "Uploading…" : "Upload image"}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
}

// ---- File uploader (PDFs, zips, etc.) ----
export function FileUploader({
  value,
  onChange,
  bucket,
  prefix,
  label = "File",
  accept = ".pdf,.zip,.epub,.mp3,.mp4",
  hint,
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
  bucket: Bucket;
  prefix?: string;
  label?: string;
  accept?: string;
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadFile(file, bucket, prefix);
      onChange(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert("Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-2 text-sm font-medium">{label}</div>
      {value ? (
        <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-surface-base px-4 py-3">
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="flex-1 truncate text-sm text-forest-700 underline-offset-2 hover:underline"
          >
            {value.split("/").pop() ?? value}
          </a>
          <button
            type="button"
            onClick={async () => {
              await deleteByPublicUrl(value, bucket);
              onChange(undefined);
            }}
            className="grid h-8 w-8 place-items-center rounded-full text-ink-muted hover:bg-coral-100 hover:text-coral-700"
            aria-label="Remove file"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-full max-w-md flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/20 text-sm text-ink-muted hover:border-forest-500 hover:text-forest-700"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          {busy ? "Uploading…" : "Upload file"}
        </button>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onFile} />
      {hint && <p className="mt-2 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

// ---- Multi image uploader ----
export function MultiImageUploader({
  value,
  onChange,
  bucket,
  prefix,
  label = "Gallery",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket: Bucket;
  prefix?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const urls = await uploadImages(files, bucket, prefix);
      onChange([...value, ...urls]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert("Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-2 text-sm font-medium">{label}</div>
      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div key={url} className="relative overflow-hidden rounded-xl border border-ink/10">
            <img src={url} alt="" className="h-24 w-24 object-cover" />
            <button
              type="button"
              onClick={async () => {
                await deleteByPublicUrl(url, bucket);
                onChange(value.filter((u) => u !== url));
              }}
              className="absolute end-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/80 text-bone-50 hover:bg-coral-500"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="grid h-24 w-24 place-items-center rounded-xl border border-dashed border-ink/20 text-ink-muted hover:border-forest-500 hover:text-forest-700"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
    </div>
  );
}

// ---- Locale list editor ([{en, ar}]) ----
export function LocaleListEditor({
  label,
  value,
  onChange,
  placeholder = "Add item",
}: {
  label: string;
  value: { en: string; ar: string }[];
  onChange: (next: { en: string; ar: string }[]) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">{label}</div>
        <Btn
          type="button"
          variant="subtle"
          size="sm"
          onClick={() => onChange([...value, { en: "", ar: "" }])}
        >
          + Add
        </Btn>
      </div>
      <div className="space-y-2">
        {value.length === 0 && (
          <div className="rounded-xl border border-dashed border-ink/15 px-4 py-3 text-xs text-ink-muted">
            None yet.
          </div>
        )}
        {value.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Input
              placeholder={`${placeholder} (EN)`}
              value={row.en}
              onChange={(e) => {
                const next = [...value];
                next[i] = { ...row, en: e.currentTarget.value };
                onChange(next);
              }}
            />
            <Input
              dir="rtl"
              placeholder={`${placeholder} (AR)`}
              value={row.ar}
              onChange={(e) => {
                const next = [...value];
                next[i] = { ...row, ar: e.currentTarget.value };
                onChange(next);
              }}
            />
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-xl border border-ink/10 text-ink-muted hover:bg-coral-100 hover:text-coral-700"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Toggle ----
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-3">
      <span
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-forest-500" : "bg-ink/15"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-bone-50 transition-all",
            checked ? "start-[1.4rem]" : "start-0.5"
          )}
        />
      </span>
      <span className="text-sm font-medium">{label}</span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
      />
    </label>
  );
}
