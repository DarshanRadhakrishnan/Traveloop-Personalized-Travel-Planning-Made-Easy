import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft, Plus, Edit, Trash2, StickyNote, Save, X,
  Search, SlidersHorizontal, Filter, ArrowUpDown, ChevronDown,
  Calendar, MapPin
} from 'lucide-react';

export default function TripNotesPage() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [tripId, setTripId] = useState(paramId);
  const [trips, setTrips] = useState([]);
  const [trip, setTrip] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', stopId: '', day: '' });

  // Add note state
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', content: '', stopId: '', day: '' });

  // Toolbar state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, by-stop, by-day, general
  const [sortBy, setSortBy] = useState('newest');
  const [groupBy, setGroupBy] = useState('none');
  const [showDropdown, setShowDropdown] = useState(null);

  // Load trips for selector
  useEffect(() => {
    api.get('/trips').then(res => setTrips(res.data)).catch(() => {});
  }, []);

  // Load trip + notes
  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/trips/${tripId}`), api.get(`/trips/${tripId}/notes`)])
      .then(([t, n]) => { setTrip(t.data); setNotes(n.data); })
      .catch(() => navigate('/trips'))
      .finally(() => setLoading(false));
  }, [tripId]);

  const stops = trip?.stops || [];

  const addNote = async (e) => {
    e.preventDefault();
    if (!addForm.content.trim()) return;
    try {
      const res = await api.post(`/trips/${tripId}/notes`, {
        title: addForm.title,
        content: addForm.content,
        stopId: addForm.stopId || null,
        day: addForm.day ? parseInt(addForm.day) : null,
      });
      setNotes([res.data, ...notes]);
      setAddForm({ title: '', content: '', stopId: '', day: '' });
      setShowAdd(false);
    } catch (err) { console.error(err); }
  };

  const updateNote = async (noteId) => {
    try {
      const res = await api.put(`/notes/${noteId}`, {
        title: editForm.title,
        content: editForm.content,
        stopId: editForm.stopId || null,
        day: editForm.day ? parseInt(editForm.day) : null,
      });
      setNotes(notes.map(n => n.id === noteId ? res.data : n));
      setEditing(null);
    } catch (err) { console.error(err); }
  };

  const deleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) { console.error(err); }
  };

  const startEdit = (note) => {
    setEditing(note.id);
    setEditForm({
      title: note.title || '',
      content: note.content,
      stopId: note.stopId || '',
      day: note.day ? String(note.day) : '',
    });
  };

  // Filter, search, sort
  const processedNotes = useMemo(() => {
    let result = [...notes];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.stop?.cityName || '').toLowerCase().includes(q)
      );
    }

    // Filter
    if (filterBy === 'by-stop') result = result.filter(n => n.stopId);
    if (filterBy === 'by-day') result = result.filter(n => n.day != null);
    if (filterBy === 'general') result = result.filter(n => !n.stopId && n.day == null);

    // Sort
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === 'oldest') result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === 'title') result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    return result;
  }, [notes, searchQuery, filterBy, sortBy]);

  // Group notes
  const groupedNotes = useMemo(() => {
    if (groupBy === 'none') return { '': processedNotes };
    if (groupBy === 'stop') {
      const g = {};
      processedNotes.forEach(n => {
        const key = n.stop ? `${n.stop.flag || '📍'} ${n.stop.cityName}` : '📝 General';
        (g[key] = g[key] || []).push(n);
      });
      return g;
    }
    if (groupBy === 'day') {
      const g = {};
      processedNotes.forEach(n => {
        const key = n.day != null ? `Day ${n.day}` : 'No Day';
        (g[key] = g[key] || []).push(n);
      });
      return g;
    }
    return { '': processedNotes };
  }, [processedNotes, groupBy]);

  const handleTripChange = (newTripId) => {
    setTripId(newTripId);
    navigate(`/trips/${newTripId}/notes`, { replace: true });
  };

  if (loading) return <div className="p-8 space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-2xl"></div>)}</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <button onClick={() => navigate(`/trips/${tripId}`)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Trip
      </button>

      {/* Trip Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">Select Trip</label>
        <select value={tripId} onChange={e => handleTripChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
          {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-[Playfair_Display] text-foreground">Trip Notes</h1>
          <p className="text-muted-foreground">{trip?.name} • {notes.length} notes</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Note
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl bg-surface border border-border">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>

        {/* Group By */}
        <div className="relative">
          <button onClick={() => setShowDropdown(showDropdown === 'group' ? null : 'group')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Group <ChevronDown className="w-3 h-3" />
          </button>
          {showDropdown === 'group' && (
            <div className="absolute top-full mt-1 right-0 z-20 bg-surface border border-border rounded-xl shadow-xl p-1 min-w-[140px] animate-[scale-in_0.15s_ease-out]">
              {[['none', 'No Grouping'], ['stop', 'By Stop'], ['day', 'By Day']].map(([val, label]) => (
                <button key={val} onClick={() => { setGroupBy(val); setShowDropdown(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${groupBy === val ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="relative">
          <button onClick={() => setShowDropdown(showDropdown === 'filter' ? null : 'filter')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Filter className="w-3.5 h-3.5" /> Filter <ChevronDown className="w-3 h-3" />
          </button>
          {showDropdown === 'filter' && (
            <div className="absolute top-full mt-1 right-0 z-20 bg-surface border border-border rounded-xl shadow-xl p-1 min-w-[140px] animate-[scale-in_0.15s_ease-out]">
              {[['all', 'All Notes'], ['by-stop', 'By Stop'], ['by-day', 'By Day'], ['general', 'General']].map(([val, label]) => (
                <button key={val} onClick={() => { setFilterBy(val); setShowDropdown(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterBy === val ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button onClick={() => setShowDropdown(showDropdown === 'sort' ? null : 'sort')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort <ChevronDown className="w-3 h-3" />
          </button>
          {showDropdown === 'sort' && (
            <div className="absolute top-full mt-1 right-0 z-20 bg-surface border border-border rounded-xl shadow-xl p-1 min-w-[140px] animate-[scale-in_0.15s_ease-out]">
              {[['newest', 'Newest First'], ['oldest', 'Oldest First'], ['title', 'By Title']].map(([val, label]) => (
                <button key={val} onClick={() => { setSortBy(val); setShowDropdown(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === val ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex gap-2 mb-6">
        {[['all', 'All'], ['by-day', 'By Day'], ['by-stop', 'By Stop']].map(([val, label]) => (
          <button key={val} onClick={() => setFilterBy(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filterBy === val
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Add Note Form */}
      {showAdd && (
        <form onSubmit={addNote} className="mb-6 p-5 rounded-2xl bg-surface border border-border animate-[scale-in_0.2s_ease-out] space-y-4">
          <h3 className="font-bold text-foreground text-lg">New Note</h3>
          <input type="text" value={addForm.title} onChange={e => setAddForm({ ...addForm, title: e.target.value })} placeholder="Note title (e.g., Hotel check-in details)"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" autoFocus />
          <textarea value={addForm.content} onChange={e => setAddForm({ ...addForm, content: e.target.value })} rows={4}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Write your note..." />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1"><MapPin className="w-3 h-3 inline mr-1" />Stop (optional)</label>
              <select value={addForm.stopId} onChange={e => setAddForm({ ...addForm, stopId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm">
                <option value="">No specific stop</option>
                {stops.map(s => <option key={s.id} value={s.id}>{s.flag || '📍'} {s.cityName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1"><Calendar className="w-3 h-3 inline mr-1" />Day # (optional)</label>
              <input type="number" min="1" value={addForm.day} onChange={e => setAddForm({ ...addForm, day: e.target.value })} placeholder="e.g., 3"
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-1 hover:bg-primary/90 transition-colors"><Save className="w-4 h-4" />Save</button>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-6">
        {Object.entries(groupedNotes).map(([group, groupNotes]) => (
          <div key={group}>
            {group && (
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                {group}
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary normal-case">{groupNotes.length}</span>
              </h3>
            )}
            <div className="space-y-3">
              {groupNotes.map(note => (
                <div key={note.id} className="p-5 rounded-2xl bg-surface border border-border group hover:border-primary/20 hover:shadow-md transition-all duration-200">
                  {editing === note.id ? (
                    <div className="space-y-3">
                      <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="Note title"
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      <textarea value={editForm.content} onChange={e => setEditForm({ ...editForm, content: e.target.value })} rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      <div className="grid grid-cols-2 gap-3">
                        <select value={editForm.stopId} onChange={e => setEditForm({ ...editForm, stopId: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm">
                          <option value="">No stop</option>
                          {stops.map(s => <option key={s.id} value={s.id}>{s.flag || '📍'} {s.cityName}</option>)}
                        </select>
                        <input type="number" min="1" value={editForm.day} onChange={e => setEditForm({ ...editForm, day: e.target.value })} placeholder="Day #"
                          className="px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                        <button onClick={() => updateNote(note.id)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Title */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          {note.title ? (
                            <h4 className="font-semibold text-foreground">
                              {note.title}
                              {note.stop && <span className="text-muted-foreground font-normal"> — {note.stop.flag || '📍'} {note.stop.cityName} stop</span>}
                            </h4>
                          ) : note.stop ? (
                            <h4 className="font-medium text-muted-foreground">{note.stop.flag || '📍'} {note.stop.cityName} stop</h4>
                          ) : null}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all ml-2 flex-shrink-0">
                          <button onClick={() => startEdit(note)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Edit">
                            <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </button>
                          <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>

                      {/* Meta */}
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(note.createdAt)}</span>
                        {note.day != null && <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted">Day {note.day}</span>}
                        {note.stop && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                            <MapPin className="w-3 h-3" />{note.stop.cityName}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {processedNotes.length === 0 && (
          <div className="text-center py-16 bg-surface rounded-2xl border border-border">
            <StickyNote className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold text-foreground mb-2">No notes found</p>
            <p className="text-muted-foreground">{searchQuery ? 'Try a different search term' : 'Start journaling your trip thoughts!'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
