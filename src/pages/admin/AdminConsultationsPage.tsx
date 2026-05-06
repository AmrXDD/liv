import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";
import { Card, PageHeader, Select } from "@/components/admin/ui";

interface BookingRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  date: string;
  time: string;
  topic: string | null;
  message: string | null;
  status: string;
  locale: string;
  google_event_id: string | null;
  created_at: string;
}

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

async function fetchBookings(): Promise<BookingRow[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .order("date", { ascending: false })
    .order("time", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BookingRow[];
}

export function AdminConsultationsPage() {
  const qc = useQueryClient();
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: fetchBookings,
  });

  const updateStatus = async (id: string, status: string) => {
    const sb = requireSupabase();
    const { error } = await sb.from("bookings").update({ status }).eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    const sb = requireSupabase();
    const { error } = await sb.from("bookings").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  };

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = bookings.filter((b) => b.status === s).length;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Consultations"
        description="Free 15-minute discovery calls and paid consultations."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATUSES.map((s) => (
          <div key={s} className="rounded-2xl border border-ink/10 bg-surface-raised p-4">
            <div className="text-xs uppercase tracking-wider text-ink-muted">{s}</div>
            <div className="display-serif text-3xl text-forest-700">{counts[s] ?? 0}</div>
          </div>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading && <div className="p-8 text-sm text-ink-muted">Loading…</div>}
        {!isLoading && bookings.length === 0 && (
          <div className="p-12 text-center text-sm text-ink-muted">No bookings yet.</div>
        )}
        {bookings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink/10 bg-bone-100/60 text-left text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-6 py-3">When</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Topic</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-ink/5 last:border-0 hover:bg-bone-100/30 align-top"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">{b.date}</div>
                      <div className="text-xs text-ink-muted">{b.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-ink-muted">{b.email}</div>
                      {b.phone && <div className="text-xs text-ink-muted">{b.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-xs text-ink-muted max-w-xs">
                      {b.topic && <div className="font-medium text-ink">{b.topic}</div>}
                      {b.message && <div className="line-clamp-3">{b.message}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.currentTarget.value)}
                        className="!py-1.5 !px-3 !text-xs !rounded-full w-auto"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => onDelete(b.id)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 hover:bg-coral-100 hover:text-coral-700"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
