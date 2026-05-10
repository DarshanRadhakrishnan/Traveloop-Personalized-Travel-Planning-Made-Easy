import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatDateShort, daysBetween } from '@/lib/utils';
import {
  Search, Globe, Calendar, MapPin, Copy, Users,
  SlidersHorizontal, Filter, ArrowUpDown, ChevronDown, Plane, Heart
} from 'lucide-react';

export default function CommunityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cloning, setCloning] = useState(null);

  // Toolbar state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterCountry, setFilterCountry] = useState('');
  const [showDropdown, setShowDropdown] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get('/trips/community', { params: { search: searchQuery || undefined, sort: sortBy === 'newest' ? undefined : sortBy } })
      .then(res => setTrips(res.data))
      .catch(() => setError('Failed to load community trips'))
      .finally(() => setLoading(false));
  }, [searchQuery, sortBy]);

  // Get unique countries for filter
  const countries = useMemo(() => {
    const all = trips.flatMap(t => (t.stops || []).map(s => s.country));
    return [...new Set(all)].sort();
  }, [trips]);

  // Apply country filter client-side
  const filteredTrips = useMemo(() => {
    if (!filterCountry) return trips;
    return trips.filter(t => (t.stops || []).some(s => s.country === filterCountry));
  }, [trips, filterCountry]);

  // Sort client-side for extra options
  const sortedTrips = useMemo(() => {
    let result = [...filteredTrips];
    if (sortBy === 'stops') result.sort((a, b) => (b._count?.stops || 0) - (a._count?.stops || 0));
    return result;
  }, [filteredTrips, sortBy]);

  const cloneTrip = async (tripId, e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    setCloning(tripId);
    try {
      const res = await api.post(`/trips/${tripId}/clone`);
      navigate(`/trips/${res.data.id}/edit`);
    } catch (err) {
      console.error(err);
      setCloning(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-[Playfair_Display] text-foreground">Community</h1>
        </div>
        <p className="text-muted-foreground text-lg">Discover and copy amazing trip itineraries shared by fellow travelers.</p>
      </div>

      {/* Search & Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-2xl bg-surface border border-border">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search trips, destinations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>

        {/* Filter by Country */}
        <div className="relative">
          <button onClick={() => setShowDropdown(showDropdown === 'filter' ? null : 'filter')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Filter className="w-3.5 h-3.5" /> {filterCountry || 'Country'} <ChevronDown className="w-3 h-3" />
          </button>
          {showDropdown === 'filter' && (
            <div className="absolute top-full mt-1 right-0 z-20 bg-surface border border-border rounded-xl shadow-xl p-1 min-w-[160px] max-h-60 overflow-y-auto animate-[scale-in_0.15s_ease-out]">
              <button onClick={() => { setFilterCountry(''); setShowDropdown(null); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filterCountry ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}`}>
                All Countries
              </button>
              {countries.map(c => (
                <button key={c} onClick={() => { setFilterCountry(c); setShowDropdown(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterCountry === c ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}`}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button onClick={() => setShowDropdown(showDropdown === 'sort' ? null : 'sort')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort <ChevronDown className="w-3 h-3" />
          </button>
          {showDropdown === 'sort' && (
            <div className="absolute top-full mt-1 right-0 z-20 bg-surface border border-border rounded-xl shadow-xl p-1 min-w-[160px] animate-[scale-in_0.15s_ease-out]">
              {[['newest', 'Newest First'], ['oldest', 'Oldest First'], ['name', 'Alphabetical'], ['stops', 'Most Cities']].map(([val, label]) => (
                <button key={val} onClick={() => { setSortBy(val); setShowDropdown(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === val ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 skeleton rounded-2xl"></div>)}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && sortedTrips.length === 0 && (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold text-foreground mb-2">No public trips found</p>
          <p className="text-muted-foreground">{searchQuery ? 'Try a different search term' : 'Be the first to share a trip!'}</p>
        </div>
      )}

      {/* Trip Cards Grid */}
      {!loading && !error && sortedTrips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTrips.map((trip, idx) => {
            const days = daysBetween(trip.startDate, trip.endDate);
            const stopCount = trip._count?.stops || (trip.stops || []).length;
            return (
              <div key={trip.id}
                onClick={() => navigate(`/trip/${trip.id}/public`)}
                className="group rounded-2xl bg-surface border border-border overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 animate-[slide-up_0.4s_ease-out]"
                style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'backwards' }}>

                {/* Cover */}
                <div className="h-44 bg-gradient-to-br from-amber-400/20 via-orange-300/10 to-rose-400/20 relative overflow-hidden">
                  {trip.coverPhoto && (
                    <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-md text-white border border-white/10">
                      <Globe className="w-3 h-3 inline mr-1" />Public
                    </span>
                  </div>
                  {/* City flags */}
                  <div className="absolute bottom-3 left-3 flex gap-1">
                    {(trip.stops || []).slice(0, 5).map(s => (
                      <span key={s.id} className="text-lg drop-shadow-md" title={s.cityName}>{s.flag}</span>
                    ))}
                    {(trip.stops || []).length > 5 && <span className="text-xs text-white/80 self-center ml-1">+{(trip.stops || []).length - 5}</span>}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">{trip.name}</h3>

                  {/* Author */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {trip.user?.name?.charAt(0) || '?'}
                    </div>
                    <span className="text-xs text-muted-foreground">{trip.user?.name || 'Traveler'}</span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDateShort(trip.startDate)}</span>
                    <span>•</span>
                    <span>{days} days</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{stopCount} cities</span>
                  </div>

                  {/* Copy button */}
                  <button onClick={(e) => cloneTrip(trip.id, e)} disabled={cloning === trip.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                    {cloning === trip.id ? (
                      <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy This Trip</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
