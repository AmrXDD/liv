/** Country dial codes for the quiz phone field. Gulf and nearby first, then the rest A–Z. */
export interface DialCountry {
  iso: string;
  dial: string;
  en: string;
  ar: string;
}

const flag = (iso: string) => String.fromCodePoint(...[...iso].map((c) => 0x1f1a5 + c.charCodeAt(0)));

const RAW: [string, string, string, string][] = [
  ["KW", "965", "Kuwait", "الكويت"],
  ["SA", "966", "Saudi Arabia", "السعودية"],
  ["AE", "971", "United Arab Emirates", "الإمارات"],
  ["QA", "974", "Qatar", "قطر"],
  ["BH", "973", "Bahrain", "البحرين"],
  ["OM", "968", "Oman", "عُمان"],
  ["EG", "20", "Egypt", "مصر"],
  ["JO", "962", "Jordan", "الأردن"],
  ["LB", "961", "Lebanon", "لبنان"],
  ["IQ", "964", "Iraq", "العراق"],
  ["SY", "963", "Syria", "سوريا"],
  ["PS", "970", "Palestine", "فلسطين"],
  ["YE", "967", "Yemen", "اليمن"],
  ["MA", "212", "Morocco", "المغرب"],
  ["DZ", "213", "Algeria", "الجزائر"],
  ["TN", "216", "Tunisia", "تونس"],
  ["LY", "218", "Libya", "ليبيا"],
  ["SD", "249", "Sudan", "السودان"],
  ["GB", "44", "United Kingdom", "المملكة المتحدة"],
  ["US", "1", "United States", "الولايات المتحدة"],
  ["CA", "1", "Canada", "كندا"],
  ["AU", "61", "Australia", "أستراليا"],
  ["DE", "49", "Germany", "ألمانيا"],
  ["FR", "33", "France", "فرنسا"],
  ["TR", "90", "Turkey", "تركيا"],
  ["IN", "91", "India", "الهند"],
  ["PK", "92", "Pakistan", "باكستان"],
  ["PH", "63", "Philippines", "الفلبين"],
];

export const DIAL_COUNTRIES: DialCountry[] = RAW.map(([iso, dial, en, ar]) => ({ iso, dial, en, ar }));
export const dialLabel = (c: DialCountry, lang: "en" | "ar") => `${flag(c.iso)} +${c.dial} ${lang === "ar" ? c.ar : c.en}`;
