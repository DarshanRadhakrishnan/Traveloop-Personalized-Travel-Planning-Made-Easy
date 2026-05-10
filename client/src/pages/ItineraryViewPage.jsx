import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import { formatDateShort, daysBetween, getActivityIcon, getTripStatus } from '@/lib/utils';
import { ArrowLeft, Edit, Share2, Calendar, MapPin, Clock, DollarSign, List, Map as MapIcon, Wallet, ChevronDown, ChevronUp, Plane } from 'lucide-react';

const parseMeta = (desc) => {
  try { return desc ? JSON.parse(desc) : {}; }
  catch (e) { return {}; }
};

const getTypeColor = (type) => {
  if (type === 'food') return 'border-amber-500 bg-amber-500';
  if (type === 'adventure') return 'border-coral-500 bg-coral-500';
  if (type === 'culture') return 'border-teal-500 bg-teal-500';
  if (type === 'transport') return 'border-gray-400 bg-gray-400';
  return 'border-primary bg-primary'; // sightseeing
};

export default function ItineraryViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('timeline');
  const [toast, setToast] = useState('');
  const [collapsedCities, setCollapsedCities] = useState({});

  useEffect(() => {
    api.get(`/trips/${id}`).then(res => setTrip(res.data)).catch(() => navigate('/trips')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 space-y-6 animate-[fade-in_0.3s_ease-out]"><div className="h-48 skeleton rounded-2xl"></div></div>;
  if (!trip) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast('Link copied! 🔗');
    setTimeout(() => setToast(''), 3000);
  };

  const emoji = trip.coverPhoto && trip.coverPhoto.length < 5 ? trip.coverPhoto : '✈️';
  const totalDays = daysBetween(trip.startDate, trip.endDate);
  const totalCost = (trip.stops || []).reduce((sum, s) => sum + (s.activities || []).reduce((a, act) => a + (act.cost || 0), 0), 0);
  const totalActivities = (trip.stops || []).reduce((sum, s) => sum + (s.activities || []).length, 0);

  // Re-map activities into Days for Timeline and Summary
  const daysMap = [];
  let currentDayOffset = 0;
  const allActivitiesFlat = [];

  (trip.stops || []).forEach((stop, stopIdx) => {
    const stopDays = daysBetween(stop.arrivalDate, stop.departureDate) || 1;
    for (let i = 0; i < stopDays; i++) {
      const acts = (stop.activities || []).filter(a => (parseMeta(a.description).day || 0) === i);
      acts.forEach(a => allActivitiesFlat.push({ ...a, stop }));
      
      const date = new Date(stop.arrivalDate);
      date.setDate(date.getDate() + i);
      
      daysMap.push({
        absoluteDay: currentDayOffset + 1,
        date: date,
        stop: stop,
        activities: acts,
        isTransition: i === 0 && stopIdx > 0,
        prevStop: i === 0 && stopIdx > 0 ? trip.stops[stopIdx - 1] : null
      });
      currentDayOffset++;
    }
  });

  const getPace = (count) => {
    if (count < 3) return { label: 'Relaxed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    if (count <= 4) return { label: 'Moderate', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
    return { label: 'Packed', color: 'bg-coral-100 text-coral-700 dark:bg-coral-900/30 dark:text-coral-400' };
  };

  // For Summary Mode
  const typeCounts = {};
  allActivitiesFlat.forEach(a => { typeCounts[a.type] = (typeCounts[a.type] || 0) + (a.cost || 0); });
  const sortedActivities = [...allActivitiesFlat].sort((a, b) => (b.cost || 0) - (a.cost || 0)).slice(0, 3);
  
  // Donut chart logic
  let dashOffset = 0;
  const chartRadius = 40;
  const chartCircumference = 2 * Math.PI * chartRadius;

  const toggleCity = (id) => setCollapsedCities(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="flex flex-col h-screen bg-background animate-[fade-in_0.3s_ease-out] overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-foreground text-background rounded-full font-medium shadow-lg animate-[slide-down_0.3s_ease-out]">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-surface z-10 p-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              <Link to={`/trips/${id}/edit`} className="p-2 bg-muted text-foreground rounded-xl hover:bg-border transition-colors"><Edit className="w-4 h-4" /></Link>
              <button onClick={handleShare} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"><Share2 className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 px-2">
            <div className="text-5xl">{emoji}</div>
            <div>
              <h1 className="text-2xl font-bold font-[Playfair_Display] text-foreground">{trip.name}</h1>
            </div>
          </div>

          <div className="flex bg-muted/50 p-1 rounded-2xl w-full">
            {[
              { id: 'timeline', icon: MapIcon, label: 'Timeline' },
              { id: 'city', icon: List, label: 'By City' },
              { id: 'summary', icon: Wallet, label: 'Summary' }
            ].map(m => (
              <button key={m.id} onClick={() => setView(m.id)}
                className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  view === m.id ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}>
                <m.icon className="w-4 h-4" /> {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-32 pt-4">
        <div className="max-w-3xl mx-auto px-4 space-y-8">
          
          {/* TIMELINE MODE */}
          {view === 'timeline' && daysMap.map((day, idx) => (
            <div key={idx} className="relative">
              {day.isTransition && (
                <div className="mb-6 p-4 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center gap-4 text-muted-foreground italic">
                  <Plane className="w-6 h-6 rotate-45" />
                  <span className="font-medium">Travelling from {day.prevStop?.cityName} to {day.stop.cityName}</span>
                </div>
              )}
              
              <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md py-3 flex items-center justify-between border-b border-border mb-4">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  Day {day.absoluteDay} <span className="text-muted-foreground font-normal text-sm">· {formatDateShort(day.date.toISOString())} · {day.stop.cityName} {day.stop.flag}</span>
                </h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getPace(day.activities.length).color}`}>
                  {getPace(day.activities.length).label}
                </span>
              </div>

              <div className="pl-4 pb-6 relative">
                <div className="absolute left-8 top-4 bottom-0 w-px bg-border -z-10"></div>
                
                {day.activities.sort((a,b) => (a.startTime||'').localeCompare(b.startTime||'')).map((act, i) => (
                  <div key={act.id} className="flex gap-4 mb-4 animate-[slide-up_0.3s_ease-out]" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="w-10 pt-4 text-xs font-mono text-muted-foreground text-right shrink-0">{act.startTime || '??:??'}</div>
                    <div className="relative pt-4 flex-1">
                      <div className={`absolute -left-[1.3rem] top-5 w-3 h-3 rounded-full border-2 border-background ${getTypeColor(act.type).split(' ')[1]}`}></div>
                      <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-foreground text-sm">{act.name}</h4>
                          <span className="text-emerald-500 font-bold text-sm ml-2">${act.cost}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md font-semibold uppercase">{act.type}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3"/> {day.stop.cityName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {day.activities.length === 0 && (
                  <div className="pl-14 py-4 text-sm text-muted-foreground italic">No activities planned.</div>
                )}
              </div>
              
              <div className="text-right border-t border-border pt-3">
                <span className="text-sm font-bold text-foreground">Day Total: <span className="text-emerald-500">${day.activities.reduce((s,a) => s + (a.cost||0), 0)}</span></span>
              </div>
            </div>
          ))}

          {/* BY CITY MODE */}
          {view === 'city' && (trip.stops || []).map((stop, i) => {
            const stopActs = stop.activities || [];
            const stopCost = stopActs.reduce((s,a) => s + (a.cost||0), 0);
            const isCollapsed = collapsedCities[stop.id];
            
            return (
              <div key={stop.id} className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm mb-6 animate-[slide-up_0.3s_ease-out]" style={{ animationDelay: `${i * 100}ms` }}>
                <button onClick={() => toggleCity(stop.id)} className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 text-left">
                    <span className="text-4xl">{stop.flag || '📍'}</span>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{stop.cityName}</h3>
                      <p className="text-sm text-muted-foreground">{stop.country} · {daysBetween(stop.arrivalDate, stop.departureDate)} nights</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-500 font-bold">${stopCost}</span>
                    <div className={`p-2 rounded-full bg-muted transition-transform ${isCollapsed ? 'rotate-180' : ''}`}>
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </button>
                
                {!isCollapsed && (
                  <div className="px-5 pb-5 border-t border-border pt-4 bg-background/50">
                    <div className="space-y-3">
                      {stopActs.sort((a,b) => (a.startTime||'').localeCompare(b.startTime||'')).map(act => (
                        <div key={act.id} className="flex justify-between items-center p-3 rounded-xl bg-surface border border-border">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{getActivityIcon(act.type)}</span>
                            <div>
                              <p className="font-bold text-sm text-foreground">{act.name}</p>
                              <p className="text-xs text-muted-foreground">{act.startTime} · <span className="uppercase">{act.type}</span></p>
                            </div>
                          </div>
                          <span className="font-bold text-emerald-500 text-sm">${act.cost}</span>
                        </div>
                      ))}
                      {stopActs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No activities planned here.</p>}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm font-medium text-muted-foreground">
                      <span>{stopActs.length} activities</span>
                      <span>Subtotal: ${stopCost}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* SUMMARY MODE */}
          {view === 'summary' && (
            <div className="space-y-6 animate-[fade-in_0.4s_ease-out]">
              {/* Trip Overview */}
              <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-6 flex flex-col items-center text-center">
                <span className="text-6xl mb-4 drop-shadow-md">{emoji}</span>
                <h2 className="text-2xl font-bold font-[Playfair_Display] mb-2">{trip.name}</h2>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4"/> {formatDateShort(trip.startDate)} — {formatDateShort(trip.endDate)}
                </p>
                <div className="flex gap-4 mt-6">
                  <div className="bg-surface border border-border px-4 py-2 rounded-xl"><span className="font-bold text-foreground">{totalDays}</span> <span className="text-muted-foreground text-xs uppercase">Days</span></div>
                  <div className="bg-surface border border-border px-4 py-2 rounded-xl"><span className="font-bold text-foreground">{(trip.stops||[]).length}</span> <span className="text-muted-foreground text-xs uppercase">Cities</span></div>
                  <div className="bg-surface border border-border px-4 py-2 rounded-xl"><span className="font-bold text-foreground">{totalActivities}</span> <span className="text-muted-foreground text-xs uppercase">Acts</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Budget Donut Chart */}
                <div className="bg-surface border border-border rounded-3xl p-6">
                  <h3 className="font-bold text-lg mb-6">Budget Breakdown</h3>
                  {totalCost > 0 ? (
                    <div className="flex flex-col items-center">
                      <div className="relative w-40 h-40 mb-6">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          {Object.entries(typeCounts).map(([type, amount], i) => {
                            const percent = amount / totalCost;
                            const dashArray = percent * chartCircumference;
                            const currentOffset = dashOffset;
                            dashOffset += dashArray;
                            
                            let color = '#3B82F6'; // default
                            if (type === 'food') color = '#F59E0B';
                            if (type === 'adventure') color = '#F43F5E';
                            if (type === 'culture') color = '#14B8A6';
                            
                            return (
                              <circle key={type} cx="50" cy="50" r={chartRadius} fill="none"
                                stroke={color} strokeWidth="16"
                                strokeDasharray={`${dashArray} ${chartCircumference}`}
                                strokeDashoffset={-currentOffset}
                                className="transition-all duration-1000 ease-out"
                              />
                            );
                          })}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-bold text-foreground">${totalCost}</span>
                          <span className="text-xs text-muted-foreground">Total</span>
                        </div>
                      </div>
                      <div className="w-full flex flex-wrap justify-center gap-3">
                        {Object.entries(typeCounts).filter(([_,v])=>v>0).map(([type, val]) => (
                          <div key={type} className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                            <span className={`w-2.5 h-2.5 rounded-full ${getTypeColor(type).split(' ')[1]}`}></span>
                            {type} (${val})
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-muted-foreground">No costs recorded</div>
                  )}
                </div>

                {/* Per City Cost */}
                <div className="bg-surface border border-border rounded-3xl p-6">
                  <h3 className="font-bold text-lg mb-6">City Expenses</h3>
                  <div className="space-y-4">
                    {(trip.stops || []).map(stop => {
                      const cost = (stop.activities || []).reduce((s,a)=>s+(a.cost||0),0);
                      const percent = totalCost > 0 ? (cost / totalCost) * 100 : 0;
                      return (
                        <div key={stop.id}>
                          <div className="flex justify-between text-sm font-bold mb-1.5">
                            <span className="flex items-center gap-1.5">{stop.flag} {stop.cityName}</span>
                            <span className="text-emerald-500">${cost}</span>
                          </div>
                          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Splurges */}
              {sortedActivities.length > 0 && (
                <div className="bg-surface border border-border rounded-3xl p-6">
                  <h3 className="font-bold text-lg mb-4">Top Splurges 💸</h3>
                  <div className="space-y-3">
                    {sortedActivities.map((act, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-xs">{i+1}</div>
                          <div>
                            <p className="font-bold text-sm text-foreground">{act.name}</p>
                            <p className="text-xs text-muted-foreground">{act.stop.cityName}</p>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-500">${act.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>

      {/* Sticky Bottom Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border z-30 pb-safe">
        <div className="max-w-3xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-6 text-sm font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {totalDays}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {(trip.stops||[]).length}</span>
            <span className="flex items-center gap-1.5"><List className="w-4 h-4"/> {totalActivities}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</span>
            <span className="text-2xl font-bold text-foreground">${totalCost}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
