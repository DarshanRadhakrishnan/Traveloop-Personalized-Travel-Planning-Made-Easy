import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
  User, Mail, Globe, Trash2, Save, AlertTriangle, MapPin, Plane,
  Camera, X, Plus, Heart, Upload, Check, Edit
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
    api.get('/auth/me').then(res => {
      if (res.data.language) setForm(f => ({ ...f, language: res.data.language }));
      try {
        const dests = JSON.parse(res.data.savedDestinations || '[]');
        setSavedDestinations(Array.isArray(dests) ? dests : []);
      } catch { setSavedDestinations([]); }
    }).catch(() => {});

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
    <div className="p-6 md:p-10 max-w-2xl mx-auto animate-[fade-in_0.3s_ease-out] space-y-6">

      {/* Page Header */}
      <div className="pb-5 border-b border-[var(--border)] mb-2">
        <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Profile & Settings</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative group shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white text-[22px] font-bold">
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
            {uploading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
            ) : (
              <Camera className="w-5 h-5 text-white" />
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>

        {/* Name + Email */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-[18px] font-bold text-[var(--text-primary)]">{user?.name}</h2>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          {[
            { val: stats.trips, label: 'Trips', icon: Plane },
            { val: stats.cities, label: 'Cities', icon: MapPin },
            { val: stats.countries, label: 'Countries', icon: Globe },
          ].map((s, i) => (
            <div key={i} className="bg-[var(--bg-input)] border border-[var(--border)] rounded-full px-3.5 py-1.5 flex flex-col items-center min-w-[60px]">
              <span className="text-base font-bold text-[var(--text-primary)] mono-num leading-none">{s.val}</span>
              <span className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5 flex items-center gap-1"><s.icon className="w-2.5 h-2.5" />{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Section */}
      <form onSubmit={handleSave} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
        {/* Section header */}
        <div className="flex items-center gap-2 pb-3 mb-5 border-b border-[var(--border)]">
          <Edit size={16} className="text-[var(--purple)]" />
          <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">Edit Profile</h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[12px] text-[var(--text-muted)] font-semibold mb-1.5">Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full h-[44px] px-3.5 rounded-lg bg-[#0D1526] border border-[#1E2D45] text-[14px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all" />
          </div>
          <div>
            <label className="block text-[12px] text-[var(--text-muted)] font-semibold mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full h-[44px] px-3.5 rounded-lg bg-[#0D1526] border border-[#1E2D45] text-[14px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all" />
          </div>
          <div>
            <label className="block text-[12px] text-[var(--text-muted)] font-semibold mb-1.5">Language Preference</label>
            <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
              className="w-full h-[44px] px-3.5 rounded-lg bg-[#0D1526] border border-[#1E2D45] text-[14px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all cursor-pointer">
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 h-10 px-5 rounded-lg bg-[var(--accent)] text-[#0D0B1A] font-bold text-[14px] hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-60 border-none">
            <Check className="w-4 h-4" /> {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Saved Destinations */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-[var(--coral)]" />
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">Saved Destinations</h3>
          </div>
          <button onClick={() => setShowAddDest(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] text-[13px] font-semibold hover:bg-[var(--bg-card-hover)] transition-all">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {savedDestinations.length === 0 ? (
          <div className="text-center py-5">
            <span className="text-[28px] block mb-2">🗺️</span>
            <p className="text-[13px] text-[var(--text-muted)]">No saved destinations yet</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {savedDestinations.map(dest => (
              <span key={dest} className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] text-[13px] font-semibold border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                {dest}
                <button onClick={() => removeDestination(dest)} className="opacity-0 group-hover:opacity-100 ml-0.5 text-[var(--coral)] hover:text-[var(--coral)] transition-all bg-transparent border-none p-0 min-h-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {showAddDest && (
          <div className="mt-4 flex gap-2">
            <input type="text" value={newDest} onChange={e => setNewDest(e.target.value)} placeholder="e.g. Tokyo, Paris, Bali..."
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDestination(); } }}
              className="flex-1 h-10 px-3.5 rounded-lg bg-[#0D1526] border border-[#1E2D45] text-[13px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all" autoFocus />
            <button onClick={addDestination} className="h-10 px-4 rounded-lg bg-[var(--accent)] text-[#0D0B1A] text-[13px] font-bold hover:brightness-110 transition-all">Add</button>
            <button onClick={() => { setShowAddDest(false); setNewDest(''); }} className="h-10 px-3 rounded-lg border border-[var(--border)] text-[13px] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] transition-all">Cancel</button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="border border-[var(--coral)]/40 bg-[var(--coral)]/[0.03] rounded-2xl p-6">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[var(--coral)]/20">
          <AlertTriangle size={16} className="text-[var(--amber)]" />
          <h3 className="text-[14px] font-semibold text-[var(--coral)]">Danger Zone</h3>
        </div>
        <p className="text-[13px] text-[var(--text-muted)] mb-4">Once you delete your account, there is no going back. All your trips and data will be permanently removed.</p>
        <button onClick={() => setShowDelete(true)}
          className="flex items-center gap-2 h-10 px-5 rounded-lg bg-[var(--coral-soft)] border border-[var(--coral)] text-[var(--coral)] text-[14px] font-semibold hover:bg-[var(--coral)] hover:text-white transition-all">
          <Trash2 className="w-4 h-4" /> Delete Account
        </button>
      </div>

      {/* Delete Confirm Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-surface)] rounded-2xl p-8 w-full max-w-md border border-[var(--border-strong)] shadow-[var(--shadow-elevated)] animate-[fade-in_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Delete Account?</h3>
            <p className="text-[var(--text-secondary)] text-[14px] mb-6">This is permanent. All trips, notes, and data will be deleted forever.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDelete(false)} className="h-10 px-5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-all text-[14px] font-semibold">Cancel</button>
              <button onClick={handleDelete} className="h-10 px-5 rounded-lg bg-[var(--coral)] text-white font-bold text-[14px] hover:brightness-110 transition-all">Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
