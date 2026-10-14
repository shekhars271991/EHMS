import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronRight, Loader2, RefreshCw, Scissors } from 'lucide-react';
import { api } from '../../api/client';

type SurgeryBooking = any;
type SurgeryGroup = 'Today' | 'Upcoming' | 'Past';

const localDay = (value: string | Date) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

const displayDate = (value: string | Date) => new Date(value).toLocaleString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const readable = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

export const SurgeryModule: React.FC = () => {
  const [bookings, setBookings] = useState<SurgeryBooking[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getSurgeries();
      setBookings(data || []);
      setSelectedId((current) => current && data?.some((item: SurgeryBooking) => item.id === current)
        ? current : null);
    } catch (error) {
      console.error('Failed to load surgeries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const groups = useMemo(() => {
    const today = localDay(new Date());
    const grouped: Record<SurgeryGroup, SurgeryBooking[]> = { Today: [], Upcoming: [], Past: [] };
    bookings.forEach((booking) => {
      const day = localDay(booking.scheduledDate);
      grouped[day === today ? 'Today' : day > today ? 'Upcoming' : 'Past'].push(booking);
    });
    grouped.Today.sort((a, b) => +new Date(a.scheduledDate) - +new Date(b.scheduledDate));
    grouped.Upcoming.sort((a, b) => +new Date(a.scheduledDate) - +new Date(b.scheduledDate));
    grouped.Past.sort((a, b) => +new Date(b.scheduledDate) - +new Date(a.scheduledDate));
    return grouped;
  }, [bookings]);

  const selected = bookings.find((booking) => booking.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="surgery-header flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-emerald-600" /> Surgery &amp; OT
          </h2>
          <p className="text-sm text-slate-500 mt-1">Scheduled procedures grouped by date.</p>
        </div>
        <button onClick={loadBookings} title="Refresh surgeries" className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-white">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && bookings.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading surgeries...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 items-start">
          <div className="space-y-4">
            {(['Today', 'Upcoming', 'Past'] as SurgeryGroup[]).map((group) => (
              <section key={group} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <h3 className="px-4 py-3 font-semibold text-sm text-slate-800 border-b border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-emerald-600" />{group}</span>
                  <span className="text-xs text-slate-400">{groups[group].length}</span>
                </h3>
                {groups[group].length === 0 ? (
                  <p className="px-4 py-5 text-xs text-slate-400">No {group.toLowerCase()} surgeries.</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {groups[group].map((booking) => (
                      <li key={booking.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(booking.id)}
                          className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-emerald-50/60 ${selectedId === booking.id ? 'bg-emerald-50' : ''}`}
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-slate-900 truncate">
                              {booking.patient?.firstName} {booking.patient?.lastName}
                            </span>
                            <span className="block text-xs text-slate-500 mt-0.5">
                              {booking.patient?.mrn || 'No MRN'} · {booking.procedureName}
                            </span>
                            <span className="block text-[11px] text-slate-400 mt-1">{displayDate(booking.scheduledDate)}</span>
                          </span>
                          <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 min-h-48">
            {!selected ? (
              <div className="h-full min-h-40 flex items-center justify-center text-sm text-slate-400 text-center">
                Select a surgery to view its details.
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <p className="text-[11px] uppercase tracking-wide text-emerald-700 font-semibold">Surgery details</p>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{selected.procedureName}</h3>
                  <p className="text-sm text-slate-500 mt-1">{selected.patient?.firstName} {selected.patient?.lastName} · {selected.patient?.mrn}</p>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div><dt className="text-xs text-slate-500">Scheduled</dt><dd className="font-medium text-slate-900 mt-0.5">{displayDate(selected.scheduledDate)}</dd></div>
                  <div><dt className="text-xs text-slate-500">Status</dt><dd className="font-medium text-slate-900 mt-0.5">{selected.status?.replaceAll('_', ' ') || '—'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Eye</dt><dd className="font-medium text-slate-900 mt-0.5">{selected.eye || '—'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Operating room</dt><dd className="font-medium text-slate-900 mt-0.5">{selected.theatreRoom || '—'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Anaesthesia</dt><dd className="font-medium text-slate-900 mt-0.5">{selected.anaesthesiaType || '—'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Surgeon</dt><dd className="font-medium text-slate-900 mt-0.5">{selected.surgeon?.fullName || '—'}</dd></div>
                  <div><dt className="text-xs text-slate-500">Consent</dt><dd className="font-medium text-slate-900 mt-0.5">{selected.consentSigned ? 'Signed' : 'Not signed'}</dd></div>
                </dl>
                {selected.biometryData && <DetailBlock title="Biometry" value={selected.biometryData} />}
                {selected.preOpChecklist && <DetailBlock title="Pre-operative checklist" value={selected.preOpChecklist} />}
                {selected.operativeNotes && <DetailBlock title="Operative notes" value={selected.operativeNotes} />}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

const DetailBlock: React.FC<{ title: string; value: unknown }> = ({ title, value }) => (
  <div className="mt-5 pt-4 border-t border-slate-100">
    <h4 className="font-semibold text-sm text-slate-800 mb-2">{title}</h4>
    <pre className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3 whitespace-pre-wrap break-words font-sans">{readable(value)}</pre>
  </div>
);
