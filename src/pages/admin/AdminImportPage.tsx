import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/admin/ui";
import {
  importFromShopify,
  SHOPIFY_DOMAIN,
  type ImportResult,
  type ImportProgress,
} from "@/lib/shopifyImport";

export function AdminImportPage() {
  const qc = useQueryClient();
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<ImportProgress[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>("");

  const onRun = async () => {
    if (
      !confirm(
        `This will pull all products + collections from ${SHOPIFY_DOMAIN} into Supabase, ` +
          `overwriting any rows with the same slug. Continue?`
      )
    )
      return;
    setRunning(true);
    setLog([]);
    setResult(null);
    setError("");
    try {
      const res = await importFromShopify((p) => setLog((prev) => [...prev, p]));
      setResult(res);
      qc.invalidateQueries();
    } catch (err) {
      console.error(err);
      // Be defensive — Supabase errors are plain objects, not Error instances,
      // and an empty toString gives "[object Object]". Surface every useful field.
      let msg = "";
      if (err instanceof Error) {
        msg = err.message;
      } else if (err && typeof err === "object") {
        const e = err as Record<string, unknown>;
        msg =
          (e.message as string) ||
          (e.details as string) ||
          (e.hint as string) ||
          JSON.stringify(e, null, 2);
      } else {
        msg = String(err);
      }
      setError(msg);
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Import from Shopify"
        description={`Mirror products & collections from ${SHOPIFY_DOMAIN} into your Supabase store.`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-forest-500 text-bone-50">
                <Download className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="display-serif text-2xl">One-click import</h2>
                <p className="mt-2 text-sm text-ink-muted">
                  Pulls every product (title, description, price, images, tags) and every
                  collection (title, description, cover image, product order) directly from the
                  public Shopify storefront JSON. Images stay on Shopify's CDN — no upload step.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-ink-muted">
                  <li>• Existing rows are matched by <code className="rounded bg-bone-100 px-1">slug</code> and overwritten.</li>
                  <li>• Products are auto-categorized as <code className="rounded bg-bone-100 px-1">diy</code> or <code className="rounded bg-bone-100 px-1">coaching</code> from tags + collections.</li>
                  <li>• Arabic fields are seeded with the English text — translate them in the product editor.</li>
                  <li>• Collection ↔ product links are rebuilt from scratch each run.</li>
                </ul>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Btn variant="primary" onClick={onRun} loading={running} disabled={running}>
                    {running ? "Importing…" : "Import everything now"}
                  </Btn>
                  <a
                    href={`https://${SHOPIFY_DOMAIN}/products.json`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink"
                  >
                    Source feed <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {(log.length > 0 || error) && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-muted">
                Activity
              </h3>
              <ol className="space-y-1.5 font-mono text-xs">
                {log.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-ink-muted">{String(i + 1).padStart(2, "0")}.</span>
                    <span>
                      {line.step}
                      {line.detail && <span className="text-ink-muted"> — {line.detail}</span>}
                    </span>
                  </li>
                ))}
                {running && <li className="text-forest-700">running…</li>}
              </ol>
              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-coral-50 p-3 text-sm text-coral-700">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 translate-y-0.5" />
                  <div>
                    <div className="font-semibold">Import failed</div>
                    <div className="mt-0.5 break-all text-xs">{error}</div>
                    <div className="mt-2 text-xs">
                      If this is a CORS error from Shopify, run the import from the same browser
                      session you're already authenticated in to Supabase. The fallback is to
                      paste the JSON manually into a server-side seed script.
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {result && (
            <Card className="border-forest-500/30 bg-forest-50">
              <div className="flex items-center gap-2 text-forest-800">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Done</span>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Products imported" value={String(result.productsImported)} />
                <Row label="Collections imported" value={String(result.collectionsImported)} />
                <Row label="Product ↔ collection links" value={String(result.links)} />
              </dl>
            </Card>
          )}

          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Source store
            </h3>
            <div className="mt-2 break-all text-sm">{SHOPIFY_DOMAIN}</div>
            <div className="mt-3 text-xs text-ink-muted">
              Change the source domain by editing
              <code className="mx-1 rounded bg-bone-100 px-1.5 py-0.5">SHOPIFY_DOMAIN</code>
              in <code className="rounded bg-bone-100 px-1.5 py-0.5">src/lib/shopifyImport.ts</code>.
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="display-serif text-2xl text-forest-700">{value}</dd>
    </div>
  );
}
