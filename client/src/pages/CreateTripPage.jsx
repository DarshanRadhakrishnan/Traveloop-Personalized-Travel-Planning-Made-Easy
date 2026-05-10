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
    <div className="p-8 md:p-12 lg:p-16 max-w-5xl mx-auto animate-[fade-in_0.3s_ease-out] w-full">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors text-lg">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-[Playfair_Display] text-foreground mb-4">Create New Trip</h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-12">Fill in the details to start planning your adventure.</p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-base md:text-lg font-medium text-foreground mb-2">Trip Name *</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-5 py-4 text-lg rounded-xl border border-border bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
            placeholder="e.g., European Summer Adventure" />
        </div>

        <div>
          <label className="block text-base md:text-lg font-medium text-foreground mb-2">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
            className="w-full px-5 py-4 text-lg rounded-xl border border-border bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none shadow-sm"
            placeholder="Describe your trip..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base md:text-lg font-medium text-foreground mb-2">
              <Calendar className="w-5 h-5 inline mr-2" />Start Date *
            </label>
            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-5 py-4 text-lg rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm" />
          </div>
          <div>
            <label className="block text-base md:text-lg font-medium text-foreground mb-2">
              <Calendar className="w-5 h-5 inline mr-2" />End Date *
            </label>
            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-5 py-4 text-lg rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm" />
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-base md:text-lg font-medium text-foreground mb-4">
            <Image className="w-5 h-5 inline mr-2" />Cover Photo
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {coverOptions.map((url) => (
              <button key={url} type="button" onClick={() => setForm({ ...form, coverPhoto: url })}
                className={`h-32 md:h-40 rounded-2xl overflow-hidden border-4 transition-all shadow-md ${form.coverPhoto === url ? 'border-primary ring-4 ring-primary/30 scale-[1.02]' : 'border-transparent hover:border-primary/40'}`}>
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 px-8 mt-8 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-lg font-semibold flex items-center justify-center gap-3 transition-all shadow-xl shadow-amber-500/25 disabled:opacity-60">
          {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save className="w-5 h-5" />Create Trip & Start Planning</>}
        </button>
      </form>
    </div>
  );
}
