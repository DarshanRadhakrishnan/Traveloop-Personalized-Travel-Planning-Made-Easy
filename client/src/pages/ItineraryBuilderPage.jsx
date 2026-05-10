import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '@/lib/api';
import { formatDateShort, daysBetween, activityTypes, getActivityIcon } from '@/lib/utils';
import cities from '@/data/cities.json';
import { Plus, GripVertical, Trash2, MapPin, Calendar, Clock, DollarSign, ArrowLeft, Save, Search, X, ChevronDown, ChevronUp, Eye } from 'lucide-react';

function SortableStop({ stop, onDelete, onAddActivity, onDeleteActivity, expanded, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const days = daysBetween(stop.arrivalDate, stop.departureDate);

  return (
    <div ref={setNodeRef} style={style} className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary/20 transition-all">
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={onToggle}>
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground">
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="text-2xl">{stop.flag || '📍'}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{stop.cityName}, <span className="text-muted-foreground font-normal">{stop.country}</span></h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDateShort(stop.arrivalDate)} — {formatDateShort(stop.departureDate)}</span>
            <span>•</span>
            <span>{days} days</span>
            <span>•</span>
            <span>{(stop.activities || []).length} activities</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-4 animate-[slide-down_0.2s_ease-out]">
          {(stop.activities || []).map((act) => (
            <div key={act.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-muted/50 group transition-colors">
              <span className="text-lg">{getActivityIcon(act.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{act.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {act.startTime && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{act.startTime}</span>}
                  {act.cost > 0 && <span className="flex items-center gap-0.5"><DollarSign className="w-3 h-3" />${act.cost}</span>}
                  <span>{act.durationMinutes}min</span>
                </div>
              </div>
              <button onClick={() => onDeleteActivity(act.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <AddActivityForm stopId={stop.id} onAdd={onAddActivity} />
        </div>
      )}
    </div>
  );
}

function AddActivityForm({ stopId, onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'sightseeing', cost: 0, durationMinutes: 60, startTime: '09:00' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      const res = await api.post(`/stops/${stopId}/activities`, form);
      onAdd(stopId, res.data);
      setForm({ name: '', type: 'sightseeing', cost: 0, durationMinutes: 60, startTime: '09:00' });
      setOpen(false);
    } catch (err) { console.error(err); }
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-sm text-primary hover:bg-primary/5 transition-colors w-full">
      <Plus className="w-4 h-4" /> Add Activity
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-4 rounded-xl bg-muted/30 border border-border space-y-3 animate-[scale-in_0.2s_ease-out]">
      <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Activity name"
        className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" autoFocus />
      <div className="grid grid-cols-2 gap-2">
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          {activityTypes.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
        </select>
        <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })} placeholder="Cost"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="relative">
          <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 60 })} placeholder="Duration"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Add</button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted transition-colors">Cancel</button>
      </div>
    </form>
  );
}

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cityModal, setCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [expanded, setExpanded] = useState({});
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    api.get(`/trips/${id}`).then(res => {
      setTrip(res.data);
      if (res.data.stops?.length > 0) setExpanded({ [res.data.stops[0].id]: true });
    }).catch(() => navigate('/trips')).finally(() => setLoading(false));
  }, [id]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = trip.stops.findIndex(s => s.id === active.id);
      const newIndex = trip.stops.findIndex(s => s.id === over.id);
      const newStops = arrayMove(trip.stops, oldIndex, newIndex);
      setTrip({ ...trip, stops: newStops });
      try {
        await api.put(`/trips/${id}/stops/reorder`, { orderedIds: newStops.map(s => s.id) });
      } catch (err) { console.error(err); }
    }
  };

  const addStop = async (city) => {
    try {
      const res = await api.post(`/trips/${id}/stops`, {
        cityName: city.name, country: city.country, lat: city.lat, lng: city.lng, flag: city.flag,
        arrivalDate: trip.startDate, departureDate: trip.endDate,
      });
      setTrip({ ...trip, stops: [...(trip.stops || []), { ...res.data, activities: [] }] });
      setExpanded(prev => ({ ...prev, [res.data.id]: true }));
      setCityModal(false);
      setCitySearch('');
    } catch (err) { console.error(err); }
  };

  const deleteStop = async (stopId) => {
    try {
      await api.delete(`/stops/${stopId}`);
      setTrip({ ...trip, stops: trip.stops.filter(s => s.id !== stopId) });
    } catch (err) { console.error(err); }
  };

  const addActivity = (stopId, activity) => {
    setTrip({
      ...trip,
      stops: trip.stops.map(s => s.id === stopId ? { ...s, activities: [...(s.activities || []), activity] } : s),
    });
  };

  const deleteActivity = async (actId) => {
    try {
      await api.delete(`/activities/${actId}`);
      setTrip({
        ...trip,
        stops: trip.stops.map(s => ({ ...s, activities: (s.activities || []).filter(a => a.id !== actId) })),
      });
    } catch (err) { console.error(err); }
  };

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) || c.country.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 12);

  const totalCost = (trip?.stops || []).reduce((sum, s) => sum + (s.activities || []).reduce((a, act) => a + (act.cost || 0), 0), 0);

  if (loading) return <div className="p-8 space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-2xl"></div>)}</div>;
  if (!trip) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <button onClick={() => navigate(`/trips/${id}`)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Trip
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-[Playfair_Display] text-foreground">{trip.name}</h1>
          <p className="text-muted-foreground">{formatDateShort(trip.startDate)} — {formatDateShort(trip.endDate)} • {(trip.stops || []).length} stops • ${totalCost} total</p>
        </div>
      </div>

      {/* Stops */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={(trip.stops || []).map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 mb-6">
            {(trip.stops || []).map((stop) => (
              <SortableStop key={stop.id} stop={stop}
                expanded={expanded[stop.id]}
                onToggle={() => setExpanded(prev => ({ ...prev, [stop.id]: !prev[stop.id] }))}
                onDelete={() => deleteStop(stop.id)}
                onAddActivity={addActivity}
                onDeleteActivity={deleteActivity}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Stop */}
      <button onClick={() => setCityModal(true)}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary flex items-center justify-center gap-2 transition-all duration-200">
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add Stop</span>
      </button>

      {/* City Search Modal */}
      {cityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]">
          <div className="bg-surface rounded-2xl w-full max-w-lg border border-border shadow-2xl animate-[scale-in_0.2s_ease-out] max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input type="text" value={citySearch} onChange={e => setCitySearch(e.target.value)} placeholder="Search cities..."
                className="flex-1 bg-transparent text-foreground focus:outline-none" autoFocus />
              <button onClick={() => { setCityModal(false); setCitySearch(''); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {filteredCities.map(city => (
                <button key={city.name} onClick={() => addStop(city)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left">
                  <span className="text-2xl">{city.flag}</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{city.name}</p>
                    <p className="text-sm text-muted-foreground">{city.country} • {city.region}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{'$'.repeat(city.costIndex)}</span>
                  <Plus className="w-4 h-4 text-primary" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Save */}
      <div className="fixed bottom-8 right-8 z-30">
        <button onClick={() => navigate(`/trips/${id}`)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all">
          <Eye className="w-5 h-5" /> View Itinerary
        </button>
      </div>
    </div>
  );
}
