import { useState, useEffect, useMemo } from 'react';
import activities from '@/data/activities.json';
import api from '@/lib/api';
import { getActivityIcon, activityTypes, getActivityLabel } from '@/lib/utils';
import {
  Search, MapPin, DollarSign, Clock, Plus, Check, X, Star,
  SlidersHorizontal, ChevronDown, Compass, Tag, Filter,
  ChevronRight, AlertCircle
} from 'lucide-react';

const COST_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Free', min: 0, max: 0 },
  { label: 'Under $25', min: 1, max: 25 },
  { label: '$25 – $60', min: 25, max: 60 },
  { label: '$60+', min: 60, max: Infinity },
];

const DURATION_RANGES = [
  { label: 'Any Duration', min: 0, max: Infinity },
  { label: 'Under 1 hr', min: 0, max: 60 },
  { label: '1 – 2 hrs', min: 60, max: 120 },
  { label: '2 – 4 hrs', min: 120, max: 240 },
  { label: '4+ hrs', min: 240, max: Infinity },
];

function formatDuration(min) {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// ── Quick View Modal ──────────────────────────────────────────────────────────
function ActivityModal({ activity, trips, onClose, onAdd }) {
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedStopId, setSelectedStopId] = useState('');
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  const handleAdd = async () => {
    if (!selectedStopId) { setError('Please select a stop.'); return; }
    setAdding(true); setError('');
    try {
      await api.post(`/stops/${selectedStopId}/activities`, {
        name: activity.name,
        type: activity.type,
        cost: activity.cost,
        durationMinutes: activity.durationMinutes,
        description: activity.description,
        imageUrl: activity.image,
      });
      setSuccess(true);
      onAdd(activity.id);
      setTimeout(onClose, 1200);
    } catch {
      setError('Failed to add activity. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-[scale-in_0.2s_ease-out] border border-border">
        {/* Image */}
        <div className="relative h-56">
          <img src={activity.image} alt={activity.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{getActivityIcon(activity.type)}</span>
              <span className="text-xs font-medium text-white/80 bg-white/20 backdrop-blur px-2 py-0.5 rounded-full">
                {getActivityLabel(activity.type)}
              </span>
              <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold ml-auto">
                <Star className="w-3.5 h-3.5 fill-amber-400" />{activity.rating}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white font-[Playfair_Display]">{activity.name}</h2>
            <p className="text-sm text-white/70 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />{activity.city}, {activity.country}
            </p>
          </div>
        </div>

        <div className="p-5">
          {/* Stats */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <span className={`flex items-center gap-0.5 ${activity.cost === 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                {activity.cost === 0 ? '✓ Free' : <><DollarSign className="w-4 h-4 text-primary" />{activity.cost}</>}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />{formatDuration(activity.durationMinutes)}
            </div>
          </div>

          {/* Tags */}
          {activity.tags && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {activity.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">{activity.description}</p>

          {/* Add to Trip */}
          {trips.length > 0 ? (
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Add to a Trip</p>
              <select value={selectedTripId} onChange={e => { setSelectedTripId(e.target.value); setSelectedStopId(''); }}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
                <option value="">Select a trip…</option>
                {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {selectedTrip && (
                <select value={selectedStopId} onChange={e => setSelectedStopId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
                  <option value="">Select a stop…</option>
                  {selectedTrip.stops?.map(s => (
                    <option key={s.id} value={s.id}>{s.flag} {s.cityName}</option>
                  ))}
                </select>
              )}
              {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
              <button onClick={handleAdd} disabled={adding || success}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  success ? 'bg-emerald-500 text-white' :
                  adding ? 'bg-primary/50 text-white cursor-wait' :
                  'bg-primary text-white hover:brightness-110 active:scale-95'}`}>
                {success ? <><Check className="w-4 h-4" /> Added!</> :
                 adding ? 'Adding…' : <><Plus className="w-4 h-4" /> Add to Trip</>}
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-3 border-t border-border">
              Create a trip first to add activities.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ActivitySearchPage() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [costRange, setCostRange] = useState(0);
  const [durationRange, setDurationRange] = useState(0);
  const [cityFilter, setCityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(null);
  const [trips, setTrips] = useState([]);
  const [addedIds, setAddedIds] = useState(new Set());
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    api.get('/trips').then(r => setTrips(r.data)).catch(() => {});
  }, []);

  const cities = useMemo(() => ['all', ...new Set(activities.map(a => a.city))], []);

  const filtered = useMemo(() => {
    const cr = COST_RANGES[costRange];
    const dr = DURATION_RANGES[durationRange];
    let result = activities.filter(a => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (cityFilter !== 'all' && a.city !== cityFilter) return false;
      if (a.cost < cr.min || a.cost > cr.max) return false;
      if (a.durationMinutes < dr.min || a.durationMinutes > dr.max) return false;
      if (query) {
        const q = query.toLowerCase();
        return a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) || a.tags?.some(t => t.includes(q));
      }
      return true;
    });
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.cost - b.cost);
    else if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.cost - a.cost);
    else if (sortBy === 'duration') result = [...result].sort((a, b) => a.durationMinutes - b.durationMinutes);
    else if (sortBy === 'rating') result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return result;
  }, [query, typeFilter, costRange, durationRange, cityFilter, sortBy]);

  const activeFilterCount = [
    typeFilter !== 'all', costRange !== 0, durationRange !== 0, cityFilter !== 'all'
  ].filter(Boolean).length;

  const clearFilters = () => {
    setTypeFilter('all'); setCostRange(0); setDurationRange(0); setCityFilter('all'); setQuery('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative bg-secondary px-8 pt-16 pb-24 overflow-hidden border-b border-border/20">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] opacity-30 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-6xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-medium mb-6 backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span className="tracking-wide uppercase">Discover Experiences</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-[Playfair_Display] mb-4 leading-tight">
            Curate Your Next <br/><span className="text-primary italic">Unforgettable</span> Journey
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-xl font-light leading-relaxed">
            Browse {activities.length}+ hand-picked activities across the globe. From cultural tours to adrenaline-pumping adventures, find the perfect addition to your trip.
          </p>
          {/* Search bar */}
          <div className="relative max-w-2xl group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative bg-surface/5 backdrop-blur-xl border border-white/15 p-2 rounded-2xl flex items-center shadow-2xl transition-all focus-within:bg-surface/10 focus-within:border-primary/50">
              <Search className="w-5 h-5 text-white/50 ml-3 flex-shrink-0" />
              <input id="activity-search" type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search by destination, activity, or keyword..."
                className="w-full bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder:text-white/40 text-base" />
              {query && (
                <button onClick={() => setQuery('')} className="p-2 text-white/40 hover:text-white/80 transition-colors mr-1">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex-shrink-0">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 -mt-8 relative z-20">
        {/* Type pills */}
        <div className="bg-surface rounded-2xl border border-border/50 p-3 shadow-xl shadow-black/5 mb-8 flex flex-wrap gap-2 items-center backdrop-blur-md">
          <button onClick={() => setTypeFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${typeFilter === 'all' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface text-foreground border-border hover:border-primary/40'}`}>
            All
          </button>
          {activityTypes.map(t => (
            <button key={t.value} onClick={() => setTypeFilter(t.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${typeFilter === t.value ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface text-foreground border-border hover:border-primary/40'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${showFilters || activeFilterCount > 0 ? 'bg-primary/10 text-primary border-primary/30' : 'bg-surface text-foreground border-border hover:border-primary/40'}`}>
              <SlidersHorizontal className="w-4 h-4" />
              Filters{activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-surface border border-border rounded-2xl p-5 mb-6 animate-[slide-down_0.25s_ease-out]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">City</label>
                <select id="city-filter" value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
                  <option value="all">All Cities</option>
                  {cities.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Cost */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Price Range</label>
                <div className="flex flex-wrap gap-2">
                  {COST_RANGES.map((r, i) => (
                    <button key={i} onClick={() => setCostRange(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${costRange === i ? 'bg-primary text-white border-primary' : 'bg-background text-foreground border-border hover:border-primary/40'}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Duration</label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_RANGES.map((r, i) => (
                    <button key={i} onClick={() => setDurationRange(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${durationRange === i ? 'bg-primary text-white border-primary' : 'bg-background text-foreground border-border hover:border-primary/40'}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="mt-4 text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                <X className="w-3.5 h-3.5" /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results Bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-semibold">{filtered.length}</span> activities found
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            <select id="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="default">Recommended</option>
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>

        {/* Activity Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
            {filtered.map((act, idx) => {
              const isAdded = addedIds.has(act.id);
              return (
                <div key={act.id}
                  className="group rounded-2xl bg-surface border border-border/50 overflow-hidden hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col cursor-pointer animate-[slide-up_0.4s_ease-out]"
                  style={{ animationDelay: `${idx * 40}ms` }}
                  onClick={() => setSelected(act)}>
                  {/* Image */}
                  <div className="h-44 relative overflow-hidden">
                    <img src={act.image} alt={act.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center text-lg">
                      {getActivityIcon(act.type)}
                    </div>
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{act.rating}
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{act.city}
                    </div>
                    {isAdded && (
                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                        <div className="bg-emerald-500 text-white rounded-full p-2 shadow-lg"><Check className="w-5 h-5" /></div>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-widest">{getActivityLabel(act.type)}</span>
                      <span className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />{formatDuration(act.durationMinutes)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">{act.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">{act.description}</p>

                    {act.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                        {act.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted/80 text-muted-foreground border border-border/50">#{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border/60">
                      <div className="flex items-center gap-3 text-sm">
                        <span className={`font-bold text-base ${act.cost === 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                          {act.cost === 0 ? 'Free' : <span className="flex items-center tracking-tight"><DollarSign className="w-4 h-4 text-primary" />{act.cost}</span>}
                        </span>
                      </div>
                      <button
                        id={`add-activity-${act.id}`}
                        onClick={e => { e.stopPropagation(); setSelected(act); }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isAdded ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}>
                        {isAdded ? <><Check className="w-3.5 h-3.5" /> Added</> : <><Plus className="w-3.5 h-3.5" /> Add</>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-surface rounded-2xl border border-border mb-10">
            <Tag className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold text-foreground mb-1">No activities found</p>
            <p className="text-muted-foreground text-sm mb-4">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:brightness-110 transition-all">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {selected && (
        <ActivityModal
          activity={selected}
          trips={trips}
          onClose={() => setSelected(null)}
          onAdd={id => setAddedIds(s => new Set([...s, id]))}
        />
      )}
    </div>
  );
}
