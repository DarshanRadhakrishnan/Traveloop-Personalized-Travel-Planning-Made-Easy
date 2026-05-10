import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatDateShort, getTripStatus, daysBetween } from '@/lib/utils';
import cities from '@/data/cities.json';
import { Plus, MapPin, Calendar, TrendingUp, Globe, Plane, ChevronRight, Star, ArrowRight } from 'lucide-react';

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto min-h-screen bg-[#FFF8F0] space-y-12 animate-[fade-in_0.4s_ease-out]">
      
      {/* Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[40px] leading-tight font-bold font-[Playfair_Display] text-[#0F172A] tracking-tight">
            {getGreeting()},<br />
            <span className="text-[#F59E0B]">{user?.name?.split(' ')[0] || 'Traveler'}</span>
          </h1>
          <p className="text-[15px] text-[#64748B] font-sans mt-2 max-w-md">
            Where will your curiosity take you next? Discover new destinations and build unforgettable itineraries.
          </p>
        </div>
        <button onClick={() => navigate('/trips/new')}
          className="flex items-center gap-2 h-[48px] px-6 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-[14px] font-sans font-semibold transition-all shadow-xl shadow-[#0F172A]/20 hover:shadow-[#0F172A]/30 w-fit">
          <Plus className="w-5 h-5 text-[#F59E0B]" />
          Plan a Journey
        </button>
      </div>

      {/* Main Hero & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editorial Hero Card */}
        <div className="lg:col-span-2 relative h-[320px] rounded-[24px] overflow-hidden group cursor-pointer border-[0.5px] border-[#F0E8DC]" onClick={() => navigate('/search')}>
          <img 
            src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80" 
            alt="Paris" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[12px] font-semibold tracking-wider uppercase mb-3">
              Destination Spotlight
            </span>
            <h2 className="text-[32px] font-[Playfair_Display] font-bold text-white mb-2">The Magic of Paris</h2>
            <p className="text-white/80 font-sans text-[14px] max-w-sm flex items-center gap-2">
              Explore curated activities and iconic sights <ArrowRight className="w-4 h-4" />
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {[
            { label: 'Journeys Taken', value: trips.length, icon: Plane, bg: 'bg-[#F5F0EA]', color: 'text-[#F59E0B]' },
            { label: 'Cities Explored', value: totalCities, icon: MapPin, bg: 'bg-[#E0F2FE]', color: 'text-[#0284C7]' },
            { label: 'Countries Visited', value: totalCountries, icon: Globe, bg: 'bg-[#DCFCE7]', color: 'text-[#16A34A]' },
            { label: 'Total Invested', value: `$${totalSpend.toLocaleString()}`, icon: TrendingUp, bg: 'bg-[#F3E8FF]', color: 'text-[#9333EA]' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-5 p-5 bg-[#FFFFFF] border-[0.5px] border-[#EDE9E4] rounded-[20px] hover:border-[#F59E0B] hover:shadow-sm transition-all duration-300">
              <div className={`w-[48px] h-[48px] rounded-[14px] ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[20px] font-bold text-[#0F172A] leading-tight">{loading ? '—' : stat.value}</p>
                <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-[0.04em] mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Journeys */}
      <section>
        <div className="flex items-end justify-between mb-6 pb-4 border-b border-[#EDE9E4]">
          <h2 className="text-[24px] font-bold font-[Playfair_Display] text-[#0F172A]">Upcoming Journeys</h2>
          <Link to="/trips" className="text-[14px] text-[#F59E0B] font-semibold flex items-center gap-1 hover:text-[#D97706] transition-colors">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-[280px] bg-[#FAFAF9] animate-pulse rounded-[24px] border border-[#EDE9E4]"></div>)}
          </div>
        ) : upcomingTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-[#FFFFFF] border-[0.5px] border-[#EDE9E4] rounded-[24px]">
            <div className="w-[64px] h-[64px] rounded-full bg-[#F5F0EA] flex items-center justify-center mb-4">
              <Plane className="w-8 h-8 text-[#F59E0B]" />
            </div>
            <p className="text-[18px] font-[Playfair_Display] font-bold text-[#0F172A] mb-1">No upcoming trips</p>
            <p className="text-[14px] text-[#64748B] font-sans mb-6">Your passport is waiting for its next stamp.</p>
            <button onClick={() => navigate('/trips/new')} className="h-[44px] px-6 bg-[#F59E0B] hover:bg-[#E8920A] text-white rounded-[12px] font-sans font-semibold transition-colors">
              Start Planning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTrips.map((trip, i) => (
              <Link key={trip.id} to={`/trips/${trip.id}`} className="group bg-[#FFFFFF] border-[0.5px] border-[#EDE9E4] rounded-[24px] overflow-hidden hover:border-[#F59E0B] hover:shadow-xl hover:shadow-[#F59E0B]/5 transition-all duration-300 flex flex-col h-[300px]">
                <div className="h-[160px] relative overflow-hidden bg-[#F5F0EA]">
                  {trip.coverPhoto && (
                    <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[11px] font-bold text-[#0F172A] tracking-wider uppercase shadow-sm">
                      {daysBetween(new Date(), trip.startDate) > 0 ? `In ${daysBetween(new Date(), trip.startDate)} days` : 'Happening Now'}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[18px] font-bold font-[Playfair_Display] text-[#0F172A] mb-1.5 group-hover:text-[#F59E0B] transition-colors line-clamp-1">{trip.name}</h3>
                    <div className="flex items-center gap-2 text-[13px] text-[#64748B] font-sans">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateShort(trip.startDate)} - {formatDateShort(trip.endDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#EDE9E4]">
                    <div className="flex -space-x-2">
                      {(trip.stops || []).slice(0, 4).map((s, idx) => (
                        <div key={s.id} className="w-[32px] h-[32px] rounded-full border-2 border-white bg-[#F5F0EA] flex items-center justify-center text-[14px] shadow-sm z-10" style={{ zIndex: 10 - idx }} title={s.cityName}>
                          {s.flag}
                        </div>
                      ))}
                      {(trip.stops || []).length > 4 && (
                        <div className="w-[32px] h-[32px] rounded-full border-2 border-white bg-[#0F172A] flex items-center justify-center text-[11px] font-bold text-white shadow-sm z-0">
                          +{trip.stops.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-[13px] font-semibold text-[#F59E0B]">View details</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Destinations */}
      <section className="pb-12">
        <div className="flex items-end justify-between mb-6 pb-4 border-b border-[#EDE9E4]">
          <h2 className="text-[24px] font-bold font-[Playfair_Display] text-[#0F172A]">Curated Escapes</h2>
          <Link to="/search" className="text-[14px] text-[#F59E0B] font-semibold flex items-center gap-1 hover:text-[#D97706] transition-colors">
            Explore all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-6 -mx-6 px-6 md:-mx-10 md:px-10 snap-x hide-scrollbar">
          {recommendedCities.map((city) => (
            <div key={city.name} className="flex-shrink-0 w-[220px] group cursor-pointer snap-start" onClick={() => navigate('/search')}>
              <div className="h-[280px] rounded-[24px] overflow-hidden relative mb-4 border-[0.5px] border-[#F0E8DC]">
                <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                  <span className="text-[12px] font-bold text-white">{city.popularity}%</span>
                </div>

                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-[20px] font-bold font-[Playfair_Display] text-white leading-tight mb-1">{city.flag} {city.name}</h3>
                  <div className="flex justify-between items-center text-white/80 text-[13px] font-sans">
                    <span>{city.country}</span>
                    <span className="font-medium text-[#F59E0B]">{'$'.repeat(city.costIndex)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CSS hide scrollbar helper */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
