import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, Check, Clock, Globe2, Users } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { CollectionHero } from "@/components/product/CollectionHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { smoothScrollTo } from "@/hooks/useLenis";
import { getSupabase } from "@/lib/supabase";
import { LIV_AT_WORK_PATH } from "@/lib/routes";
import { cn } from "@/lib/utils";

type L = { en: string; ar: string };
const INQUIRY_EMAIL = "info@livfunctional.com";

/* ---------------------------------------------------------------- copy -- */
/* Edited for a human voice: short, specific, no filler. Arabic follows Reham's rules:
   no dashes, ranges as "X إلى Y", رهام (not ريهام), plural "you" for the company. */

const hero = {
  eyebrow: { en: "LIV At Work", ar: "LIV At Work" } as L,
  title: {
    en: "Metabolic health workshops your team will actually attend.",
    ar: "ورش صحة أيضية يحضرها فريقك فعلًا.",
  } as L,
  lede: {
    en: "Three hours at your office. Your team watches a real glucose monitor react to real food, then writes a plan for their own working day. Up to 20 people.",
    ar: "ثلاث ساعات في مقر شركتكم. يشاهد فريقكم جهاز قياس السكر يتفاعل مع أكل حقيقي، ثم يخرج كل شخص بخطة مكتوبة ليوم عمله. حتى 20 شخصًا.",
  } as L,
  cta: { en: "Book a briefing call", ar: "احجزوا مكالمة تعريفية" } as L,
  cta2: { en: "See formats and pricing", ar: "الباقات والأسعار" } as L,
  glanceTitle: { en: "The basics", ar: "باختصار" } as L,
};

const glance: { icon: typeof Clock; label: L; value: L }[] = [
  { icon: Clock, label: { en: "Format", ar: "الصيغة" }, value: { en: "3 hours, on site", ar: "3 ساعات في مقر الشركة" } },
  { icon: Users, label: { en: "Group size", ar: "عدد المشاركين" }, value: { en: "Up to 20 people", ar: "حتى 20 شخصًا" } },
  { icon: Globe2, label: { en: "Language", ar: "اللغة" }, value: { en: "English or Arabic", ar: "العربية أو الإنجليزية" } },
];

const pains: { title: L; body: L }[] = [
  {
    title: { en: "The 3 pm crash", ar: "هبوط الساعة 3" },
    body: {
      en: "Lunch ends and energy drops. By mid-afternoon your team is on its fourth coffee and the best hours of the day are gone.",
      ar: "ينتهي الغداء وتنزل الطاقة. بحلول العصر يكون الفريق على فنجان القهوة الرابع، وأفضل ساعات اليوم راحت.",
    },
  },
  {
    title: { en: "The talk nobody remembers", ar: "المحاضرة التي ينساها الجميع" },
    body: {
      en: "Slides, a speaker, polite applause. Two weeks later people eat and work exactly as before.",
      ar: "شرائح ومتحدث وتصفيق مهذب. بعد أسبوعين يأكل الناس ويعملون كما كانوا.",
    },
  },
  {
    title: { en: "Nothing to show leadership", ar: "لا شيء تعرضه على الإدارة" },
    body: {
      en: "Someone asks what the wellness budget delivered. You want a better answer than an attendance sheet.",
      ar: "يسألك أحدهم ماذا أنجزت ميزانية الصحة، وأنت تريد جوابًا أقوى من ورقة حضور.",
    },
  },
];

const painSection = {
  title: {
    en: "The problem with most workplace wellness",
    ar: "مشكلة معظم برامج الصحة في العمل",
  } as L,
};

const formatsSection = {
  eyebrow: { en: "Formats and pricing", ar: "الباقات والأسعار" } as L,
  title: { en: "Three formats, one method", ar: "ثلاث صيغ، منهج واحد" } as L,
  lede: {
    en: "Price depends on group size, format, location and printed materials. You get a quote after the briefing call.",
    ar: "السعر يعتمد على عدد المشاركين والصيغة والموقع والمواد المطبوعة. يصلكم عرض السعر بعد المكالمة التعريفية.",
  } as L,
  cta: { en: "Get a quote", ar: "اطلبوا عرض سعر" } as L,
};

const formats: {
  key: string;
  formatValue: string;
  featured?: boolean;
  title: L;
  meta: L;
  price: L;
  body?: L;
  bullets?: L[];
}[] = [
  {
    key: "workshop",
    formatValue: "LIV At Work Workshop",
    featured: true,
    title: { en: "LIV At Work Workshop", ar: "ورشة LIV At Work" },
    meta: { en: "3 hours · on site · up to 20 people", ar: "3 ساعات · في مقر الشركة · حتى 20 شخصًا" },
    price: { en: "From KWD 950", ar: "ابتداءً من 950 د.ك" },
    bullets: [
      { en: "Live glucose monitor demo, projected on screen", ar: "عرض مباشر لجهاز قياس السكر على الشاشة" },
      { en: "Office food audit, if it suits your space", ar: "تدقيق في طعام المكتب إن كان المكان مناسبًا" },
      { en: "A Build Your Day worksheet for everyone", ar: "ورقة «ابنِ يومك» لكل مشارك" },
      { en: "Printed workbook with your company name, English or Arabic", ar: "كتيب مطبوع باسم شركتكم، بالعربية أو الإنجليزية" },
      { en: "Briefing call with HR beforehand", ar: "مكالمة مع الموارد البشرية قبل الورشة" },
    ],
  },
  {
    key: "group",
    formatValue: "Group workshop",
    title: { en: "Group workshops", ar: "ورش المجموعات" },
    meta: { en: "90 minutes to half a day · your topic", ar: "من 90 دقيقة إلى نصف يوم · بموضوع تختارونه" },
    price: { en: "From KWD 450", ar: "ابتداءً من 450 د.ك" },
    body: {
      en: "You pick the topic: metabolic health, gut health, stress and energy, or functional nutrition. We fit it to your industry and shifts.",
      ar: "أنتم تختارون الموضوع: الصحة الأيضية أو صحة الأمعاء أو التوتر والطاقة أو التغذية الوظيفية. ونعدّله على قطاعكم ونظام دوامكم.",
    },
  },
  {
    key: "retreat",
    formatValue: "Wellness retreat",
    title: { en: "Wellness retreats", ar: "رحلات إعادة الطاقة" },
    meta: { en: "Built around your team", ar: "حسب الطلب" },
    price: { en: "Custom quote", ar: "عرض سعر حسب الطلب" },
    body: {
      en: "A retreat day designed for your team. Length, place and content are agreed with you.",
      ar: "يوم خلوة مبني حول فريقكم. المدة والمكان والمحتوى نتفق عليها معكم.",
    },
  },
];

const daySection = { title: { en: "How the day works", ar: "كيف يسير اليوم" } as L };
const steps: { title: L; body: L }[] = [
  {
    title: { en: "Briefing call", ar: "المكالمة التعريفية" },
    body: {
      en: "You tell us your sector, shift patterns and what leadership wants. We plan around it.",
      ar: "تخبروننا بقطاعكم ونظام الدوام وما تريده الإدارة، ونخطط على أساسه.",
    },
  },
  {
    title: { en: "Live glucose demo", ar: "عرض الجلوكوز المباشر" },
    body: {
      en: "Volunteers wear a glucose monitor, or Reham uses her own. She is type 1 and wears one every day. Everyone watches the numbers on screen as people eat.",
      ar: "يضع متطوعون جهاز قياس السكر، أو تستخدم رهام جهازها. هي من مرضى السكري من النوع الأول وتضعه كل يوم. يتابع الجميع الأرقام على الشاشة أثناء الأكل.",
    },
  },
  {
    title: { en: "Food audit", ar: "تدقيق الطعام" },
    body: {
      en: "Reham looks at what your office serves and stocks, and points out which “healthy” choices are working against your team.",
      ar: "تنظر رهام فيما يقدمه مكتبكم ويحتفظ به، وتبيّن أي الخيارات «الصحية» تعمل ضد فريقكم.",
    },
  },
  {
    title: { en: "Build Your Day", ar: "ابنِ يومك" },
    body: {
      en: "Everyone leaves with a written plan for their own workday: when to eat, when to take breaks, what to swap. Not a diet.",
      ar: "يخرج كل شخص بخطة مكتوبة ليوم عمله: متى يأكل ومتى يستريح وماذا يبدّل. وليست حمية.",
    },
  },
];

const hrSection = {
  title: { en: "What HR receives", ar: "ما تستلمه الموارد البشرية" } as L,
  lede: {
    en: "Something to put in your report.",
    ar: "مادة تضعونها في تقريركم.",
  } as L,
  snapshotTitle: { en: "The Team Snapshot", ar: "ملخص الفريق" } as L,
  snapshotBody: {
    en: "One page on your team's energy and eating patterns. It comes from an anonymous two-minute survey during the workshop. No names, no individual results. If fewer than five people answer, you get group themes only.",
    ar: "ملخص من صفحة واحدة عن أنماط الطاقة والأكل عند فريقكم، من استبيان مجهول مدته دقيقتان أثناء الورشة. بلا أسماء وبلا نتائج فردية. إذا أجاب أقل من خمسة أشخاص تصلكم المحاور العامة فقط.",
  } as L,
  snapshotCovers: { en: "What it covers", ar: "ما يغطيه" } as L,
};

const snapshotItems: L[] = [
  { en: "When energy drops during the workday", ar: "متى تنخفض الطاقة خلال يوم العمل" },
  { en: "Sleep and stress", ar: "النوم والتوتر" },
  { en: "Breakfast, snacks and caffeine", ar: "الفطور والوجبات الخفيفة والكافيين" },
  { en: "How your office food helps or hurts", ar: "كيف يساعد طعام المكتب أو يضر" },
  { en: "Three changes to make this month: food, break timing, meetings", ar: "ثلاثة تغييرات تبدؤونها هذا الشهر: الطعام وتوقيت الاستراحات والاجتماعات" },
  { en: "A follow-up suggestion for day 30", ar: "اقتراح متابعة بعد 30 يومًا" },
];

const hrItems: { title: L; body: L }[] = [
  {
    title: { en: "Printed workbook", ar: "كتيب مطبوع" },
    body: {
      en: "One for every attendee, in English or Arabic, with your company name beside ours.",
      ar: "لكل مشارك كتيب بالعربية أو الإنجليزية، عليه اسم شركتكم بجانب اسمنا.",
    },
  },
  {
    title: { en: "Office notes", ar: "ملاحظات المكتب" },
    body: {
      en: "Written notes from the food audit and break timing.",
      ar: "ملاحظات مكتوبة من تدقيق الطعام وتوقيت الاستراحات.",
    },
  },
  {
    title: { en: "A preferred coaching rate", ar: "سعر مفضل للتدريب" },
    body: {
      en: "Employees who want to continue one to one get a preferred rate on LIV coaching.",
      ar: "الموظف الذي يريد المتابعة بشكل فردي يحصل على سعر مفضل في برامج التدريب.",
    },
  },
];

const faqSection = { title: { en: "Common questions", ar: "أسئلة شائعة" } as L };
const faqs: { q: L; a: L }[] = [
  {
    q: { en: "Who is it for?", ar: "لمن الورشة؟" },
    a: {
      en: "Corporate teams in any sector that want steadier energy through the workday. We adapt it to your shifts.",
      ar: "لفرق الشركات في أي قطاع تريد طاقة أثبت خلال يوم العمل. نعدّل المحتوى على نظام دوامكم.",
    },
  },
  {
    q: { en: "How many people can attend?", ar: "كم عدد المشاركين؟" },
    a: {
      en: "Up to 20 per workshop. Bigger team? Tell us the headcount and we'll plan more than one session.",
      ar: "حتى 20 شخصًا في الورشة الواحدة. فريقكم أكبر؟ أخبرونا بالعدد ونخطط لأكثر من جلسة.",
    },
  },
  {
    q: { en: "Does everyone wear a glucose monitor?", ar: "هل يضع الجميع جهاز قياس السكر؟" },
    a: {
      en: "No. A few volunteers do, or Reham uses hers. Nobody has to.",
      ar: "لا. يضعه بعض المتطوعين، أو تستخدم رهام جهازها. لا أحد مجبر.",
    },
  },
  {
    q: { en: "Is it medical?", ar: "هل الورشة طبية؟" },
    a: {
      en: "No. It's educational. It doesn't diagnose or replace a doctor, and anyone with a health condition should follow their doctor's advice.",
      ar: "لا. هي ورشة تثقيفية. لا تشخّص ولا تغني عن الطبيب، ومن لديه حالة صحية يتبع نصيحة طبيبه.",
    },
  },
  {
    q: { en: "Do you share individual results with the company?", ar: "هل تصل نتائج الأفراد إلى الشركة؟" },
    a: {
      en: "No. The Team Snapshot is anonymous and combined. No names, no individual results.",
      ar: "لا. ملخص الفريق مجهول ومجمّع، بلا أسماء وبلا نتائج فردية.",
    },
  },
  {
    q: { en: "What language is it in?", ar: "بأي لغة تُقدَّم؟" },
    a: {
      en: "English or Arabic. Workbooks are printed in the one you choose.",
      ar: "بالعربية أو الإنجليزية، وتُطبع الكتيبات باللغة التي تختارونها.",
    },
  },
  {
    q: { en: "What do we need to prepare?", ar: "ما الذي نجهّزه؟" },
    a: {
      en: "A room, a screen or projector, and tables for the food demo. We confirm the rest on the briefing call.",
      ar: "قاعة وشاشة أو جهاز عرض وطاولات لعرض الطعام. والباقي نؤكده في المكالمة التعريفية.",
    },
  },
  {
    q: { en: "Where do you deliver?", ar: "أين تقدمون الورش؟" },
    a: {
      en: "On site at your office in Kuwait. Somewhere else? Send an inquiry and we'll tell you what's possible.",
      ar: "في مقر شركتكم في الكويت. موقع آخر؟ أرسلوا استفساركم ونخبركم بما هو ممكن.",
    },
  },
];

const form = {
  eyebrow: { en: "Inquiry", ar: "استفسار" } as L,
  title: { en: "Tell us about your team", ar: "أخبرونا عن فريقكم" } as L,
  lede: {
    en: "Send the details and we'll reply to set up a briefing call.",
    ar: "أرسلوا التفاصيل وسنردّ لنرتّب المكالمة التعريفية.",
  } as L,
  emailPrefix: { en: "Prefer email? Write to", ar: "تفضّلون البريد؟ راسلونا على" } as L,
  company: { en: "Company", ar: "اسم الشركة" } as L,
  name: { en: "Your name", ar: "اسمك" } as L,
  email: { en: "Work email", ar: "البريد الإلكتروني للعمل" } as L,
  phone: { en: "Phone or WhatsApp", ar: "الهاتف أو واتساب" } as L,
  size: { en: "Team size", ar: "حجم الفريق" } as L,
  format: { en: "Format", ar: "نوع الورشة" } as L,
  date: { en: "Preferred date", ar: "التاريخ المفضل" } as L,
  location: { en: "Location", ar: "الموقع" } as L,
  notes: { en: "Anything else we should know?", ar: "هل هناك شيء آخر يجب أن نعرفه؟" } as L,
  submit: { en: "Send inquiry", ar: "إرسال الاستفسار" } as L,
  ok: {
    en: "Got it. We'll be in touch to set up your briefing call.",
    ar: "وصلنا استفساركم. سنتواصل معكم لترتيب المكالمة التعريفية.",
  } as L,
  err: {
    en: "That didn't send. Try again, or email us directly.",
    ar: "لم يُرسل الاستفسار. حاولوا مرة أخرى أو راسلونا على البريد.",
  } as L,
};

const sizeOptions: { value: string; label: L }[] = [
  { value: "Up to 10", label: { en: "Up to 10", ar: "حتى 10" } },
  { value: "11 to 20", label: { en: "11 to 20", ar: "من 11 إلى 20" } },
  { value: "More than 20", label: { en: "More than 20", ar: "أكثر من 20" } },
];
const formatOptions: { value: string; label: L }[] = [
  { value: "LIV At Work Workshop", label: { en: "LIV At Work Workshop", ar: "ورشة LIV At Work" } },
  { value: "Group workshop", label: { en: "Group workshop", ar: "ورشة مجموعات" } },
  { value: "Wellness retreat", label: { en: "Wellness retreat", ar: "رحلة إعادة الطاقة" } },
  { value: "Not sure yet", label: { en: "Not sure yet", ar: "لم نحدد بعد" } },
];

const disclaimer: L = {
  en: "LIV At Work is educational. It is not medical advice, diagnosis or treatment. The glucose monitor demo is voluntary. Anyone with a medical condition should follow their doctor's advice.",
  ar: "LIV At Work برنامج تثقيفي، وليس نصيحة طبية ولا تشخيصًا ولا علاجًا. المشاركة في عرض جهاز قياس السكر اختيارية. ومن لديه حالة صحية يتبع نصيحة طبيبه.",
};

const meta = {
  title: {
    en: "LIV At Work: metabolic health workshops for teams in Kuwait",
    ar: "LIV At Work: ورش الصحة الأيضية لفرق العمل في الكويت",
  } as L,
  description: {
    en: "A 3-hour live workshop at your office. Watch a real glucose monitor react to real food, and leave with a plan for your working day. Up to 20 people. English or Arabic.",
    ar: "ورشة حية مدتها 3 ساعات في مقر شركتكم. شاهدوا جهاز قياس السكر يتفاعل مع أكل حقيقي، واخرجوا بخطة ليوم العمل. حتى 20 شخصًا، بالعربية أو الإنجليزية.",
  } as L,
};

const inputClass =
  "w-full rounded-2xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20";

/* ---------------------------------------------------------------- page -- */

export function LivAtWorkPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const ref = useScrollReveal({ selector: "[data-work]", stagger: 0.08, y: 36 });

  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [size, setSize] = useState(sizeOptions[1].value);
  const [fmt, setFmt] = useState(formatOptions[0].value);
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  const go = (id: string) => smoothScrollTo(`#${id}`, -40);

  const pickFormat = (value: string) => {
    setFmt(value);
    go("inquiry");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trap) {
      setStatus("ok");
      return;
    }
    setStatus("loading");
    const payload = {
      name,
      email,
      phone,
      subject: `LIV At Work inquiry: ${company}`,
      message: [
        `Company: ${company}`,
        `Contact: ${name} (${email}, ${phone})`,
        `Team size: ${size}`,
        `Format: ${fmt}`,
        date && `Preferred date: ${date}`,
        location && `Location: ${location}`,
        notes && `Notes: ${notes}`,
        `Source: liv-at-work page (${lang})`,
      ]
        .filter(Boolean)
        .join("\n"),
      locale: lang,
      nutrition_issues: [] as string[],
    };
    try {
      const sb = getSupabase();
      if (!sb) throw new Error("no supabase");
      const { error: fnErr } = await sb.functions.invoke("submit-contact", { body: payload });
      if (fnErr) {
        const { error } = await sb.from("contacts").insert(payload);
        if (error) throw error;
      }
      setStatus("ok");
    } catch (err) {
      console.error("[liv-at-work] submit failed:", err);
      setStatus("err");
    }
  };

  return (
    <>
      <SEO title={meta.title[lang]} description={meta.description[lang]} path={LIV_AT_WORK_PATH} />

      <CollectionHero
        eyebrow={hero.eyebrow[lang]}
        title={hero.title[lang]}
        lede={hero.lede[lang]}
        accent="coral"
        side={
          <div className="rounded-3xl bg-ink p-8 text-bone-50">
            <div className="mb-6 text-eyebrow uppercase opacity-70">{hero.glanceTitle[lang]}</div>
            <ul className="space-y-5">
              {glance.map(({ icon: Icon, label, value }) => (
                <li key={label.en} className="flex items-center gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-coral-500">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-60">{label[lang]}</div>
                    <div className="font-medium">{value[lang]}</div>
                  </div>
                </li>
              ))}
              <li className="border-t border-white/15 pt-5">
                <div className="text-xs uppercase tracking-wider opacity-60">
                  {lang === "ar" ? "السعر" : "Price"}
                </div>
                <div className="display-serif text-3xl">{formats[0].price[lang]}</div>
              </li>
            </ul>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-4">
            <button type="button" onClick={() => go("inquiry")} className="btn-primary">
              {hero.cta[lang]}
            </button>
            <button
              type="button"
              onClick={() => go("formats")}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3.5 text-sm font-medium transition-colors hover:bg-ink hover:text-bone-50"
            >
              {hero.cta2[lang]}
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {/* Pain points */}
      <Section variant="default" pad="md">
        <Container>
          <div ref={ref as React.RefObject<HTMLDivElement>}>
            <h2 data-work className="display-serif text-display-md tracking-tightest text-balance">
              {painSection.title[lang]}
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {pains.map((p, i) => (
                <div key={i} data-work className="rounded-3xl border border-ink/10 bg-surface-raised p-8">
                  <div className="font-mono text-eyebrow uppercase text-coral-500">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-4 display-serif text-2xl">{p.title[lang]}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{p.body[lang]}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Formats and pricing */}
      <Section variant="raised" pad="md" id="formats">
        <Container>
          <div className="max-w-3xl">
            <div className="eyebrow mb-4">{formatsSection.eyebrow[lang]}</div>
            <Reveal as="h2" className="display-serif text-display-md tracking-tightest text-balance">
              {formatsSection.title[lang]}
            </Reveal>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">{formatsSection.lede[lang]}</p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {formats.map((f) => (
              <div
                key={f.key}
                className={cn(
                  "flex flex-col rounded-3xl border p-8",
                  f.featured ? "border-forest-500 bg-forest-50 shadow-elevation" : "border-ink/10 bg-surface-base"
                )}
              >
                <h3 className="display-serif text-2xl">{f.title[lang]}</h3>
                <div className="mt-2 text-sm text-ink-muted">{f.meta[lang]}</div>
                <div className="mt-5 display-serif text-3xl text-forest-700">{f.price[lang]}</div>
                {f.body && <p className="mt-5 text-sm leading-relaxed">{f.body[lang]}</p>}
                {f.bullets && (
                  <ul className="mt-5 space-y-3">
                    {f.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                        <span>{b[lang]}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={() => pickFormat(f.formatValue)}
                  className={cn(
                    "mt-8 inline-flex w-fit items-center rounded-full px-6 py-3 text-sm font-medium transition-colors",
                    f.featured
                      ? "bg-forest-500 text-bone-50 hover:bg-forest-600"
                      : "border border-ink/15 hover:bg-ink hover:text-bone-50"
                  )}
                >
                  {formatsSection.cta[lang]}
                </button>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* How the day works */}
      <Section variant="default" pad="md">
        <Container>
          <Reveal as="h2" className="display-serif text-display-md tracking-tightest text-balance">
            {daySection.title[lang]}
          </Reveal>
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={i} className="rounded-3xl border border-ink/10 bg-surface-raised p-8">
                <div className="font-mono text-eyebrow uppercase text-coral-500">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-4 display-serif text-xl">{s.title[lang]}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{s.body[lang]}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* What HR receives */}
      <Section variant="sunken" pad="md">
        <Container>
          <div className="max-w-3xl">
            <Reveal as="h2" className="display-serif text-display-md tracking-tightest text-balance">
              {hrSection.title[lang]}
            </Reveal>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">{hrSection.lede[lang]}</p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            <div className="rounded-3xl bg-ink p-8 text-bone-50 md:p-10 lg:col-span-7">
              <div className="text-eyebrow uppercase text-coral-400">{hrSection.snapshotTitle[lang]}</div>
              <p className="mt-4 text-lg leading-relaxed">{hrSection.snapshotBody[lang]}</p>
              <div className="mt-8 text-xs uppercase tracking-wider opacity-60">{hrSection.snapshotCovers[lang]}</div>
              <ul className="mt-4 space-y-3">
                {snapshotItems.map((it, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-coral-400" />
                    <span>{it[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-6 lg:col-span-5">
              {hrItems.map((it, i) => (
                <div key={i} className="rounded-3xl border border-ink/10 bg-surface-raised p-8">
                  <h3 className="display-serif text-xl">{it.title[lang]}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{it.body[lang]}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section variant="default" pad="md">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Reveal as="h2" className="display-serif text-display-md tracking-tightest text-balance">
              {faqSection.title[lang]}
            </Reveal>
            <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {faqs.map((f, i) => (
                <details key={i} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                    {f.q[lang]}
                    <span className="text-2xl leading-none text-coral-500 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-ink-muted">{f.a[lang]}</p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Inquiry form */}
      <Section variant="default" pad="md" id="inquiry" className="bg-editorial">
        <Container>
          <div className="mx-auto max-w-2xl scroll-mt-24">
            <div className="text-center">
              <div className="eyebrow mb-4">{form.eyebrow[lang]}</div>
              <h2 className="display-serif text-display-lg tracking-tightest text-balance">{form.title[lang]}</h2>
              <p className="mt-4 text-ink-muted">{form.lede[lang]}</p>
              <p className="mt-2 text-sm text-ink-muted">
                {form.emailPrefix[lang]}{" "}
                <a href={`mailto:${INQUIRY_EMAIL}`} className="font-medium text-forest-700 underline-offset-4 hover:underline">
                  {INQUIRY_EMAIL}
                </a>
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              className="mt-10 space-y-4 rounded-3xl border border-ink/10 bg-surface-raised p-6 shadow-elevation md:p-10"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={form.company[lang]}>
                  <input required value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} autoComplete="organization" />
                </Field>
                <Field label={form.name[lang]}>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} autoComplete="name" />
                </Field>
                <Field label={form.email[lang]}>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="email" dir="ltr" />
                </Field>
                <Field label={form.phone[lang]}>
                  <input required type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} autoComplete="tel" dir="ltr" />
                </Field>
                <Field label={form.size[lang]}>
                  <select value={size} onChange={(e) => setSize(e.target.value)} className={inputClass}>
                    {sizeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label[lang]}</option>
                    ))}
                  </select>
                </Field>
                <Field label={form.format[lang]}>
                  <select value={fmt} onChange={(e) => setFmt(e.target.value)} className={inputClass}>
                    {formatOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label[lang]}</option>
                    ))}
                  </select>
                </Field>
                <Field label={form.date[lang]}>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} dir="ltr" />
                </Field>
                <Field label={form.location[lang]}>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label={form.notes[lang]}>
                <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
              </Field>
              {/* honeypot: real visitors never see or fill this */}
              <input
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                name="website"
                value={trap}
                onChange={(e) => setTrap(e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              <button type="submit" disabled={status === "loading"} className="btn-primary w-full justify-center disabled:opacity-60">
                {status === "loading" ? "…" : form.submit[lang]}
              </button>
              <p className="min-h-5 text-center text-sm" role="status">
                {status === "ok" && <span className="text-forest-700">{form.ok[lang]}</span>}
                {status === "err" && <span className="text-coral-700">{form.err[lang]}</span>}
              </p>
            </form>

            <p className="mt-8 text-center text-xs leading-relaxed text-ink-muted">{disclaimer[lang]}</p>
          </div>
        </Container>
      </Section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
