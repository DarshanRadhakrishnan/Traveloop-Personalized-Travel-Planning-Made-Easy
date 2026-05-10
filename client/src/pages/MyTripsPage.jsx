import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { daysBetween, formatDateShort, getTripStatus } from '@/lib/utils';
import { Plus, Map, Globe, Activity, Clock, Calendar, Trash2 } from 'lucide-react';

const parseMeta = (desc) => {
  try { return desc ? JSON.parse(desc) : { type: 'Solo' }; }
  catch (e) { return { type: 'Solo' }; }
};

const getTypeStyles = (type) => {
  const t = (type || 'Solo').toLowerCase();
  if (t.includes('group')) return 'bg-[var(--purple-soft)] text-[var(--purple)]';
  if (t.includes('couple')) return 'bg-[var(--coral-soft)] text-[var(--coral)]';
  if (t.includes('family')) return 'bg-[var(--amber-soft)] text-[var(--amber)]';
  return 'bg-[var(--green-soft)] text-[var(--green)]'; // solo default
};

const getStatusStyles = (status) => {
  if (status === 'upcoming') return { bar: 'bg-[var(--accent)]', badge: 'bg-[var(--accent-soft)] text-[var(--accent)]' };
  if (status === 'ongoing') return { bar: 'bg-[var(--green)]', badge: 'bg-[var(--green-soft)] text-[var(--green)]' };
  return { bar: 'bg-[var(--text-muted)]', badge: 'bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border)]' }; // completed
};

const TripCard = ({ trip, onConfirmDelete }) => {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  const status = getTripStatus(trip.startDate, trip.endDate);
  const { bar, badge } = getStatusStyles(status);
  const meta = parseMeta(trip.description);
  const typeStyles = getTypeStyles(meta.type);
  const nights = daysBetween(trip.startDate, trip.endDate);
  const countryCode = trip.stops && trip.stops.length > 0 ? trip.stops[0].country : 'INTL';

  let progress = 0;
  let currentDay = 0;
  if (status === 'ongoing') {
    const start = new Date(trip.startDate);
    const now = new Date();
    currentDay = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
    progress = Math.min(100, Math.max(0, (currentDay / (nights || 1)) * 100));
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--r-xl)] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-[2px] card-transition flex flex-col">
      <div className={`h-[6px] w-full ${bar}`}></div>
      <div className="p-[28px_32px] flex-1 flex flex-col">
        {/* Top Row */}
        <div className="flex items-start justify-between gap-[20px]">
          <div className="flex gap-[20px] flex-1 min-w-0">
            <div className={`w-[56px] h-[56px] rounded-[var(--r-md)] flex items-center justify-center font-[800] text-[20px] shrink-0 ${typeStyles}`}>
              {(meta.type || 'S')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 pt-[2px]">
              <h3 className="text-[19px] font-[700] text-[var(--text-primary)] truncate leading-tight">{trip.name}</h3>
              <div className="flex items-center gap-[10px] mt-[6px]">
                <span className={`text-[12px] px-[10px] py-[4px] rounded-full font-[700] ${typeStyles}`}>{meta.type || 'Solo'}</span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="text-[13px] text-[var(--text-muted)] font-[500] uppercase tracking-wider">{countryCode}</span>
              </div>
            </div>
          </div>
          <div className={`rounded-full px-[12px] py-[6px] text-[11px] font-[800] uppercase tracking-wider shrink-0 ${badge}`}>
            {status}
          </div>
        </div>

        {/* Middle Row */}
        <div className="mt-[24px] flex items-center gap-[10px] bg-[var(--bg-input)] p-[12px_16px] rounded-[var(--r-sm)]">
          <Calendar size={16} className="text-[var(--text-muted)]" />
          <span className="text-[15px] text-[var(--text-secondary)] font-[500]">{formatDateShort(trip.startDate)} - {formatDateShort(trip.endDate)}</span>
          <span className="text-[var(--text-muted)] mx-[4px]">·</span>
          <span className="text-[15px] text-[var(--accent)] font-[700] mono-num">{nights} {nights === 1 ? 'night' : 'nights'}</span>
        </div>

        {/* Progress Bar */}
        {status === 'ongoing' && (
          <div className="mt-[20px] w-full">
            <div className="h-[6px] w-full bg-[var(--bg-input)] rounded-full overflow-hidden border border-[var(--border)]">
              <div className="h-full bg-[var(--green)]" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-[13px] font-[600] text-[var(--text-muted)] text-right mt-[8px] mono-num">Day {currentDay} of {nights || 1}</p>
          </div>
        )}

        {/* Action Row */}
        <div className="mt-auto pt-[24px]">
          <div className="flex items-center gap-[12px]">
            <button onClick={() => navigate(`/trips/${trip.id}`)} className="flex-1 btn-primary text-[15px]">View Trip</button>
            <button onClick={() => navigate(`/trips/${trip.id}/edit`)} className="flex-1 btn-ghost text-[15px]">Edit</button>
            <button onClick={() => setDeleteConfirm(true)} className="w-[44px] h-[44px] shrink-0 rounded-[var(--r-md)] bg-[var(--coral-soft)] text-[var(--coral)] flex items-center justify-center hover:bg-[var(--coral)] hover:text-white transition-all">
              <Trash2 size={18} />
            </button>
          </div>

          {/* Delete Confirm Panel */}
          {deleteConfirm && (
            <div className="mt-[16px] bg-[var(--coral-soft)] border border-[var(--coral)] rounded-[var(--r-md)] p-[16px_20px] animate-slide-down-reveal">
              <p className="text-[14px] text-[var(--coral)] font-[700] mb-[16px]">Delete this trip forever?</p>
              <div className="flex gap-[12px]">
                <button onClick={() => setDeleteConfirm(false)} className="flex-1 h-[40px] text-[14px] bg-white text-[var(--text-secondary)] border border-[var(--border)] rounded-[var(--r-sm)] font-[600] hover:bg-gray-50">Cancel</button>
                <button onClick={() => onConfirmDelete(trip.id)} className="flex-1 h-[40px] text-[14px] bg-[var(--coral)] text-white rounded-[var(--r-sm)] font-[700] hover:brightness-110 shadow-md">Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MyTripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 

  const fetchTrips = () => {
    setLoading(true);
    api.get('/trips').then(res => setTrips(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/trips/${id}`);
      setTrips(trips.filter(t => t.id !== id));
    } catch (err) { console.error(err); }
  };

  const filteredTrips = trips.filter(t => {
    if (filter === 'all') return true;
    const status = getTripStatus(t.startDate, t.endDate);
    if (filter === 'past') return status === 'completed';
    return status === filter;
  });

  const totalCountries = [...new Set(trips.flatMap(t => (t.stops || []).map(s => s.country)))].length;
  const totalActivities = trips.reduce((sum, t) => sum + (t.stops || []).reduce((s, stop) => s + (stop.activities || []).length, 0), 0);
  const upcomingCount = trips.filter(t => getTripStatus(t.startDate, t.endDate) === 'upcoming').length;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Hero Section */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border)] p-[48px_56px] md:p-[64px_56px] flex flex-col md:flex-row md:items-end justify-between gap-[24px]">
        <div>
          <h1 className="text-[42px] font-[800] text-[var(--text-primary)] font-display tracking-tight leading-none mb-[12px]">Where to next?</h1>
          <p className="text-[16px] font-[500] text-[var(--text-secondary)] max-w-[540px]">
            Manage your upcoming travels, track ongoing journeys, and relive your past adventures in one beautiful place.
          </p>
        </div>
        <button onClick={() => navigate('/trips/new')} className="h-[48px] px-[24px] rounded-[var(--r-md)] bg-[var(--accent)] text-white font-[700] text-[16px] flex items-center justify-center gap-[12px] hover:bg-[#7C3AED] transition-all shadow-lg shrink-0">
          <Plus size={20} strokeWidth={3} /> Plan a Trip
        </button>
      </div>

      {/* Stats Row */}
      <div className="px-[24px] md:px-[56px] mt-[48px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] md:gap-[32px]">
        {[
          { label: 'Total Trips', value: trips.length, icon: Map, colors: 'bg-[var(--purple-soft)] text-[var(--purple)]' },
          { label: 'Countries', value: totalCountries, icon: Globe, colors: 'bg-[var(--green-soft)] text-[var(--green)]' },
          { label: 'Activities', value: totalActivities, icon: Activity, colors: 'bg-[var(--amber-soft)] text-[var(--amber)]' },
          { label: 'Upcoming', value: upcomingCount, icon: Clock, colors: 'bg-[var(--accent-soft)] text-[var(--accent)]' },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--r-xl)] p-[24px_32px] flex items-center gap-[20px] shadow-sm">
            <div className={`w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 ${stat.colors}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[32px] font-[800] text-[var(--text-primary)] leading-none mono-num">{loading ? '—' : stat.value}</p>
              <p className="text-[12px] uppercase text-[var(--text-muted)] font-[700] tracking-[0.08em] mt-[6px]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-transparent px-[24px] md:px-[56px] mt-[48px] flex flex-col sm:flex-row sm:items-center justify-between gap-[24px]">
        <div className="flex items-center gap-[12px] bg-[var(--bg-surface)] p-[6px] rounded-full border border-[var(--border)] shadow-sm overflow-x-auto w-full sm:w-auto">
          {['all', 'upcoming', 'ongoing', 'past'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`h-[40px] px-[24px] rounded-full text-[14px] font-[700] capitalize transition-all shrink-0 border-none ${filter === f ? 'bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm' : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
              {f}
            </button>
          ))}
        </div>
        <select className="w-full sm:w-[180px] h-[48px] !bg-[var(--bg-surface)] border !border-[var(--border)] text-[var(--text-primary)] !rounded-[var(--r-md)] text-[15px] font-[600] px-[16px] shadow-sm outline-none cursor-pointer">
          <option>Sort: Soonest</option>
          <option>Sort: Furthest</option>
          <option>Name: A-Z</option>
        </select>
      </div>

      {/* Trip List */}
      <div className="p-[32px_24px] md:p-[40px_56px] pb-[80px]">
        {loading ? (
          <div className="text-center text-[var(--text-muted)] py-12 font-[500] text-[16px]">Loading your journeys...</div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-[80px] border-2 border-dashed border-[var(--border)] rounded-[var(--r-xl)] bg-[var(--bg-surface)]/50">
            <div className="w-[80px] h-[80px] bg-[var(--bg-input)] rounded-full flex items-center justify-center mx-auto mb-[24px]">
              <Map className="w-[32px] h-[32px] text-[var(--text-muted)]" />
            </div>
            <h3 className="text-[22px] font-[700] text-[var(--text-primary)] mb-[8px]">No trips found</h3>
            <p className="text-[16px] text-[var(--text-secondary)] font-[500] max-w-[400px] mx-auto">You haven't planned any trips in this category yet. Start a new journey!</p>
            <button onClick={() => navigate('/trips/new')} className="mt-[32px] h-[44px] px-[24px] rounded-full bg-white border border-[var(--border-strong)] text-[var(--text-primary)] font-[700] shadow-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
              + Start Planning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-[32px]">
            {filteredTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} onConfirmDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
