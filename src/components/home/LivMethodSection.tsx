import { useTranslation } from "react-i18next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { SELF_GUIDED_PATH } from "@/lib/routes";

type L = { en: string; ar: string };

const copy = {
  eyebrow: { en: "The method behind everything", ar: "المنهج وراء كل شيء" } as L,
  title: { en: "Five pillars. One method.", ar: "خمس ركائز. منهج واحد." } as L,
  lede: {
    en: "LivMethod™ is the framework behind every workbook, program and coaching plan at LIV. Whatever you start with, you are working on the same five pillars.",
    ar: "LivMethod™ هو الإطار الذي تقوم عليه كل كتب وبرامج وخطط التدريب في ليف. مهما كانت نقطة البداية، فأنت تعملين على الركائز الخمس نفسها.",
  } as L,
  stepsTitle: { en: "Three ways to work with it", ar: "ثلاث طرق للعمل بها" } as L,
  cta1: { en: "Explore self-guided programs", ar: "استكشفي برامج التنفيذ الشخصي" } as L,
  cta2: { en: "Work with Reham", ar: "اعملي مع ريهام" } as L,
};

const pillars: { title: L; body: L }[] = [
  {
    title: { en: "Gut microbiome", ar: "ميكروبيوم الأمعاء" },
    body: {
      en: "Support the gut bacteria that influence blood sugar, cravings and inflammation.",
      ar: "دعم بكتيريا الأمعاء المؤثرة في سكر الدم والاشتهاء والالتهاب.",
    },
  },
  {
    title: { en: "Stress response", ar: "استجابة التوتر" },
    body: {
      en: "Calm the stress signals that keep your body in survival mode and your insulin high.",
      ar: "تهدئة إشارات التوتر التي تُبقي الجسم في وضع البقاء وتُبقي الأنسولين مرتفعًا.",
    },
  },
  {
    title: { en: "Food as medicine", ar: "الغذاء كدواء" },
    body: {
      en: "Eat in an order and a rhythm that keeps your glucose steady, using food you actually enjoy.",
      ar: "تناولي الطعام بترتيب وإيقاع يحافظان على استقرار سكرك، بأطعمة تستمتعين بها فعلًا.",
    },
  },
  {
    title: { en: "The right movement", ar: "الحركة المناسبة" },
    body: {
      en: "Short, well-timed movement that helps your muscles use sugar instead of storing it.",
      ar: "حركة قصيرة في وقتها المناسب تساعد عضلاتك على استخدام السكر بدل تخزينه.",
    },
  },
  {
    title: {
      en: "Reading your labs from a functional health point of view",
      ar: "قراءة تحاليلك من منظور الصحة الوظيفية",
    },
    body: {
      en: "Look beyond “normal” and understand what your results say about where you are heading.",
      ar: "النظر إلى ما وراء كلمة «طبيعي» وفهم ما تقوله نتائجك عن مسارك الصحي.",
    },
  },
];

const steps: { tag: L; title: L; body: L }[] = [
  {
    tag: { en: "Learn it", ar: "تعلّميها" },
    title: { en: "The workbook", ar: "الكتاب العملي" },
    body: {
      en: "The five pillars in a 90-day written guide you work through at your own pace.",
      ar: "الركائز الخمس في دليل مكتوب لمدة 90 يومًا تتقدمين فيه بإيقاعك.",
    },
  },
  {
    tag: { en: "Do it yourself", ar: "نفّذيها بنفسك" },
    title: { en: "Self-guided programs", ar: "برامج التنفيذ الشخصي" },
    body: {
      en: "Step-by-step protocols for insulin resistance, PCOS and thyroid health.",
      ar: "بروتوكولات خطوة بخطوة لمقاومة الأنسولين وتكيس المبايض وصحة الغدة الدرقية.",
    },
  },
  {
    tag: { en: "Do it with Reham", ar: "نفّذيها مع ريهام" },
    title: { en: "Coaching", ar: "التدريب" },
    body: {
      en: "The Guided Reset or the 90-Day LIV Method Intensive, with a plan built around your labs and your data.",
      ar: "برنامج تصحيح المسار أو برنامج طريقة LIV المكثّف لمدة 90 يومًا، بخطة مبنية على تحاليلك وبياناتك.",
    },
  },
];

export function LivMethodSection() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const ref = useScrollReveal({ selector: "[data-method]", stagger: 0.08, y: 40 });

  return (
    <Section variant="raised" pad="lg" id="livmethod">
      <Container>
        <div ref={ref as React.RefObject<HTMLDivElement>}>
          <div className="mx-auto max-w-3xl text-center">
            <img
              data-method
              src="/livmethod-logo.webp"
              alt="LivMethod™"
              width={400}
              height={104}
              className="mx-auto mb-8 h-14 w-auto md:h-16"
            />
            <div data-method className="eyebrow mb-4">
              {copy.eyebrow[lang]}
            </div>
            <h2 data-method className="display-serif text-display-lg tracking-tightest text-balance">
              {copy.title[lang]}
            </h2>
            <p data-method className="mt-6 text-lg leading-relaxed text-ink-muted">
              {copy.lede[lang]}
            </p>
          </div>

          <ol className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {pillars.map((p, i) => (
              <li
                key={i}
                data-method
                className="rounded-2xl border border-ink/10 bg-surface-base p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-elevation"
              >
                <div className="font-mono text-eyebrow uppercase text-coral-500">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-4 display-serif text-xl leading-snug">{p.title[lang]}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{p.body[lang]}</p>
              </li>
            ))}
          </ol>

          <div className="mt-20">
            <h3 data-method className="text-center text-eyebrow uppercase text-forest-700">
              {copy.stepsTitle[lang]}
            </h3>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {steps.map((s, i) => (
                <div key={i} data-method className="rounded-2xl bg-forest-50 p-7">
                  <div className="text-eyebrow uppercase text-forest-700">{s.tag[lang]}</div>
                  <div className="mt-3 display-serif text-2xl">{s.title[lang]}</div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{s.body[lang]}</p>
                </div>
              ))}
            </div>
            <div data-method className="mt-10 flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" arrow to={SELF_GUIDED_PATH}>
                {copy.cta1[lang]}
              </Button>
              <Button variant="ghost" size="lg" to="/coaching">
                {copy.cta2[lang]}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
