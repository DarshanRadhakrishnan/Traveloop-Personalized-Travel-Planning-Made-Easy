import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cities from '@/data/cities.json';
import { Search, MapPin, Star, Filter } from 'lucide-react';

export default function CitySearchPage() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('all');
  const navigate = useNavigate();

  const regions = ['all', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'];

  const filtered = cities.filter(c => {
    if (region !== 'all' && c.region !== region) return false;
    if (query && !c.name.toLowerCase().includes(query.toLowerCase()) && !c.country.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <h1 className="text-3xl font-bold font-[Playfair_Display] text-foreground mb-2">Explore Destinations</h1>
      <p className="text-muted-foreground mb-6">Discover amazing places around the world</p>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search cities or countries..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg" />
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          {regions.map(r => (
            <button key={r} onClick={() => setRegion(r)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${region === r ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {r === 'all' ? '🌍 All' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((city, idx) => (
          <div key={city.name} className="group rounded-2xl bg-surface border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer animate-[slide-up_0.4s_ease-out]"
            style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="h-44 relative overflow-hidden">
              <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                {city.region}
              </div>
              <div className="absolute bottom-3 left-3">
                <p className="text-white text-lg font-semibold">{city.flag} {city.name}</p>
                <p className="text-white/70 text-sm">{city.country}</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{city.popularity}% popular</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{'$'.repeat(city.costIndex)}<span className="text-muted-foreground">{'$'.repeat(4 - city.costIndex)}</span></span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-xl font-semibold text-foreground">No destinations found</p>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
