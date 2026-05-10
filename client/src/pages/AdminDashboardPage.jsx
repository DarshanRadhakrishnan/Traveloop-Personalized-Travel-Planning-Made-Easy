import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { Users, Map, MapPin, Activity, Shield, ArrowLeft } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return; }
    api.get('/admin/stats').then(res => setStats(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="p-8 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-32 skeleton rounded-2xl"></div>)}</div>;
  if (!stats) return null;

  const cityData = (stats.popularCities || []).slice(0, 8).map(c => ({ name: c.cityName, count: c._count.id }));

  return (
    <div className="p-8 max-w-6xl mx-auto animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-[Playfair_Display] text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform analytics and management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Total Trips', value: stats.totalTrips, icon: Map, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Total Stops', value: stats.totalStops, icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Total Activities', value: stats.totalActivities, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(stat => (
          <div key={stat.label} className="p-5 rounded-2xl bg-surface border border-border">
            <div className={`p-2.5 rounded-xl ${stat.bg} w-fit mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-border">
          <h3 className="font-semibold text-foreground mb-4">Most Popular Cities</h3>
          {cityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-center py-16">No data yet</p>}
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border">
          <h3 className="font-semibold text-foreground mb-4">Recent Users</h3>
          <div className="overflow-y-auto max-h-[300px] space-y-2">
            {(stats.recentUsers || []).map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white text-sm font-semibold">
                  {u.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <span className="text-xs text-muted-foreground">{u._count?.trips || 0} trips</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${u.role === 'admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-muted text-muted-foreground'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
