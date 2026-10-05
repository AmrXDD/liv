import { Link } from "@/lib/langRouting";
import { useTranslation } from "react-i18next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

type L = { en: string; ar: string };

/** [row label, Guided Reset cell, LIV Method Intensive cell] */
const ROWS: [L, L, L][] = [
  [
    { en: "Sessions", ar: "الجلسات" },
    {
      en: "60-min onboarding, then 2 calls a week of 15 min each",
      ar: "جلسة تعريفية 60 دقيقة، ثم مكالمتان أسبوعيًا مدة كل منهما 15 دقيقة",
    },
    {
      en: "Weekly 30-min 1:1 session, in person (Kuwait) or online",
      ar: "جلسة فردية أسبوعية 30 دقيقة، حضوريًا في الكويت أو عبر الإنترنت",
    },
  ],
  [
    { en: "WhatsApp access", ar: "التواصل عبر واتساب" },
    { en: "Group access", ar: "الانضمام إلى مجموعة واتساب" },
    { en: "Direct daily line", ar: "خط مباشر يوميًا" },
  ],
  [
    { en: "Glucose-data review", ar: "مراجعة بيانات الجلوكوز" },
    {
      en: "Monthly protocol adjustment from your CGM data, plus food-spike analysis from photos you send",
      ar: "تعديل شهري للبروتوكول بناءً على بيانات جهاز CGM، مع تحليل ارتفاعات السكر من صور وجباتك",
    },
    {
      en: "Continuous CGM monitoring with live dashboard analysis and real-time protocol changes",
      ar: "مراقبة مستمرة بجهاز CGM مع تحليل حيّ للوحة البيانات وتعديل البروتوكول لحظة الحاجة",
    },
  ],
  [
    { en: "Response time", ar: "وقت الرد" },
    { en: "Within 6 hours, Sun–Thu", ar: "خلال 6 ساعات، من الأحد إلى الخميس" },
    { en: "Same day, Sun–Thu", ar: "في اليوم نفسه، من الأحد إلى الخميس" },
  ],
  [
    { en: "Personalization", ar: "التخصيص" },
    {
      en: "Written protocol delivered in 3–5 business days, plus a PDF data analysis",
      ar: "بروتوكول مكتوب خلال 3–5 أيام عمل، مع ملف PDF لتحليل البيانات",
    },
    {
      en: "Personalized supplement schedule with reminders, plus a monthly LIV product supply",
      ar: "جدول مكمّلات مخصّص مع تذكيرات، وإمداد شهري من منتجات LIV",
    },
  ],
  [
    { en: "Extras", ar: "إضافات" },
    { en: "15% off LIV products", ar: "خصم 15% على منتجات LIV" },
    { en: "Priority booking for in-home sessions", ar: "أولوية في حجز الزيارات المنزلية" },
  ],
  [
    { en: "Ideal for", ar: "مناسب لـ" },
    {
      en: "A woman with a plan who needs accountability and can self-direct between check-ins",
      ar: "امرأة لديها خطة وتحتاج إلى متابعة، وتستطيع التوجيه الذاتي بين الجلسات",
    },
    {
      en: "A woman done experimenting who wants her data read and her protocol adjusted in real time",
      ar: "امرأة انتهت من التجربة وتريد قراءة بياناتها وتعديل بروتوكولها لحظة بلحظة",
    },
  ],
];

const heading: L = { en: "Which program fits you?", ar: "أي برنامج يناسبك؟" };
const eyebrow: L = { en: "Compare the two programs", ar: "قارني بين البرنامجين" };
const perMonth: L = { en: "per month", ar: "شهريًا" };

export function CoachingComparison({ products }: { products: Product[] }) {
  const { i18n, t } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";

  const guided = products.find((p) => p.slug.startsWith("guided-reset-"));
  const intensive = products.find((p) => p.slug.startsWith("inner-circle-"));
  if (!guided || !intensive) return null;
  const cols = [guided, intensive];

  const header = (p: Product, featured: boolean) => (
    <div className={featured ? "text-forest-700" : ""}>
      <div className="display-serif text-xl leading-snug md:text-2xl">{p.title[lang]}</div>
      <div className="mt-2 text-base font-semibold text-forest-700">
        {formatPrice(p.price, p.currency)}{" "}
        <span className="text-sm font-normal text-ink-muted">/ {perMonth[lang]}</span>
      </div>
    </div>
  );

  const cta = (p: Product) => (
    <Link
      to={`/apply/${p.slug}`}
      className="inline-flex items-center justify-center rounded-full bg-forest-500 px-6 py-3 text-sm font-medium text-bone-50 transition-colors hover:bg-forest-600"
    >
      {t("apply.cta", { product: p.title[lang], defaultValue: `Apply for ${p.title[lang]}` })}
    </Link>
  );

  return (
    <Section variant="raised" pad="md" id="compare-programs">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow mb-4">{eyebrow[lang]}</div>
          <h2 className="display-serif text-display-md tracking-tightest text-balance">{heading[lang]}</h2>
        </div>

        {/* Desktop / tablet: a real table */}
        <div className="mt-12 hidden overflow-hidden rounded-3xl border border-ink/10 md:block">
          <table className="w-full border-collapse text-start text-sm">
            <thead>
              <tr className="bg-bone-100/70">
                <th className="w-1/5 p-6" />
                <th scope="col" className="w-2/5 p-6 text-start align-top">{header(guided, false)}</th>
                <th scope="col" className="w-2/5 bg-forest-50 p-6 text-start align-top">{header(intensive, true)}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, a, b], i) => (
                <tr key={i} className="border-t border-ink/10 align-top">
                  <th scope="row" className="p-6 text-start text-eyebrow font-semibold uppercase text-forest-700">
                    {label[lang]}
                  </th>
                  <td className="p-6 leading-relaxed">{a[lang]}</td>
                  <td className="bg-forest-50/60 p-6 leading-relaxed">{b[lang]}</td>
                </tr>
              ))}
              <tr className="border-t border-ink/10">
                <td className="p-6" />
                <td className="p-6">{cta(guided)}</td>
                <td className="bg-forest-50/60 p-6">{cta(intensive)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile: one card per program */}
        <div className="mt-10 space-y-6 md:hidden">
          {cols.map((p, ci) => (
            <div
              key={p.id}
              className={`rounded-3xl border border-ink/10 p-6 ${ci === 1 ? "bg-forest-50" : "bg-surface-base"}`}
            >
              {header(p, ci === 1)}
              <dl className="mt-6 space-y-5">
                {ROWS.map(([label, a, b], i) => (
                  <div key={i}>
                    <dt className="text-eyebrow font-semibold uppercase text-forest-700">{label[lang]}</dt>
                    <dd className="mt-1.5 text-sm leading-relaxed">{(ci === 0 ? a : b)[lang]}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6">{cta(p)}</div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
