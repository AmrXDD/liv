import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/admin/ui";
import {
  getManifestByPage,
  getOverride,
  loadOverrides,
  upsertContent,
  deleteContent,
  subscribeOverrides,
  type ContentEntry,
  type ElementType,
} from "@/lib/content";

const ELEMENT_LABELS: Record<ElementType, string> = {
  title: "Titles",
  paragraph: "Paragraphs",
  card: "Card text",
  button: "Button labels",
  text: "Other text",
};

const ELEMENT_ORDER: ElementType[] = ["title", "paragraph", "card", "button", "text"];

function prettyPageLabel(slug: string): string {
  if (slug === "home") return "Home";
  if (slug === "global") return "Global (nav, footer, CTAs)";
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

interface Draft {
  en: string;
  ar: string;
}

export function AdminPageTextPage() {
  const { slug = "home" } = useParams<{ slug: string }>();

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [overridesLoaded, setOverridesLoaded] = useState(false);
  const [filter, setFilter] = useState("");
  const [activeType, setActiveType] = useState<ElementType | "all">("all");

  // Pull manifest entries for this page slug
  const entries = useMemo<ContentEntry[]>(() => {
    const grouped = getManifestByPage();
    return grouped[slug] ?? [];
  }, [slug]);

  // Make sure overrides are loaded; refresh state when they change
  useEffect(() => {
    void loadOverrides().then(() => setOverridesLoaded(true));
    return subscribeOverrides(() => setOverridesLoaded((v) => !v));
  }, []);

  const grouped = useMemo(() => {
    const out: Record<ElementType, ContentEntry[]> = {
      title: [],
      paragraph: [],
      card: [],
      button: [],
      text: [],
    };
    const q = filter.trim().toLowerCase();
    for (const e of entries) {
      if (q && !`${e.contentKey} ${e.defaultEn}`.toLowerCase().includes(q)) continue;
      if (activeType !== "all" && e.elementType !== activeType) continue;
      out[e.elementType].push(e);
    }
    return out;
  }, [entries, filter, activeType]);

  const totalCount = entries.length;
  const filteredCount = ELEMENT_ORDER.reduce((n, t) => n + grouped[t].length, 0);

  if (entries.length === 0) {
    return (
      <>
        <PageHeader title={`Edit text · ${prettyPageLabel(slug)}`}>
          <Link to="/admin/pages" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back to pages
          </Link>
        </PageHeader>
        <Card>
          <p className="text-sm text-ink-muted">
            No editable text registered for this page yet.
          </p>
        </Card>
      </>
    );
  }

  const draftFor = (e: ContentEntry): Draft => {
    const existing = drafts[e.contentKey];
    if (existing) return existing;
    const enOverride = getOverride(e.contentKey, "en");
    const arOverride = getOverride(e.contentKey, "ar");
    return {
      en: enOverride ?? e.defaultEn,
      ar: arOverride ?? e.defaultAr,
    };
  };

  const isDirty = (e: ContentEntry, d: Draft): boolean => {
    const enOverride = getOverride(e.contentKey, "en");
    const arOverride = getOverride(e.contentKey, "ar");
    const baselineEn = enOverride ?? e.defaultEn;
    const baselineAr = arOverride ?? e.defaultAr;
    return d.en !== baselineEn || d.ar !== baselineAr;
  };

  const onChange = (e: ContentEntry, next: Partial<Draft>) => {
    setDrafts((prev) => ({
      ...prev,
      [e.contentKey]: { ...draftFor(e), ...next },
    }));
  };

  const onSave = async (e: ContentEntry) => {
    const d = draftFor(e);
    setSavingKey(e.contentKey);
    try {
      await upsertContent([
        {
          content_key: e.contentKey,
          page_slug: e.pageSlug,
          element_type: e.elementType,
          value_en: d.en,
          value_ar: d.ar,
          description: null,
        },
      ]);
      // Clear dirty state
      setDrafts((prev) => {
        const { [e.contentKey]: _, ...rest } = prev;
        return rest;
      });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingKey(null);
    }
  };

  const onReset = async (e: ContentEntry) => {
    if (!confirm("Reset to default? This deletes the saved override.")) return;
    setSavingKey(e.contentKey);
    try {
      await deleteContent(e.contentKey);
      setDrafts((prev) => {
        const { [e.contentKey]: _, ...rest } = prev;
        return rest;
      });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingKey(null);
    }
  };

  const onSaveAllDirty = async () => {
    const dirtyEntries = entries.filter((e) => {
      const d = drafts[e.contentKey];
      return d && isDirty(e, d);
    });
    if (dirtyEntries.length === 0) return;
    setSavingKey("__bulk__");
    try {
      await upsertContent(
        dirtyEntries.map((e) => {
          const d = drafts[e.contentKey];
          return {
            content_key: e.contentKey,
            page_slug: e.pageSlug,
            element_type: e.elementType,
            value_en: d.en,
            value_ar: d.ar,
            description: null,
          };
        })
      );
      setDrafts({});
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingKey(null);
    }
  };

  const dirtyCount = entries.filter((e) => {
    const d = drafts[e.contentKey];
    return d && isDirty(e, d);
  }).length;

  return (
    <>
      <PageHeader
        title={`Edit text · ${prettyPageLabel(slug)}`}
        description={`${totalCount} text element${totalCount === 1 ? "" : "s"} on this page · only text values are editable; layout and structure are locked.`}
      >
        <Link
          to="/admin/pages"
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm hover:bg-bone-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back to pages
        </Link>
        <Btn
          variant="primary"
          loading={savingKey === "__bulk__"}
          disabled={dirtyCount === 0 || !!savingKey}
          onClick={onSaveAllDirty}
        >
          <Save className="h-4 w-4" />
          Save all{dirtyCount ? ` (${dirtyCount})` : ""}
        </Btn>
      </PageHeader>

      <Card className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.currentTarget.value)}
          placeholder="Search text…"
          className="min-w-[200px] flex-1 rounded-2xl border border-ink/10 bg-surface-base px-4 py-2.5 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
        />
        <div className="flex flex-wrap gap-2">
          <FilterChip label={`All (${totalCount})`} active={activeType === "all"} onClick={() => setActiveType("all")} />
          {ELEMENT_ORDER.map((t) => {
            const count = entries.filter((e) => e.elementType === t).length;
            if (count === 0) return null;
            return (
              <FilterChip
                key={t}
                label={`${ELEMENT_LABELS[t]} (${count})`}
                active={activeType === t}
                onClick={() => setActiveType(t)}
              />
            );
          })}
        </div>
        <span className="ml-auto text-xs text-ink-muted">
          {!overridesLoaded ? "Loading overrides…" : `${filteredCount} shown`}
        </span>
      </Card>

      <div className="space-y-8">
        {ELEMENT_ORDER.map((type) => {
          const list = grouped[type];
          if (list.length === 0) return null;
          return (
            <section key={type}>
              <h2 className="display-serif text-2xl tracking-tight mb-4">
                {ELEMENT_LABELS[type]}
                <span className="ml-3 text-sm font-normal text-ink-muted">{list.length}</span>
              </h2>
              <div className="space-y-3">
                {list.map((e) => {
                  const d = draftFor(e);
                  const dirty = isDirty(e, d);
                  const hasOverride =
                    getOverride(e.contentKey, "en") !== null ||
                    getOverride(e.contentKey, "ar") !== null;
                  return (
                    <Card key={e.contentKey} className="!p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-mono text-xs text-ink-muted truncate">
                            {e.contentKey}
                          </div>
                          <div className="text-eyebrow uppercase text-forest-700 mt-0.5">
                            {ELEMENT_LABELS[e.elementType]}
                            {hasOverride && (
                              <span className="ms-2 rounded-full bg-coral-100 px-2 py-0.5 text-coral-700">
                                Overridden
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasOverride && (
                            <button
                              type="button"
                              onClick={() => onReset(e)}
                              disabled={savingKey === e.contentKey}
                              className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs hover:bg-bone-100"
                              title="Reset to default"
                            >
                              <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                          )}
                          <Btn
                            size="sm"
                            variant={dirty ? "primary" : "subtle"}
                            disabled={!dirty || !!savingKey}
                            loading={savingKey === e.contentKey}
                            onClick={() => onSave(e)}
                          >
                            <Save className="h-3.5 w-3.5" /> Save
                          </Btn>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <LangField
                          dir="ltr"
                          label="English"
                          value={d.en}
                          defaultValue={e.defaultEn}
                          onChange={(en) => onChange(e, { en })}
                        />
                        <LangField
                          dir="rtl"
                          label="العربية"
                          value={d.ar}
                          defaultValue={e.defaultAr}
                          onChange={(ar) => onChange(e, { ar })}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1.5 text-xs transition-colors " +
        (active
          ? "border-forest-500 bg-forest-500 text-bone-50"
          : "border-ink/10 bg-bone-100 text-ink hover:bg-bone-200")
      }
    >
      {label}
    </button>
  );
}

function LangField({
  dir,
  label,
  value,
  defaultValue,
  onChange,
}: {
  dir: "ltr" | "rtl";
  label: string;
  value: string;
  defaultValue: string;
  onChange: (v: string) => void;
}) {
  const isLong = (defaultValue?.length ?? 0) > 80 || /\n/.test(defaultValue ?? "");
  const baseClass =
    "w-full rounded-2xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20";
  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wider text-ink-muted">{label}</div>
      {isLong ? (
        <textarea
          dir={dir}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          className={`${baseClass} min-h-[88px] resize-y`}
        />
      ) : (
        <input
          dir={dir}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          className={baseClass}
        />
      )}
    </div>
  );
}
