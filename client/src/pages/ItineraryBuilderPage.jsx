import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { daysBetween, formatDateShort, activityTypes } from '@/lib/utils';
import { Plus, ArrowLeft, Trash2, MapPin, X, Wallet, Calendar as CalIcon } from 'lucide-react';

const SUGGESTIONS = {
  'Paris': [
    { name: 'Eiffel Tower', type: 'sightseeing', cost: 30, emoji: '🗼' },
    { name: 'Louvre Museum', type: 'culture', cost: 20, emoji: '🖼️' },
    { name: 'Seine Cruise', type: 'relax', cost: 15, emoji: '⛴️' }
  ],
  'Tokyo': [
    { name: 'Shibuya Crossing', type: 'sightseeing', cost: 0, emoji: '🚶' },
    { name: 'Sushi at Tsukiji', type: 'food', cost: 40, emoji: '🍣' },
    { name: 'Senso-ji Temple', type: 'culture', cost: 0, emoji: '⛩️' }
  ],
  'default': [
    { name: 'City Walking Tour', type: 'sightseeing', cost: 0, emoji: '🚶' },
    { name: 'Local Market', type: 'shopping', cost: 20, emoji: '🛍️' },
    { name: 'Dinner at local spot', type: 'food', cost: 30, emoji: '🍽️' }
  ]
};

const parseMeta = (desc) => { try { return desc ? JSON.parse(desc) : {}; } catch { return {}; } };

const typeBarColors = {
  sightseeing: 'bg-[var(--purple)]',
  food: 'bg-[var(--amber)]',
  adventure: 'bg-[var(--coral)]',
  culture: 'bg-[var(--green)]',
  default: 'bg-[var(--text-muted)]',
};
const typeBadgeColors = {
  sightseeing: 'bg-[var(--purple-soft)] text-[var(--purple)]',
  food: 'bg-[var(--amber-soft)] text-[var(--amber)]',
  adventure: 'bg-[var(--coral-soft)] text-[var(--coral)]',
  culture: 'bg-[var(--green-soft)] text-[var(--green)]',
  default: 'bg-[var(--bg-input)] text-[var(--text-muted)]',
};

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActId, setEditingActId] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'sightseeing', cost: 0, startTime: '10:00', day: 0 });

  useEffect(() => {
    api.get(`/trips/${id}`).then(res => setTrip(res.data)).catch(() => navigate('/trips')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-12 text-[var(--text-muted)] text-center font-medium">Loading builder...</div>;
  if (!trip?.stops?.length) return <div className="p-12 text-[var(--text-muted)] text-center">No destination found.</div>;

  const stop = trip.stops[0];
  const totalDays = daysBetween(stop.arrivalDate, stop.departureDate) || 1;
  const activities = stop.activities || [];
  const suggestions = SUGGESTIONS[stop.cityName] || SUGGESTIONS['default'];
  const budget = parseMeta(trip.description).budget || 0;
  const spent = activities.reduce((s, a) => s + (a.cost || 0), 0);

  const openForm = (dayIndex, act = null, prefill = null) => {
    if (act) {
      setEditingActId(act.id);
      setForm({ name: act.name, type: act.type, cost: act.cost || 0, startTime: act.startTime || '10:00', day: parseMeta(act.description).day || 0 });
    } else if (prefill) {
      setEditingActId(null);
      setForm({ name: prefill.name, type: prefill.type || 'sightseeing', cost: prefill.cost || 0, startTime: '10:00', day: dayIndex });
    } else {
      setEditingActId(null);
      setForm({ name: '', type: 'sightseeing', cost: 0, startTime: '10:00', day: dayIndex });
    }
    setIsFormOpen(true);
  };

  const saveActivity = async () => {
    if (!form.name) return;
    const payload = { ...form, description: JSON.stringify({ day: form.day }) };
    try {
      let res;
      if (editingActId) {
        res = await api.put(`/activities/${editingActId}`, payload);
        setTrip({ ...trip, stops: [{ ...stop, activities: activities.map(a => a.id === editingActId ? res.data : a) }] });
      } else {
        res = await api.post(`/stops/${stop.id}/activities`, payload);
        setTrip({ ...trip, stops: [{ ...stop, activities: [...activities, res.data] }] });
      }
      setIsFormOpen(false);
    } catch (err) { console.error(err); }
  };

  const deleteActivity = async (actId) => {
    try { await api.delete(`/activities/${actId}`); setTrip({ ...trip, stops: [{ ...stop, activities: activities.filter(a => a.id !== actId) }] }); } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen flex flex-col animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border)] px-6 md:px-10 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/trips')} className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-muted)] border border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent)] transition-all">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--text-primary)] leading-none">{trip.name}</h1>
            <p className="text-[13px] text-[var(--text-muted)] font-medium mt-1 uppercase tracking-wider">Itinerary Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-2.5 flex items-center gap-3">
            <Wallet size={16} className="text-[var(--text-muted)]" />
            <span className="text-sm font-bold text-[var(--text-secondary)] mono-num">${spent} <span className="text-[var(--text-muted)] font-medium">/ ${budget}</span></span>
          </div>
          <button onClick={() => navigate(`/trips/${trip.id}`)} className="btn-ghost h-10 px-5 text-sm">Preview</button>
          <button onClick={() => navigate('/trips')} className="btn-primary h-10 px-5 text-sm">Save</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col xl:flex-row gap-8 p-6 md:p-10 max-w-[1400px] mx-auto w-full">
        {/* Timeline */}
        <div className="flex-1 space-y-10 max-w-[780px]">
          {Array.from({ length: totalDays }).map((_, dayIdx) => {
            const dayActs = activities.filter(a => (parseMeta(a.description).day || 0) === dayIdx).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
            const date = new Date(stop.arrivalDate);
            date.setDate(date.getDate() + dayIdx);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <div key={dayIdx}>
                {/* Day Header */}
                <div className="flex items-center justify-between pb-3 mb-5 border-b-2 border-dashed border-[var(--border-strong)]">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Day {dayIdx + 1}</h2>
                    <span className="text-sm text-[var(--text-muted)] font-medium">— {dateStr}</span>
                  </div>
                  <button onClick={() => openForm(dayIdx)} className="text-[13px] font-bold text-[var(--accent)] bg-transparent border-none p-0 hover:underline">
                    + Add to Day {dayIdx + 1}
                  </button>
                </div>

                <div className="space-y-3">
                  {dayActs.length === 0 ? (
                    <div className="border-2 border-dashed border-[var(--border-strong)] rounded-2xl p-10 text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-[var(--bg-input)] flex items-center justify-center mb-3">
                        <CalIcon size={20} className="text-[var(--text-muted)]" />
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] font-semibold">No activities yet.</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Add from ideas or create manually.</p>
                    </div>
                  ) : (
                    dayActs.map(act => {
                      const barC = typeBarColors[act.type] || typeBarColors.default;
                      const badgeC = typeBadgeColors[act.type] || typeBadgeColors.default;
                      return (
                        <div key={act.id} onClick={() => openForm(dayIdx, act)} className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 pl-6 flex items-center gap-4 hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] card-transition cursor-pointer group">
                          <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${barC}`}></div>
                          <span className="text-[13px] font-semibold text-[var(--text-muted)] mono-num min-w-[45px]">{act.startTime || '--:--'}</span>
                          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <h4 className="text-[15px] font-bold text-[var(--text-primary)] truncate">{act.name}</h4>
                            <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full w-fit ${badgeC}`}>{act.type}</span>
                          </div>
                          <span className="text-sm text-[var(--green)] font-bold mono-num">${act.cost}</span>
                          <button onClick={(e) => { e.stopPropagation(); deleteActivity(act.id); }} className="w-8 h-8 rounded-lg bg-[var(--bg-input)] text-[var(--text-muted)] flex items-center justify-center hover:bg-[var(--coral-soft)] hover:text-[var(--coral)] transition-all shrink-0 opacity-0 group-hover:opacity-100">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })
                  )}

                  <button onClick={() => openForm(dayIdx)} className="w-full bg-transparent border-2 border-dashed border-[var(--border-strong)] rounded-xl h-12 flex items-center justify-center gap-3 mt-2 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all group">
                    <Plus size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
                    <span className="text-sm font-bold text-[var(--text-muted)] group-hover:text-[var(--accent)]">Add Activity</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ideas Panel */}
        <div className="w-full xl:w-[360px] shrink-0">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden sticky top-6 shadow-[var(--shadow-card)]">
            <div className="p-6 border-b border-[var(--border)]">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-3">
                <MapPin size={18} className="text-[var(--accent)]" /> Activity Ideas
              </h3>
              <p className="text-[13px] text-[var(--text-muted)] mt-1">Click to add to your itinerary</p>
            </div>
            <div className="p-3 space-y-1">
              {suggestions.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-card-hover)] card-transition group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center text-lg">{s.emoji}</div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">{s.name}</p>
                      <p className="text-xs text-[var(--green)] font-semibold mono-num mt-0.5">${s.cost}</p>
                    </div>
                  </div>
                  <button onClick={() => openForm(0, null, s)} className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0 hover:bg-[var(--accent)] hover:text-white transition-all opacity-60 group-hover:opacity-100">
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]">
          <div className="bg-[var(--bg-surface)] rounded-2xl p-8 w-full max-w-md shadow-[var(--shadow-elevated)] border border-[var(--border-strong)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{editingActId ? 'Edit Activity' : 'New Activity'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="w-9 h-9 rounded-lg bg-[var(--bg-card)] text-[var(--text-muted)] flex items-center justify-center hover:text-[var(--text-primary)]"><X size={18} /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full" placeholder="What are you doing?" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">Time</label>
                  <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full mono-num" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">Cost ($)</label>
                  <input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: parseInt(e.target.value) || 0 })} className="w-full mono-num" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">Day</label>
                <select value={form.day} onChange={e => setForm({ ...form, day: parseInt(e.target.value) })} className="w-full">
                  {Array.from({ length: totalDays }).map((_, i) => <option key={i} value={i}>Day {i + 1}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full">
                  {activityTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <button onClick={saveActivity} disabled={!form.name} className="w-full h-12 btn-primary text-base mt-2">Save Activity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
