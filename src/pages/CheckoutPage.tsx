import { useState } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Minus, Plus, Trash2, Lock, Truck, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { SEO } from "@/components/seo/SEO";
import { useCart } from "@/lib/cart";
import { getSupabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

const POPULAR_COUNTRIES = [
  { code: "KW", nameEn: "Kuwait", nameAr: "الكويت" },
  { code: "AE", nameEn: "United Arab Emirates", nameAr: "الإمارات العربية المتحدة" },
  { code: "SA", nameEn: "Saudi Arabia", nameAr: "المملكة العربية السعودية" },
  { code: "QA", nameEn: "Qatar", nameAr: "قطر" },
  { code: "BH", nameEn: "Bahrain", nameAr: "البحرين" },
  { code: "OM", nameEn: "Oman", nameAr: "عُمان" },
  { code: "US", nameEn: "United States", nameAr: "الولايات المتحدة" },
  { code: "GB", nameEn: "United Kingdom", nameAr: "المملكة المتحدة" },
  { code: "CA", nameEn: "Canada", nameAr: "كندا" },
  { code: "OTHER", nameEn: "Other Country", nameAr: "دولة أخرى" },
];

export function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const isAr = lang === "ar";
  const { items, subtotal, currency, hasPhysical, updateQty, removeItem } = useCart();

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const prefillEmail =
    (location.state as { email?: string } | null)?.email ??
    searchParams.get("email") ??
    "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState(prefillEmail);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Shipping Address state for physical items
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [countryCode, setCountryCode] = useState("KW");
  const [customCountry, setCustomCountry] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "err">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (items.length === 0) {
    return <Navigate to="/" replace />;
  }

  // Stock verification across current cart items
  const hasOutOfStock = items.some(
    (item) => item.stock != null && item.stock <= 0
  );
  const hasStockExceeded = items.some(
    (item) => item.stock != null && item.qty > item.stock
  );

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    if (hasOutOfStock || hasStockExceeded) {
      setStatus("err");
      setErrorMsg(
        isAr
          ? "يرجى تعديل الكميات أو إزالة المنتجات غير المتوفرة للمتابعة."
          : "Please adjust quantities or remove out-of-stock items to continue."
      );
      return;
    }

    const sb = getSupabase();
    if (!sb) {
      setStatus("err");
      setErrorMsg("Payment is not configured. Please try again later.");
      return;
    }

    const resolvedCountry =
      countryCode === "OTHER"
        ? customCountry.trim()
        : countryCode;

    if (hasPhysical) {
      if (!line1.trim() || !city.trim() || !resolvedCountry) {
        setStatus("err");
        setErrorMsg(
          isAr
            ? "يرجى إكمال عنوان الشحن (الشارع، المدينة، الدولة)."
            : "Please complete your shipping address (Street, City, Country)."
        );
        return;
      }
    }

    try {
      const { data, error } = await sb.functions.invoke<{
        url: string;
        session_id: string;
        order_id: string;
      }>("create-checkout-session", {
        body: {
          email,
          name,
          phone: phone || undefined,
          notes: notes || undefined,
          locale: lang,
          shipping_address: hasPhysical
            ? {
                line1: line1.trim(),
                line2: line2.trim() || undefined,
                city: city.trim(),
                state: state.trim() || undefined,
                postal_code: postalCode.trim() || undefined,
                country: resolvedCountry,
              }
            : undefined,
          items: items.map((i) => ({ product_id: i.productId, qty: i.qty })),
        },
      });

      if (error) {
        // FunctionsHttpError hides the server message in error.context (a Response)
        const ctx = (error as { context?: Response }).context;
        let serverMsg = error.message;
        if (ctx && typeof ctx.json === "function") {
          try {
            const body = await ctx.json();
            if (body?.error) serverMsg = body.error;
          } catch {
            /* ignore */
          }
        }
        throw new Error(serverMsg);
      }
      if (!data?.url) throw new Error("No checkout URL returned");

      // Hand off to Stripe Checkout. Cart stays untouched until webhook confirms.
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Order failed.");
      setStatus("err");
    }
  };

  return (
    <>
      <SEO title="Checkout" description="Complete your order" path="/checkout" />
      <Section variant="default" pad="md" className="bg-editorial">
        <Container>
          <div className="mb-10">
            <div className="eyebrow mb-3">{isAr ? "الدفع والطلب" : "Checkout"}</div>
            <h1 className="display-serif text-display-lg tracking-tightest">
              {t("checkout.title", { defaultValue: isAr ? "مراجعة وتأكيد الطلب" : "Review and confirm" })}
            </h1>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <form onSubmit={placeOrder} className="lg:col-span-7 space-y-6">
              {/* Contact Details */}
              <div className="rounded-3xl border border-ink/10 bg-surface-raised p-6 md:p-8">
                <h2 className="display-serif text-2xl mb-6">
                  {isAr ? "معلومات التواصل" : "Contact details"}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={isAr ? "الاسم الكامل" : "Full name"} required>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      placeholder={isAr ? "سارة أحمد" : "Jane Doe"}
                    />
                  </Field>
                  <Field label={isAr ? "البريد الإلكتروني" : "Email"} required>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="name@example.com"
                    />
                  </Field>
                  <Field label={isAr ? "رقم الهاتف" : "Phone (optional)"} className="md:col-span-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                      placeholder="+965 ..."
                    />
                  </Field>
                </div>
              </div>

              {/* Shipping Address (Displayed when cart contains physical items) */}
              {hasPhysical && (
                <div className="rounded-3xl border border-ink/10 bg-surface-raised p-6 md:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-coral-100 text-coral-700">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="display-serif text-2xl">
                        {isAr ? "عنوان الشحن والتوصيل" : "Shipping address"}
                      </h2>
                      <p className="text-xs text-ink-muted">
                        {isAr
                          ? "يرجى كتابة عنوان التوصيل الفعلي لاستلام منتجاتك."
                          : "Where should we deliver your physical items?"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label={isAr ? "الدولة / البلد" : "Country"} required className="md:col-span-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className={inputClass}
                      >
                        {POPULAR_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {isAr ? c.nameAr : c.nameEn}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {countryCode === "OTHER" && (
                      <Field label={isAr ? "اسم الدولة" : "Country name"} required className="md:col-span-2">
                        <input
                          type="text"
                          required
                          value={customCountry}
                          onChange={(e) => setCustomCountry(e.target.value)}
                          className={inputClass}
                          placeholder={isAr ? "اكتب اسم دولتك" : "Enter your country name"}
                        />
                      </Field>
                    )}

                    <Field label={isAr ? "عنوان الشارع / المنطقة / القطعة" : "Street address"} required className="md:col-span-2">
                      <input
                        type="text"
                        required
                        value={line1}
                        onChange={(e) => setLine1(e.target.value)}
                        className={inputClass}
                        placeholder={isAr ? "الشارع، القطعة، رقم المبنى أو المنزل" : "123 Main St, Building 4"}
                      />
                    </Field>

                    <Field label={isAr ? "الشقة / الجناح / الدور (اختياري)" : "Apartment, suite, unit (optional)"} className="md:col-span-2">
                      <input
                        type="text"
                        value={line2}
                        onChange={(e) => setLine2(e.target.value)}
                        className={inputClass}
                        placeholder={isAr ? "شقة 5، الدور الثاني" : "Apt 5B"}
                      />
                    </Field>

                    <Field label={isAr ? "المدينة" : "City"} required>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={inputClass}
                        placeholder={isAr ? "مدينة الكويت" : "City"}
                      />
                    </Field>

                    <Field label={isAr ? "المحافظة / الإمارة / المنطقة" : "State / Province / Region"}>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={inputClass}
                        placeholder={isAr ? "العاصمة" : "State"}
                      />
                    </Field>

                    <Field label={isAr ? "الرمز البريدي (إن وجد)" : "Postal / ZIP code (optional)"} className="md:col-span-2">
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className={inputClass}
                        placeholder="12345"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* Order Notes */}
              <div className="rounded-3xl border border-ink/10 bg-surface-raised p-6 md:p-8">
                <Field label={isAr ? "ملاحظات إضافية (اختياري)" : "Notes (optional)"}>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`${inputClass} resize-y`}
                    placeholder={
                      isAr
                        ? "أي تعليمات خاصة بالطلب أو التوصيل..."
                        : "Any special instructions or delivery details..."
                    }
                  />
                </Field>
              </div>

              {/* Payment Section */}
              <div className="rounded-3xl border border-ink/10 bg-surface-raised p-6 md:p-8">
                <h2 className="display-serif text-2xl mb-2">
                  {isAr ? "الدفع الآمن" : "Payment"}
                </h2>
                <p className="text-sm text-ink-muted mb-4">
                  {isAr
                    ? "يتم معالجة الدفع ببطاقات الائتمان بأمان تام عبر Stripe. سيتم توجيهك إلى صفحة الدفع الموثقة لإتمام العملية، ثم الرجوع لتأكيد طلبك."
                    : "Card payment is processed securely by Stripe. You'll be redirected to Stripe's hosted checkout to complete your purchase, then returned to a confirmation page."}
                </p>
                <div className="inline-flex items-center gap-2 rounded-xl bg-bone-100 px-4 py-3 text-xs text-ink-muted">
                  <Lock className="h-3.5 w-3.5" />
                  256-bit TLS · PCI DSS Level 1 (Stripe)
                </div>
              </div>

              {/* Error messages */}
              {status === "err" && (
                <div className="rounded-2xl bg-coral-100 p-4 text-sm text-coral-700 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{errorMsg || "Couldn't place order."}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                arrow
                className="w-full"
                disabled={status === "loading" || hasOutOfStock || hasStockExceeded}
              >
                {status === "loading"
                  ? isAr
                    ? "جاري التحويل إلى Stripe…"
                    : "Redirecting to Stripe…"
                  : isAr
                  ? "الدفع بواسطة البطاقة"
                  : "Pay with card"}
              </Button>
            </form>

            {/* Cart Summary Column */}
            <aside className="lg:col-span-5 lg:sticky lg:top-32 self-start">
              <div className="rounded-3xl border border-ink/10 bg-surface-raised p-6 md:p-8">
                <h2 className="display-serif text-2xl mb-6">
                  {isAr ? "ملخص السلة" : "Your cart"}
                </h2>
                <ul className="divide-y divide-ink/10">
                  {items.map((item) => {
                    const itemOutOfStock = item.stock != null && item.stock <= 0;
                    const itemExceeded = item.stock != null && item.qty > item.stock;

                    return (
                      <li key={item.productId} className="flex gap-4 py-4">
                        <div className="grid h-16 w-16 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-bone-100">
                          {item.image ? (
                            <img src={item.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="display-serif text-xl text-forest-700">
                              {item.title[lang]?.[0] ?? "P"}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-sm font-semibold leading-snug">
                              {item.title[lang]}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              aria-label="Remove"
                              className="text-ink-muted hover:text-coral-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {(itemOutOfStock || itemExceeded) && (
                            <div className="mt-1 text-xs text-coral-600 font-medium">
                              {itemOutOfStock
                                ? isAr
                                  ? "نفدت الكمية — يرجى حذف المنتج"
                                  : "Out of stock — please remove"
                                : isAr
                                ? `الكمية المتاحة: ${item.stock}`
                                : `Only ${item.stock} available`}
                            </div>
                          )}

                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="inline-flex items-center rounded-full border border-ink/10">
                              <button
                                type="button"
                                onClick={() => updateQty(item.productId, item.qty - 1)}
                                className="grid h-7 w-7 place-items-center hover:text-coral-600"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-medium">
                                {item.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQty(item.productId, item.qty + 1)}
                                disabled={item.stock != null && item.qty >= item.stock}
                                className="grid h-7 w-7 place-items-center hover:text-coral-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="text-sm font-semibold text-forest-700">
                              {formatPrice(item.price * item.qty, item.currency)}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 space-y-2 border-t border-ink/10 pt-4">
                  <Row label={isAr ? "المجموع الفرعي" : "Subtotal"} value={formatPrice(subtotal, currency)} />
                  <Row
                    label={isAr ? "الشحن والتوصيل" : "Shipping"}
                    value={hasPhysical ? (isAr ? "مجاني" : "Calculated") : "—"}
                  />
                  <Row
                    label={isAr ? "الإجمالي" : "Total"}
                    value={formatPrice(subtotal, currency)}
                    bold
                  />
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}

const inputClass =
  "w-full rounded-2xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20";

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-2 block text-sm font-medium">
        {label}
        {required && <span className="text-coral-600">*</span>}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? "font-semibold" : "text-ink-muted"}>{label}</span>
      <span className={bold ? "display-serif text-xl text-forest-700" : ""}>{value}</span>
    </div>
  );
}
