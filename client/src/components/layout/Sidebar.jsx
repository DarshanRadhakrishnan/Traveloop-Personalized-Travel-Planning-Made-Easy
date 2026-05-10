import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { LayoutDashboard, Map, Search, Activity, User, LogOut, Sun, Moon, Plane, ListChecks, DollarSign, StickyNote, Shield, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { logout, user } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/trips', icon: Map, label: 'My Trips' },
    { to: '/search', icon: Search, label: 'Explore Cities' },
    { to: '/activities', icon: Activity, label: 'Explore Activities' },
    { to: '/community', icon: Users, label: 'Community' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  if (user?.role === 'admin') {
    links.push({ to: '/admin', icon: Shield, label: 'Admin' });
  }

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside 
      className="fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300"
      style={{ width: collapsed ? '80px' : '256px', backgroundColor: 'var(--sidebar-bg)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
          <Plane className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold text-white font-[Playfair_Display] tracking-tight">Traveloop</span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
              ${isActive ? 'bg-amber-500/15 text-amber-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
            }>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-4">
        <button onClick={toggle}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200">
          {dark ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          {!collapsed && <span className="text-sm font-medium">{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
        <button onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200">
          {collapsed ? <ChevronRight className="w-5 h-5 flex-shrink-0" /> : <ChevronLeft className="w-5 h-5 flex-shrink-0" />}
          {!collapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
