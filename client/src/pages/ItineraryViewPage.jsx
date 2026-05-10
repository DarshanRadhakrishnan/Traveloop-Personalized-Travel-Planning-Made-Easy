import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import { formatDateShort, daysBetween, getActivityIcon, getTripStatus } from '@/lib/utils';
import { ArrowLeft, Edit, Share2, Calendar, MapPin, Clock, DollarSign, Eye, List, Map as MapIcon, Wallet, ListChecks, StickyNote } from 'lucide-react';

export default function ItineraryViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');

  useEffect(() => {
    api.get(`/trips/${id}`).then(res => setTrip(res.data)).catch(() => navigate('/trips')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="p-8 space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="h-48 skeleton rounded-2xl"></div>
      {[1,2,3].map(i => <div key={i} className="h-32 skeleton rounded-2xl"></div>)}
    </div>
  );
  if (!trip) return null;

  const totalCost = (trip.stops || []).reduce((sum, s) => sum + (s.activities || []).reduce((a, act) => a + (act.cost || 0), 0), 0);
  const totalDays = daysBetween(trip.startDate, trip.endDate);
  const status = getTripStatus(trip.startDate, trip.endDate);
  const cityColors = ['bg-amber-400', 'bg-emerald-400', 'bg-blue-400', 'bg-purple-400', 'bg-rose-400', 'bg-teal-400', 'bg-orange-400'];

  return (
    <div className="p-8 max-w-5xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <button onClick={() => navigate('/trips')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Trips
      </button>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <div className="h-56 bg-gradient-to-br from-amber-400/30 to-orange-400/30">
          {trip.coverPhoto && <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover" />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-bold font-[Playfair_Display] text-white mb-2">{trip.name}</h1>
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDateShort(trip.startDate)} — {formatDateShort(trip.endDate)}</span>
            <span>{totalDays} days</span>
            <span>{(trip.stops || []).length} cities</span>
            <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />${totalCost}</span>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <Link to={`/trips/${id}/edit`} className="px-3 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-1.5">
            <Edit className="w-4 h-4" /> Edit
          </Link>
          <button className="px-3 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-1.5">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Link to={`/trips/${id}/edit`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors text-sm">
          <Edit className="w-4 h-4" /> Edit Itinerary
        </Link>
        <Link to={`/trips/${id}/budget`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground font-medium hover:border-primary/30 transition-colors text-sm">
          <Wallet className="w-4 h-4" /> Budget
        </Link>
        <Link to={`/trips/${id}/checklist`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground font-medium hover:border-primary/30 transition-colors text-sm">
          <ListChecks className="w-4 h-4" /> Checklist
        </Link>
        <Link to={`/trips/${id}/notes`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground font-medium hover:border-primary/30 transition-colors text-sm">
          <StickyNote className="w-4 h-4" /> Notes
        </Link>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          <button onClick={() => setView('list')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'list' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            <List className="w-4 h-4" /> List
          </button>
          <button onClick={() => setView('timeline')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'timeline' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            <MapIcon className="w-4 h-4" /> Timeline
          </button>
        </div>

        {/* City flags */}
        <div className="flex gap-2 ml-auto">
          {(trip.stops || []).map((s, i) => (
            <span key={s.id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface border border-border text-sm">
              <span className={`w-2 h-2 rounded-full ${cityColors[i % cityColors.length]}`}></span>
              {s.flag} {s.cityName}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline View */}
      {view === 'timeline' && (
        <div className="overflow-x-auto pb-4 -mx-2 px-2">
          <div className="flex gap-1 min-w-max">
            {(trip.stops || []).map((stop, stopIdx) => {
              const stopDays = daysBetween(stop.arrivalDate, stop.departureDate);
              return Array.from({ length: stopDays }, (_, dayIdx) => (
                <div key={`${stop.id}-${dayIdx}`}
                  className={`w-32 flex-shrink-0 rounded-xl p-3 border border-border ${cityColors[stopIdx % cityColors.length].replace('bg-', 'bg-')}/10`}
                  style={{ backgroundColor: `var(--surface)`, borderLeftColor: cityColors[stopIdx % cityColors.length].includes('amber') ? '#F59E0B' : cityColors[stopIdx % cityColors.length].includes('emerald') ? '#10B981' : cityColors[stopIdx % cityColors.length].includes('blue') ? '#3B82F6' : '#A855F7', borderLeftWidth: '3px' }}>
                  <p className="text-xs text-muted-foreground mb-1">Day {dayIdx + 1}</p>
                  <p className="text-sm font-medium text-foreground mb-2">{stop.flag} {stop.cityName}</p>
                  {(stop.activities || []).filter((_, idx) => idx % stopDays === dayIdx).map(act => (
                    <div key={act.id} className="flex items-center gap-1 text-xs text-muted-foreground py-1">
                      <span>{getActivityIcon(act.type)}</span>
                      <span className="truncate">{act.name}</span>
                    </div>
                  ))}
                </div>
              ));
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-6">
          {(trip.stops || []).map((stop, idx) => (
            <div key={stop.id} className="animate-[slide-up_0.4s_ease-out]" style={{ animationDelay: `${idx * 100}ms` }}>
              {/* City header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${cityColors[idx % cityColors.length]}/20 flex items-center justify-center text-xl`}>
                  {stop.flag || '📍'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{stop.cityName}, {stop.country}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDateShort(stop.arrivalDate)} — {formatDateShort(stop.departureDate)} • {daysBetween(stop.arrivalDate, stop.departureDate)} days
                  </p>
                </div>
                <div className="ml-auto text-sm font-medium text-primary">
                  ${(stop.activities || []).reduce((s, a) => s + (a.cost || 0), 0)}
                </div>
              </div>

              {/* Activities */}
              <div className="ml-5 pl-8 border-l-2 border-border space-y-3 pb-4">
                {(stop.activities || []).map(act => (
                  <div key={act.id} className="relative flex items-start gap-4 p-4 rounded-xl bg-surface border border-border hover:border-primary/20 transition-colors group">
                    <div className="absolute -left-[2.85rem] w-6 h-6 rounded-full bg-surface border-2 border-border flex items-center justify-center text-sm">
                      {getActivityIcon(act.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{act.name}</h4>
                      {act.description && <p className="text-sm text-muted-foreground mt-0.5">{act.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {act.startTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{act.startTime}</span>}
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{act.durationMinutes} min</span>
                        {act.cost > 0 && <span className="flex items-center gap-1 text-primary font-medium"><DollarSign className="w-3 h-3" />${act.cost}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total Cost Footer */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Trip Cost</p>
            <p className="text-3xl font-bold text-foreground">${totalCost}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Average per day</p>
            <p className="text-xl font-semibold text-foreground">${totalDays > 0 ? Math.round(totalCost / totalDays) : 0}/day</p>
          </div>
        </div>
      </div>
    </div>
  );
}
