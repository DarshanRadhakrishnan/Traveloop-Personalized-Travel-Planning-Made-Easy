import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { daysBetween, formatDateShort, getTripStatus } from '@/lib/utils';
import { Plus, Map, Globe, Activity, Clock, Calendar, Trash2, Eye, Edit, Sparkles } from 'lucide-react';

const parseMeta = (desc) => {
  try { return desc ? JSON.parse(desc) : { type: 'Solo' }; }
  catch (e) { return { type: 'Solo' }; }
};

const typeConfig = {
  group: { bg: 'bg-violet-500/10', text: 'text-violet-400', dot: 'bg-violet-400' },
  couple: { bg: 'bg-pink-500/10', text: 'text-pink-400', dot: 'bg-pink-400' },
  family: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  solo: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
};
const getType = (t) => typeConfig[(t || 'solo').toLowerCase().split(' ')[0]] || typeConfig.solo;

const statusConfig = {
  upcoming: { bar: 'from-violet-500 to-purple-500', badge: 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30' },
  ongoing: { bar: 'from-emerald-500 to-teal-500', badge: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30' },
  completed: { bar: 'from-slate-600 to-slate-500', badge: 'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/20' },
};
const getStatus = (s) => statusConfig[s] || statusConfig.completed;

function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const status = getTripStatus(trip.startDate, trip.endDate);
  const { bar, badge } = getStatus(status);
  const meta = parseMeta(trip.description);
  const tc = getType(meta.type);
  const nights = daysBetween(trip.startDate, trip.endDate);
  const country = trip.stops?.[0]?.country || '—';

  let progress = 0, dayNum = 0;
  if (status === 'ongoing') {
    dayNum = Math.floor((Date.now() - new Date(trip.startDate)) / 86400000) + 1;
    progress = Math.min(100, (dayNum / (nights || 1)) * 100);
  }

  return (
    <div className="group relative bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--border-strong)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.08)] transition-all duration-300">
      {/* Gradient accent bar */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${bar}`} />

      <div className="p-5 space-y-4">
        {/* Row 1: Avatar + Name + Badge */}
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[15px] font-extrabold shrink-0 ${tc.bg} ${tc.text}`}>
            {(meta.type || 'S')[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-bold text-[var(--text-primary)] truncate leading-snug">{trip.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }}></span>
              <span className={`text-[11px] font-bold ${tc.text}`}>{meta.type || 'Solo'}</span>
              <span className="text-[var(--text-muted)] text-[10px]">·</span>
              <span className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider uppercase">{country}</span>
            </div>
          </div>
          <span className={`text-[9px] font-extrabold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full shrink-0 ${badge}`}>{status}</span>
        </div>

        {/* Row 2: Dates chip */}
        <div className="flex items-center gap-2.5 text-[13px] text-[var(--text-secondary)]">
          <Calendar size={14} className="text-[var(--text-muted)] shrink-0" />
          <span>{formatDateShort(trip.startDate)} – {formatDateShort(trip.endDate)}</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--accent)] font-bold mono-num">{nights}N</span>
        </div>

        {/* Progress (ongoing only) */}
        {status === 'ongoing' && (
          <div>
            <div className="h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[11px] font-semibold text-[var(--text-muted)] text-right mt-1.5 mono-num">Day {dayNum}/{nights}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-1">
          <button onClick={() => navigate(`/trips/${trip.id}`)} className="flex-1 h-9 text-[13px] font-bold rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white flex items-center justify-center gap-1.5 hover:shadow-[0_4px_16px_rgba(124,58,237,0.3)] active:scale-[0.97] transition-all">
            <Eye size={14} /> View
          </button>
          <button onClick={() => navigate(`/trips/${trip.id}/edit`)} className="flex-1 h-9 text-[13px] font-bold rounded-lg border border-[var(--border-strong)] text-[var(--text-primary)] flex items-center justify-center gap-1.5 hover:bg-[var(--bg-card-hover)] hover:border-[var(--accent)]/40 active:scale-[0.97] transition-all bg-transparent">
            <Edit size={14} /> Edit
          </button>
          <button onClick={() => setConfirm(true)} className="w-9 h-9 shrink-0 rounded-lg bg-[var(--coral)]/10 text-[var(--coral)] flex items-center justify-center hover:bg-[var(--coral)] hover:text-white active:scale-[0.97] transition-all border-none">
            <Trash2 size={14} />
          </button>
        </div>

        {/* Delete confirm */}
        {confirm && (
          <div className="bg-[var(--coral)]/8 border border-[var(--coral)]/30 rounded-xl p-3.5 animate-slide-down-reveal">
            <p className="text-[12px] text-[var(--coral)] font-bold mb-2.5">Delete this trip permanently?</p>
            <div className="flex gap-2.5">
              <button onClick={() => setConfirm(false)} className="flex-1 h-8 text-[12px] bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)] rounded-lg font-semibold hover:bg-[var(--bg-card)]">Cancel</button>
              <button onClick={() => onDelete(trip.id)} className="flex-1 h-8 text-[12px] bg-[var(--coral)] text-white rounded-lg font-bold hover:brightness-110">Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyTripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/trips').then(res => setTrips(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try { await api.delete(`/trips/${id}`); setTrips(t => t.filter(x => x.id !== id)); } catch (e) { console.error(e); }
  };

  const filtered = trips.filter(t => {
    if (filter === 'all') return true;
    const s = getTripStatus(t.startDate, t.endDate);
    return filter === 'past' ? s === 'completed' : s === filter;
  });

  const countriesCount = [...new Set(trips.flatMap(t => (t.stops || []).map(s => s.country)))].length;
  const activitiesCount = trips.reduce((s, t) => s + (t.stops || []).reduce((a, st) => a + (st.activities || []).length, 0), 0);
  const upcomingCount = trips.filter(t => getTripStatus(t.startDate, t.endDate) === 'upcoming').length;

  const stats = [
    { label: 'Trips', val: trips.length, icon: Map, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Countries', val: countriesCount, icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Activities', val: activitiesCount, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Upcoming', val: upcomingCount, icon: Clock, color: 'text-purple-300', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="min-h-screen animate-[fade-in_0.3s_ease-out]">

      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Subtle gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/5 via-transparent to-[#A78BFA]/5 pointer-events-none" />
        <div className="relative px-6 md:px-10 py-10 md:py-14 max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Sparkles size={18} className="text-[var(--accent)]" />
                <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--accent)]">Your Journeys</span>
              </div>
              <h1 className="text-3xl md:text-[38px] font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.1]">
                Where to next?
              </h1>
              <p className="text-[15px] text-[var(--text-secondary)] mt-2 max-w-md leading-relaxed">
                Plan new adventures, track ongoing journeys, and relive your best memories.
              </p>
            </div>
            <button onClick={() => navigate('/trips/new')} className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white font-bold text-[14px] flex items-center gap-2.5 shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.4)] active:scale-[0.97] transition-all shrink-0">
              <Plus size={18} strokeWidth={3} /> Plan a Trip
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="px-6 md:px-10 pb-16 max-w-[1200px] mx-auto space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-[var(--bg-card)]/60 backdrop-blur-sm border border-[var(--border)] rounded-xl p-4 flex items-center gap-3.5 hover:border-[var(--border-strong)] transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <s.icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-[var(--text-primary)] leading-none mono-num">{loading ? '–' : s.val}</p>
                <p className="text-[10px] uppercase text-[var(--text-muted)] font-bold tracking-[0.1em] mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex gap-1 bg-[var(--bg-card)]/60 backdrop-blur-sm p-1 rounded-xl border border-[var(--border)] overflow-x-auto">
            {['all', 'upcoming', 'ongoing', 'past'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`h-8 px-4 rounded-lg text-[12px] font-bold capitalize shrink-0 border-none transition-all duration-200
                ${filter === f
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white shadow-[0_2px_8px_rgba(124,58,237,0.3)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                {f}
              </button>
            ))}
          </div>
          <select className="w-[160px] h-9 !bg-[var(--bg-card)] border !border-[var(--border-strong)] text-[var(--text-secondary)] !rounded-xl text-[13px] font-semibold px-3 cursor-pointer">
            <option>Sort: Soonest</option>
            <option>Sort: Furthest</option>
            <option>Name: A–Z</option>
          </select>
        </div>

        {/* Trip Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="h-[220px] bg-[var(--bg-card)]/40 border border-[var(--border)] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--border-strong)] rounded-2xl bg-[var(--bg-card)]/30 backdrop-blur-sm">
            <div className="w-14 h-14 bg-[var(--bg-input)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Map className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1.5">No trips found</h3>
            <p className="text-[14px] text-[var(--text-secondary)] mb-6 max-w-xs mx-auto">Start planning your next adventure!</p>
            <button onClick={() => navigate('/trips/new')} className="h-9 px-5 rounded-full border border-[var(--border-strong)] text-[var(--text-primary)] text-[13px] font-bold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all bg-transparent">
              + Plan a Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(t => <TripCard key={t.id} trip={t} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </div>
  );
}
