// Build a "Add to Google Calendar" link that pre-fills a 1:1 consultation
// event with reham@livfunctional.com (the practitioner) as a guest.
// Format reference: https://calendar.google.com/calendar/render?action=TEMPLATE

export const PRACTITIONER_EMAIL = "reham.alsharif@gmail.com";

const GCAL_TZ = "Asia/Kuwait";

interface CalendarEvent {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  durationMinutes?: number;
  guestEmail?: string;
  location?: string;
}

function formatGcalDate(date: string, time: string, addMinutes = 0): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, hh, mm + addMinutes));
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    dt.getUTCFullYear() +
    pad(dt.getUTCMonth() + 1) +
    pad(dt.getUTCDate()) +
    "T" +
    pad(dt.getUTCHours()) +
    pad(dt.getUTCMinutes()) +
    "00Z"
  );
}

export function buildGoogleCalendarUrl(ev: CalendarEvent): string {
  const startsAt = formatGcalDate(ev.date, ev.time);
  const endsAt = formatGcalDate(ev.date, ev.time, ev.durationMinutes ?? 30);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${startsAt}/${endsAt}`,
    details: ev.description,
    location: ev.location ?? "Online — Liv Functional",
    ctz: GCAL_TZ,
  });
  if (ev.guestEmail) params.append("add", ev.guestEmail);
  params.append("add", PRACTITIONER_EMAIL);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
