import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatDateShort, getTripStatus, daysBetween } from '@/lib/utils';
import cities from '@/data/cities.json';
import { Plus, MapPin, Calendar, TrendingUp, Globe, Plane, ChevronRight, Star } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/trips').then(res => setTrips(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const upcomingTrips = trips.filter(t => getTripStatus(t.startDate, t.endDate) !== 'past').slice(0, 3);
  const totalSpend = trips.reduce((sum, t) => {
    if (!t.stops) return sum;
    return sum + t.stops.reduce((s, stop) => s + (stop.activities || []).reduce((a, act) => a + (act?.cost || 0), 0), 0);
  }, 0);
  const totalCities = [...new Set(trips.flatMap(t => (t.stops || []).map(s => s.cityName)))].length;
  const totalCountries = [...new Set(trips.flatMap(t => (t.stops || []).map(s => s.country)))].length;

  const recommendedCities = cities.sort((a, b) => b.popularity - a.popularity).slice(0, 8);

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    past: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Hero CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 p-8 text-white shadow-xl shadow-amber-500/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 blur-xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-[Playfair_Display] mb-2">Ready for your next trip?</h1>
            <p className="text-amber-50 text-lg max-w-lg">Create a personalized itinerary, track your budget, and share your adventures with the world.</p>
          </div>
          <button onClick={() => navigate('/trips/new')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-amber-600 rounded-xl font-semibold hover:bg-amber-50 transition-all shadow-lg animate-[pulse-gentle_2s_ease-in-out_infinite] flex-shrink-0">
            <Plus className="w-5 h-5" />
            Plan New Trip
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Trips', value: trips.length, icon: Plane, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Cities Visited', value: totalCities, icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Countries', value: totalCountries, icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Total Spend', value: `$${totalSpend.toLocaleString()}`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all duration-200 animate-[slide-up_0.4s_ease-out]">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Trips */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-[Playfair_Display] text-foreground">Upcoming Trips</h2>
          <Link to="/trips" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 skeleton rounded-2xl"></div>
            ))}
          </div>
        ) : upcomingTrips.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-2xl border border-border">
            <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">No trips yet</p>
            <p className="text-muted-foreground mb-6">Start planning your first adventure!</p>
            <button onClick={() => navigate('/trips/new')}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
              Create Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingTrips.map((trip, i) => {
              const status = getTripStatus(trip.startDate, trip.endDate);
              const days = daysBetween(trip.startDate, trip.endDate);
              return (
                <Link key={trip.id} to={`/trips/${trip.id}`}
                  className="group rounded-2xl bg-surface border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                  style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="h-40 bg-gradient-to-br from-amber-400/20 to-orange-400/20 relative overflow-hidden">
                    {trip.coverPhoto && (
                      <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[status]}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{trip.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDateShort(trip.startDate)}</span>
                      <span>•</span>
                      <span>{days} days</span>
                      <span>•</span>
                      <span>{trip._count?.stops || trip.stops?.length || 0} cities</span>
                    </div>
                    <div className="flex gap-1 mt-3">
                      {(trip.stops || []).slice(0, 4).map(s => (
                        <span key={s.id} className="text-sm" title={s.cityName}>{s.flag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recommended Destinations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-[Playfair_Display] text-foreground">Recommended Destinations</h2>
          <Link to="/search" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            Explore all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x">
          {recommendedCities.map((city) => (
            <div key={city.name} className="flex-shrink-0 w-48 group cursor-pointer snap-start" onClick={() => navigate('/search')}>
              <div className="h-32 rounded-2xl overflow-hidden mb-2 relative">
                <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-2 left-3 right-3">
                  <p className="text-white text-sm font-medium">{city.flag} {city.name}</p>
                  <p className="text-white/70 text-xs">{city.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{city.popularity}% popular</span>
                <span className="ml-auto font-medium text-foreground">{'$'.repeat(city.costIndex)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
