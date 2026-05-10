import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { formatDateShort, getTripStatus, daysBetween } from '@/lib/utils';
import { Plus, Calendar, MapPin, Trash2, Eye, Edit, LayoutGrid, List, Plane, Search } from 'lucide-react';

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/trips').then(res => setTrips(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/trips/${deleteId}`);
      setTrips(t => t.filter(trip => trip.id !== deleteId));
      setDeleteId(null);
    } catch (err) { console.error(err); }
  };

  const filtered = trips.filter(t => {
    const status = getTripStatus(t.startDate, t.endDate);
    if (filter !== 'all' && status !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    past: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <div className="p-8 md:p-12 lg:p-16 max-w-7xl mx-auto animate-[fade-in_0.3s_ease-out] w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold font-[Playfair_Display] text-foreground mb-2">My Trips</h1>
          <p className="text-lg text-muted-foreground">{trips.length} trips planned</p>
        </div>
        <button onClick={() => navigate('/trips/new')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-lg rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 w-full md:w-auto">
          <Plus className="w-5 h-5" /> New Trip
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trips..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-surface text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm" />
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1 overflow-x-auto">
          {['all', 'upcoming', 'active', 'past'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-base whitespace-nowrap font-medium transition-colors ${filter === f ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1 self-start xl:self-auto">
          <button onClick={() => setView('grid')} className={`p-2.5 rounded-lg ${view === 'grid' ? 'bg-surface shadow-sm' : ''}`}><LayoutGrid className="w-5 h-5" /></button>
          <button onClick={() => setView('list')} className={`p-2.5 rounded-lg ${view === 'list' ? 'bg-surface shadow-sm' : ''}`}><List className="w-5 h-5" /></button>
        </div>
      </div>

      {loading ? (
        <div className={`grid ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 skeleton rounded-2xl"></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <Plane className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-xl font-semibold text-foreground mb-2">{search || filter !== 'all' ? 'No matching trips' : 'No trips yet'}</p>
          <p className="text-muted-foreground mb-6">Start your journey by creating your first trip!</p>
          <button onClick={() => navigate('/trips/new')} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className={`grid ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
          {filtered.map((trip) => {
            const status = getTripStatus(trip.startDate, trip.endDate);
            const days = daysBetween(trip.startDate, trip.endDate);
            return (
              <div key={trip.id} className={`group rounded-2xl bg-surface border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 ${view === 'list' ? 'flex' : ''}`}>
                <div className={`${view === 'list' ? 'w-48 flex-shrink-0' : 'h-40'} bg-gradient-to-br from-amber-400/20 to-orange-400/20 relative overflow-hidden`}>
                  {trip.coverPhoto && <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[status]}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                <div className="p-4 flex-1">
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors text-lg">{trip.name}</h3>
                  {trip.description && <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{trip.description}</p>}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDateShort(trip.startDate)} — {formatDateShort(trip.endDate)}</span>
                    <span>•</span>
                    <span>{days} days</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{trip._count?.stops || 0} cities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/trips/${trip.id}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                    <Link to={`/trips/${trip.id}/edit`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button onClick={() => setDeleteId(trip.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md border border-border shadow-2xl animate-[scale-in_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Trip?</h3>
            <p className="text-muted-foreground mb-6">This action cannot be undone. All stops, activities, and notes will be permanently deleted.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
