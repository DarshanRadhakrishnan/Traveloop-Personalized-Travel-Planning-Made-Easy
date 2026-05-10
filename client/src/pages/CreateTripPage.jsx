import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { ArrowLeft, Calendar, Image, Save } from 'lucide-react';

const coverOptions = [
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
];

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '', coverPhoto: coverOptions[0] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.startDate || !form.endDate) {
      setError('Trip name, start date, and end date are required');
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('End date must be after start date');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/trips', form);
      navigate(`/trips/${res.data.id}/edit`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-3xl font-bold font-[Playfair_Display] text-foreground mb-2">Create New Trip</h1>
      <p className="text-muted-foreground mb-8">Fill in the details to start planning your adventure</p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Trip Name *</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            placeholder="e.g., European Summer Adventure" />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
            placeholder="Describe your trip..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />Start Date *
            </label>
            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />End Date *
            </label>
            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Image className="w-4 h-4 inline mr-1" />Cover Photo
          </label>
          <div className="grid grid-cols-3 gap-3">
            {coverOptions.map((url) => (
              <button key={url} type="button" onClick={() => setForm({ ...form, coverPhoto: url })}
                className={`h-24 rounded-xl overflow-hidden border-2 transition-all ${form.coverPhoto === url ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-border hover:border-primary/50'}`}>
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-60">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save className="w-4 h-4" />Create Trip & Start Planning</>}
        </button>
      </form>
    </div>
  );
}
