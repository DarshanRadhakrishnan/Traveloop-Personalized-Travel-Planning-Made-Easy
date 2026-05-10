import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { LayoutDashboard, Map, Search, Activity, User, LogOut, Sun, Moon, Plane, Shield, ChevronLeft, ChevronRight, X, Users } from 'lucide-react';
import { useEffect } from 'react';

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { logout, user } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/trips', icon: Map, label: 'My Trips' },
    { to: '/search', icon: Search, label: 'Explore Cities' },
    { to: '/activities', icon: Activity, label: 'Activities' },
    { to: '/community', icon: Users, label: 'Community' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  if (user?.role === 'admin') {
    links.push({ to: '/admin', icon: Shield, label: 'Admin' });
  }

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{
          width: collapsed ? '80px' : '260px',
          background: 'linear-gradient(180deg, #1C1835 0%, #141125 100%)',
          borderRight: '1px solid var(--border-strong)',
        }}
      >
        <button onClick={() => setMobileOpen(false)} className="md:hidden absolute top-5 -right-12 w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--text-secondary)] flex items-center justify-center">
          <X size={18} />
        </button>

        {/* Logo */}
        <div className={`h-[80px] flex items-center shrink-0 border-b border-[var(--border)] ${collapsed ? 'justify-center px-0' : 'px-6 gap-4'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(124,58,237,0.4)]">
            <Plane size={22} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          {!collapsed && <span className="text-[22px] font-extrabold text-white tracking-tight">Traveloop</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `h-[46px] px-4 rounded-xl flex items-center gap-4 transition-all font-medium text-[14px]
                ${collapsed ? 'justify-center px-0 w-full' : ''}
                ${isActive
                  ? 'bg-gradient-to-r from-[#7C3AED]/20 to-transparent text-[var(--accent)] border-l-[3px] border-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border-l-[3px] border-transparent'}`
              }>
              {({ isActive }) => (
                <>
                  <Icon size={20} className={`shrink-0 ${isActive ? 'text-[var(--accent)]' : ''}`} strokeWidth={2} />
                  {!collapsed && <span>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-5 border-t border-[var(--border)] shrink-0"></div>

        {/* Bottom */}
        <div className="px-3 py-5 space-y-1 shrink-0">
          <button onClick={toggle}
            className={`w-full h-[46px] px-4 rounded-xl flex items-center gap-4 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-all text-[14px] font-medium ${collapsed ? 'justify-center px-0' : ''}`}>
            {dark ? <Sun size={20} className="shrink-0" /> : <Moon size={20} className="shrink-0" />}
            {!collapsed && <span>Theme</span>}
          </button>
          <button onClick={handleLogout}
            className={`w-full h-[46px] px-4 rounded-xl flex items-center gap-4 text-[var(--text-muted)] hover:bg-[var(--coral-soft)] hover:text-[var(--coral)] transition-all text-[14px] font-medium ${collapsed ? 'justify-center px-0' : ''}`}>
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button onClick={() => setCollapsed(c => !c)}
            className={`hidden md:flex w-full h-[46px] px-4 rounded-xl items-center gap-4 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-all text-[14px] font-medium ${collapsed ? 'justify-center px-0' : ''}`}>
            {collapsed ? <ChevronRight size={20} className="shrink-0" /> : <ChevronLeft size={20} className="shrink-0" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
