import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { daysBetween, formatDateShort, activityTypes } from '@/lib/utils';
import { Plus, ArrowLeft, Trash2, MapPin, X, Wallet, Calendar as CalIcon } from 'lucide-react';

const SUGGESTIONS = {
  'Paris': [
    { name: 'Eiffel Tower', type: 'sightseeing', cost: 30, emoji: '🗼' }, 
    { name: 'Louvre Museum', type: 'culture', cost: 20, emoji: '🖼️' }, 
    { name: 'Seine Cruise', type: 'relax', cost: 15, emoji: '⛴️' }
  ],
  'Tokyo': [
    { name: 'Shibuya Crossing', type: 'sightseeing', cost: 0, emoji: '🚶' }, 
    { name: 'Sushi at Tsukiji', type: 'food', cost: 40, emoji: '🍣' }, 
    { name: 'Senso-ji Temple', type: 'culture', cost: 0, emoji: '⛩️' }
  ],
  'default': [
    { name: 'City Walking Tour', type: 'sightseeing', cost: 0, emoji: '🚶' }, 
    { name: 'Local Market', type: 'shopping', cost: 20, emoji: '🛍️' }, 
    { name: 'Dinner at local spot', type: 'food', cost: 30, emoji: '🍽️' }
  ]
};

const parseMeta = (desc) => {
  try { return desc ? JSON.parse(desc) : {}; }
  catch (e) { return {}; }
};

const getTypeColors = (type) => {
  const t = (type || '').toLowerCase();
  if (t === 'sightseeing') return 'bg-[var(--purple)] text-[var(--purple)] pill-bg-[var(--purple-soft)]';
  if (t === 'food') return 'bg-[var(--amber)] text-[var(--amber)] pill-bg-[var(--amber-soft)]';
  if (t === 'adventure') return 'bg-[var(--coral)] text-[var(--coral)] pill-bg-[var(--coral-soft)]';
  if (t === 'culture') return 'bg-[var(--green)] text-[var(--green)] pill-bg-[var(--green-soft)]';
  return 'bg-[var(--text-muted)] text-[var(--text-muted)] pill-bg-[var(--bg-input)]'; 
};

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActId, setEditingActId] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'sightseeing', cost: 0, startTime: '10:00', day: 0 });

  useEffect(() => {
    api.get(`/trips/${id}`).then(res => setTrip(res.data)).catch(() => navigate('/trips')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-[48px] text-[var(--text-muted)] text-center font-[500] text-[16px]">Loading builder...</div>;
  if (!trip || !trip.stops || trip.stops.length === 0) return <div className="p-[48px] text-[var(--text-muted)] text-center font-[500]">No destination found.</div>;

  const stop = trip.stops[0]; 
  const totalDays = daysBetween(stop.arrivalDate, stop.departureDate) || 1;
  const activities = stop.activities || [];
  const suggestions = SUGGESTIONS[stop.cityName] || SUGGESTIONS['default'];
  
  const tripBudget = parseMeta(trip.description).budget || 0;
  const currentCost = activities.reduce((s, a) => s + (a.cost || 0), 0);

  const handleOpenForm = (dayIndex, act = null, prefill = null) => {
    if (act) {
      setEditingActId(act.id);
      setForm({
        name: act.name, type: act.type, cost: act.cost || 0,
        startTime: act.startTime || '10:00', day: parseMeta(act.description).day || 0
      });
    } else if (prefill) {
      setEditingActId(null);
      setForm({ name: prefill.name, type: prefill.type || 'sightseeing', cost: prefill.cost || 0, startTime: '10:00', day: dayIndex });
    } else {
      setEditingActId(null);
      setForm({ name: '', type: 'sightseeing', cost: 0, startTime: '10:00', day: dayIndex });
    }
    setIsFormOpen(true);
  };

  const saveActivity = async () => {
    if (!form.name) return;
    const payload = { ...form, description: JSON.stringify({ day: form.day }) };
    
    try {
      let res;
      if (editingActId) {
        res = await api.put(`/activities/${editingActId}`, payload);
        const newActs = activities.map(a => a.id === editingActId ? res.data : a);
        setTrip({ ...trip, stops: [{ ...stop, activities: newActs }] });
      } else {
        res = await api.post(`/stops/${stop.id}/activities`, payload);
        setTrip({ ...trip, stops: [{ ...stop, activities: [...activities, res.data] }] });
      }
      setIsFormOpen(false);
    } catch (err) { console.error(err); }
  };

  const deleteActivity = async (actId) => {
    try {
      await api.delete(`/activities/${actId}`);
      setTrip({ ...trip, stops: [{ ...stop, activities: activities.filter(a => a.id !== actId) }] });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      {/* Builder Header - Spacious */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border)] p-[24px_48px] md:p-[28px_56px] flex flex-col md:flex-row md:items-center justify-between gap-[24px] z-10 shrink-0">
        <div className="flex items-center gap-[16px]">
          <button onClick={() => navigate('/trips')} className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-[var(--text-secondary)] border border-[var(--border-strong)] bg-transparent hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent)] transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-[24px] font-[800] text-[var(--text-primary)] leading-none mb-[6px]">{trip.name}</h1>
            <p className="text-[14px] text-[var(--text-muted)] font-[500] uppercase tracking-wider">Itinerary Builder</p>
          </div>
        </div>
        
        <div className="flex items-center gap-[16px]">
          <div className="bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--r-md)] p-[12px_20px] flex items-center gap-[12px] shadow-sm">
            <Wallet size={18} className="text-[var(--text-muted)]" />
            <span className="text-[15px] font-[700] text-[var(--text-secondary)] mono-num">${currentCost} <span className="text-[var(--text-muted)] font-[500] px-1">of</span> ${tripBudget}</span>
          </div>
          <button onClick={() => navigate(`/trips/${trip.id}`)} className="btn-ghost h-[48px] px-[20px]">Preview Trip</button>
          <button onClick={() => navigate('/trips')} className="btn-primary h-[48px] px-[24px]">Save & Exit</button>
        </div>
      </div>

      {/* Main Content Area - Loosened layout */}
      <div className="flex-1 flex flex-col xl:flex-row gap-[48px] p-[32px_24px] md:p-[48px_56px] max-w-[1600px] mx-auto w-full">
        {/* Left Column: Day-by-Day */}
        <div className="flex-1 flex flex-col max-w-[800px]">
          {Array.from({ length: totalDays }).map((_, dayIdx) => {
            const dayActs = activities.filter(a => (parseMeta(a.description).day || 0) === dayIdx).sort((a,b) => (a.startTime||'').localeCompare(b.startTime||''));
            const date = new Date(stop.arrivalDate);
            date.setDate(date.getDate() + dayIdx);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

            return (
              <div key={dayIdx} className="mb-[48px]">
                {/* Day Section Header */}
                <div className="w-full bg-transparent p-[0_0_16px] flex items-center justify-between border-b-[2px] border-dashed border-[var(--border)] mb-[24px]">
                  <div className="flex items-baseline gap-[12px]">
                    <h2 className="text-[20px] font-[800] text-[var(--text-primary)]">Day {dayIdx + 1}</h2>
                    <span className="text-[15px] text-[var(--text-muted)] font-[500]">— {dateStr}</span>
                  </div>
                  <button onClick={() => handleOpenForm(dayIdx)} className="text-[14px] font-[700] text-[var(--accent)] bg-transparent border-none p-0 hover:text-[#7C3AED] transition-colors">
                    + Add to Day {dayIdx + 1}
                  </button>
                </div>

                <div className="flex flex-col gap-[12px]">
                  {dayActs.length === 0 ? (
                    <div className="border-[2px] border-dashed border-[var(--border)] bg-white rounded-[var(--r-lg)] p-[40px] text-center flex flex-col items-center justify-center min-h-[140px]">
                      <div className="w-[48px] h-[48px] rounded-full bg-[var(--bg-input)] flex items-center justify-center mb-[12px]">
                        <CalIcon size={20} className="text-[var(--text-muted)]" />
                      </div>
                      <p className="text-[15px] text-[var(--text-primary)] font-[600] mb-[4px]">No activities planned yet.</p>
                      <p className="text-[14px] text-[var(--text-muted)]">Drag from ideas panel or add manually.</p>
                    </div>
                  ) : (
                    dayActs.map(act => {
                      const c = getTypeColors(act.type);
                      const barColor = c.split(' ')[0].replace('bg-', 'bg-');
                      const textColor = c.split(' ')[1];
                      const badgeBgColor = c.split(' ')[2].replace('pill-bg-', 'bg-');
                      
                      return (
                        <div key={act.id} className="relative bg-white border border-[var(--border)] rounded-[var(--r-md)] p-[20px_24px] flex items-center gap-[20px] shadow-sm hover:shadow-md hover:border-[var(--border-strong)] transition-all group cursor-pointer" onClick={() => handleOpenForm(dayIdx, act)}>
                          {/* Left Accent Bar */}
                          <div className={`absolute left-[4px] top-[4px] bottom-[4px] w-[4px] rounded-full ${barColor}`}></div>
                          
                          {/* Content */}
                          <div className="text-[14px] font-[600] text-[var(--text-muted)] mono-num min-w-[50px]">{act.startTime || '--:--'}</div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-[8px] sm:gap-[16px] flex-1 min-w-0">
                            <h4 className="text-[16px] font-[700] text-[var(--text-primary)] truncate">{act.name}</h4>
                            <span className={`text-[11px] uppercase font-[800] px-[10px] py-[4px] rounded-full w-fit ${badgeBgColor} ${textColor}`}>{act.type}</span>
                          </div>

                          {/* Right side */}
                          <div className="flex items-center gap-[16px] ml-auto shrink-0">
                            <span className="text-[16px] text-[var(--green)] font-[700] mono-num">${act.cost}</span>
                            <button onClick={(e) => { e.stopPropagation(); deleteActivity(act.id); }} className="w-[32px] h-[32px] rounded-full bg-[var(--bg-input)] text-[var(--text-muted)] flex items-center justify-center hover:bg-[var(--coral-soft)] hover:text-[var(--coral)] transition-colors shrink-0">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}

                  {/* Add Activity Button (Spacious) */}
                  <button onClick={() => handleOpenForm(dayIdx)} className="w-full bg-transparent border-[2px] border-dashed border-[var(--border-strong)] rounded-[var(--r-md)] h-[56px] flex items-center justify-center gap-[12px] mt-[8px] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all group">
                    <Plus size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                    <span className="text-[15px] font-[700] text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">Add Activity</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Panel: Activity Ideas (Spacious layout) */}
        <div className="w-full xl:w-[380px] shrink-0">
          <div className="bg-white border border-[var(--border)] rounded-[var(--r-xl)] shadow-sm sticky top-[40px] overflow-hidden">
            {/* Panel Header */}
            <div className="p-[28px_32px] border-b border-[var(--border)] bg-[var(--bg-input)]/50">
              <h3 className="text-[18px] font-[800] text-[var(--text-primary)] flex items-center gap-[10px]">
                <MapPin size={20} className="text-[var(--accent)]" /> Activity Ideas
              </h3>
              <p className="text-[14px] font-[500] text-[var(--text-muted)] mt-[6px]">Click any idea to add it to your itinerary.</p>
            </div>

            {/* Idea Rows */}
            <div className="flex flex-col p-[16px]">
              {suggestions.map((s, i) => (
                <div key={i} className="p-[16px] border border-transparent rounded-[var(--r-md)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] hover:shadow-sm transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-[16px]">
                    <div className="w-[48px] h-[48px] rounded-full bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center text-[22px] shadow-sm">
                      {s.emoji}
                    </div>
                    <div>
                      <p className="text-[15px] font-[700] text-[var(--text-primary)] leading-tight">{s.name}</p>
                      <p className="text-[13px] text-[var(--green)] font-[600] mt-[4px] mono-num">${s.cost}</p>
                    </div>
                  </div>
                  <button onClick={() => handleOpenForm(0, null, s)} className="w-[36px] h-[36px] rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0 hover:bg-[var(--accent)] hover:text-white transition-all shadow-sm">
                    <Plus size={20} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal (Spacious) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[24px] bg-[var(--text-primary)]/40 backdrop-blur-md animate-[fade-in_0.15s_ease-out]">
          <div className="bg-white rounded-[var(--r-xl)] p-[40px] w-full max-w-[480px] shadow-[var(--shadow-elevated)] border border-[var(--border)]">
            <div className="flex justify-between items-center mb-[32px]">
              <h3 className="text-[24px] font-[800] text-[var(--text-primary)] tracking-tight">{editingActId ? 'Edit Activity' : 'New Activity'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="w-[40px] h-[40px] rounded-full bg-[var(--bg-input)] text-[var(--text-secondary)] flex items-center justify-center hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors"><X size={20} /></button>
            </div>
            
            <div className="space-y-[24px]">
              <div>
                <label className="text-[13px] font-[700] uppercase tracking-wider text-[var(--text-secondary)] mb-[10px] block">Activity Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full text-[16px]" placeholder="What are you doing?" autoFocus />
              </div>

              <div className="grid grid-cols-2 gap-[20px]">
                <div>
                  <label className="text-[13px] font-[700] uppercase tracking-wider text-[var(--text-secondary)] mb-[10px] block">Time</label>
                  <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="w-full text-[16px] mono-num" />
                </div>
                <div>
                  <label className="text-[13px] font-[700] uppercase tracking-wider text-[var(--text-secondary)] mb-[10px] block">Cost ($)</label>
                  <input type="number" value={form.cost} onChange={e => setForm({...form, cost: parseInt(e.target.value)||0})} className="w-full text-[16px] mono-num" />
                </div>
              </div>

              <div>
                <label className="text-[13px] font-[700] uppercase tracking-wider text-[var(--text-secondary)] mb-[10px] block">Day</label>
                <select value={form.day} onChange={e => setForm({...form, day: parseInt(e.target.value)})} className="w-full text-[16px] cursor-pointer">
                  {Array.from({length: totalDays}).map((_, i) => <option key={i} value={i}>Day {i + 1}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[13px] font-[700] uppercase tracking-wider text-[var(--text-secondary)] mb-[10px] block">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full text-[16px] cursor-pointer">
                  {activityTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <button onClick={saveActivity} disabled={!form.name} className="w-full mt-[16px] h-[56px] btn-primary text-[16px]">
                Save Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
