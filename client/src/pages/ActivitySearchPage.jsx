import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import activities from '@/data/activities.json';
import { Search, MapPin, DollarSign, Clock, Plus, Filter, Tag } from 'lucide-react';
import { getActivityIcon, activityTypes } from '@/lib/utils';

export default function ActivitySearchPage() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();

  const filtered = activities.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (query && !a.name.toLowerCase().includes(query.toLowerCase()) && !a.city.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <h1 className="text-3xl font-bold font-[Playfair_Display] text-foreground mb-2">Find Activities</h1>
      <p className="text-muted-foreground mb-6">Discover things to do at your destinations</p>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search activities or cities..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setTypeFilter('all')}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${typeFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface text-foreground border-border hover:border-primary/50'}`}>
            All
          </button>
          {activityTypes.map(t => (
            <button key={t.value} onClick={() => setTypeFilter(t.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${typeFilter === t.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface text-foreground border-border hover:border-primary/50'}`}>
              <span className="text-base">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map((act, idx) => (
          <div key={act.id} className="group rounded-2xl bg-surface border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col animate-[slide-up_0.4s_ease-out]"
            style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="h-40 relative overflow-hidden">
              <img src={act.image} alt={act.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-lg">
                {getActivityIcon(act.type)}
              </div>
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {act.city}
              </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{act.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{act.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                <div className="flex items-center gap-3 text-sm font-medium">
                  <span className={`flex items-center gap-0.5 ${act.cost === 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                    {act.cost === 0 ? 'Free' : <><DollarSign className="w-3.5 h-3.5" />{act.cost}</>}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" /> {act.durationMinutes}m
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border mt-4">
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-xl font-semibold text-foreground">No activities found</p>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
