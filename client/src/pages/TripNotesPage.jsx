import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Plus, Edit, Trash2, StickyNote, Save, X } from 'lucide-react';

export default function TripNotesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [newContent, setNewContent] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addContent, setAddContent] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/trips/${id}`), api.get(`/trips/${id}/notes`)])
      .then(([t, n]) => { setTrip(t.data); setNotes(n.data); })
      .catch(() => navigate('/trips'))
      .finally(() => setLoading(false));
  }, [id]);

  const addNote = async (e) => {
    e.preventDefault();
    if (!addContent.trim()) return;
    try {
      const res = await api.post(`/trips/${id}/notes`, { content: addContent });
      setNotes([res.data, ...notes]);
      setAddContent('');
      setShowAdd(false);
    } catch (err) { console.error(err); }
  };

  const updateNote = async (noteId) => {
    try {
      const res = await api.put(`/notes/${noteId}`, { content: newContent });
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

  if (loading) return <div className="p-8 space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-2xl"></div>)}</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <button onClick={() => navigate(`/trips/${id}`)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Trip
      </button>

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

      {/* Add Note Form */}
      {showAdd && (
        <form onSubmit={addNote} className="mb-6 p-4 rounded-2xl bg-surface border border-border animate-[scale-in_0.2s_ease-out]">
          <textarea value={addContent} onChange={e => setAddContent(e.target.value)} rows={4} autoFocus
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Write your note..." />
          <div className="flex gap-2 mt-3 justify-end">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-border text-muted-foreground">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-1"><Save className="w-4 h-4" />Save</button>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 && (
          <div className="text-center py-16 bg-surface rounded-2xl border border-border">
            <StickyNote className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold text-foreground mb-2">No notes yet</p>
            <p className="text-muted-foreground">Start journaling your trip thoughts!</p>
          </div>
        )}
        {notes.map(note => (
          <div key={note.id} className="p-4 rounded-2xl bg-surface border border-border group hover:border-primary/20 transition-colors">
            {editing === note.id ? (
              <div>
                <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <div className="flex gap-2 mt-2 justify-end">
                  <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg border border-border text-sm">Cancel</button>
                  <button onClick={() => updateNote(note.id)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Save</button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-foreground whitespace-pre-wrap">{note.content}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { setEditing(note.id); setNewContent(note.content); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                      <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
