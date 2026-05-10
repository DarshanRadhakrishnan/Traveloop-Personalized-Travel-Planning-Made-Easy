import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { User, Mail, Globe, Trash2, Save, AlertTriangle, MapPin, Plane } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', language: 'en' });
  const [stats, setStats] = useState({ trips: 0, countries: 0 });
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', language: 'en' });
    api.get('/trips').then(res => {
      const countries = [...new Set(res.data.flatMap(t => (t.stops || []).map(s => s.country)))];
      setStats({ trips: res.data.length, countries: countries.length });
    }).catch(() => {});
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete('/auth/account');
      logout();
      navigate('/login');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <h1 className="text-3xl font-bold font-[Playfair_Display] text-foreground mb-8">Profile & Settings</h1>

      {/* Avatar & Stats */}
      <div className="flex items-center gap-6 p-6 rounded-2xl bg-surface border border-border mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white text-3xl font-bold">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground">{user?.name}</h2>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.trips}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Plane className="w-3 h-3" />Trips</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.countries}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />Countries</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-5 p-6 rounded-2xl bg-surface border border-border mb-8">
        <h3 className="font-semibold text-foreground mb-4">Edit Profile</h3>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5"><User className="w-4 h-4 inline mr-1" />Name</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5"><Mail className="w-4 h-4 inline mr-1" />Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5"><Globe className="w-4 h-4 inline mr-1" />Language</label>
          <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
          </select>
        </div>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl border-2 border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/5">
        <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. All your trips and data will be permanently removed.</p>
        <button onClick={() => setShowDelete(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium">
          <Trash2 className="w-4 h-4" /> Delete Account
        </button>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md border border-border shadow-2xl animate-[scale-in_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Account?</h3>
            <p className="text-muted-foreground mb-6">This is permanent. All trips, notes, and data will be deleted forever.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 rounded-xl border border-border">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600">Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
