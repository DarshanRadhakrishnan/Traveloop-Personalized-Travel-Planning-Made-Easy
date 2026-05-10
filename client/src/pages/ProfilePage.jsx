import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
  User, Mail, Globe, Trash2, Save, AlertTriangle, MapPin, Plane,
  Camera, X, Plus, Heart, Upload
} from 'lucide-react';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'zh', label: '中文' },
  { value: 'hi', label: 'हिन्दी' },
];

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', language: 'en' });
  const [stats, setStats] = useState({ trips: 0, countries: 0, cities: 0 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [newDest, setNewDest] = useState('');
  const [showAddDest, setShowAddDest] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', language: 'en' });
    }
    // Fetch profile details
    api.get('/auth/me').then(res => {
      if (res.data.language) setForm(f => ({ ...f, language: res.data.language }));
      try {
        const dests = JSON.parse(res.data.savedDestinations || '[]');
        setSavedDestinations(Array.isArray(dests) ? dests : []);
      } catch { setSavedDestinations([]); }
    }).catch(() => {});

    // Fetch stats
    api.get('/trips').then(res => {
      const cities = [...new Set(res.data.flatMap(t => (t.stops || []).map(s => s.cityName)))];
      const countries = [...new Set(res.data.flatMap(t => (t.stops || []).map(s => s.country)))];
      setStats({ trips: res.data.length, countries: countries.length, cities: cities.length });
    }).catch(() => {});
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', { ...form, savedDestinations });
      updateUser(res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.post('/uploads/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ profilePhoto: res.data.profilePhoto });
    } catch (err) { console.error('Upload error:', err); }
    finally { setUploading(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete('/auth/account');
      logout();
      navigate('/login');
    } catch (err) { console.error(err); }
  };

  const addDestination = () => {
    if (!newDest.trim() || savedDestinations.includes(newDest.trim())) return;
    setSavedDestinations([...savedDestinations, newDest.trim()]);
    setNewDest('');
    setShowAddDest(false);
  };

  const removeDestination = (dest) => {
    setSavedDestinations(savedDestinations.filter(d => d !== dest));
  };

  const profilePhotoUrl = user?.profilePhoto;

  return (
    <div className="p-8 max-w-3xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <h1 className="text-3xl font-bold font-[Playfair_Display] text-foreground mb-8">Profile & Settings</h1>

      {/* Avatar & Stats */}
      <div className="flex items-center gap-6 p-6 rounded-2xl bg-surface border border-border mb-8">
        {/* Avatar with upload */}
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer">
            {uploading ? (
              <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
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
            <p className="text-2xl font-bold text-foreground">{stats.cities}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />Cities</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.countries}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3" />Countries</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-5 p-6 rounded-2xl bg-surface border border-border mb-8">
        <h3 className="font-semibold text-foreground mb-4">Edit Profile</h3>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5"><User className="w-4 h-4 inline mr-1" />Name</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5"><Mail className="w-4 h-4 inline mr-1" />Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5"><Globe className="w-4 h-4 inline mr-1" />Language Preference</label>
          <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground">
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Changes'}
        </button>
      </form>

      {/* Saved Destinations */}
      <div className="p-6 rounded-2xl bg-surface border border-border mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" /> Saved Destinations
          </h3>
          <button onClick={() => setShowAddDest(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {savedDestinations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No saved destinations yet. Add your dream locations!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {savedDestinations.map(dest => (
              <span key={dest} className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-foreground text-sm font-medium border border-border hover:border-primary/30 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {dest}
                <button onClick={() => removeDestination(dest)} className="opacity-0 group-hover:opacity-100 ml-0.5 text-red-400 hover:text-red-600 transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add destination inline */}
        {showAddDest && (
          <div className="mt-4 flex gap-2">
            <input type="text" value={newDest} onChange={e => setNewDest(e.target.value)} placeholder="e.g. Tokyo, Paris, Bali..."
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDestination(); } }}
              className="flex-1 px-4 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" autoFocus />
            <button onClick={addDestination} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Add</button>
            <button onClick={() => { setShowAddDest(false); setNewDest(''); }} className="px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
          </div>
        )}
      </div>

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
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium">Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
