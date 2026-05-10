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
    { to: '/activities', icon: Activity, label: 'Explore Activities' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/community', icon: Users, label: 'Community' },
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
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 bg-[var(--bg-surface)] border-r border-[var(--border)]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
        style={{ width: collapsed ? '80px' : '260px' }}
      >
        {/* Mobile Close Button */}
        <button onClick={() => setMobileOpen(false)} className="md:hidden absolute top-4 -right-14 p-2 bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)] rounded-full shadow-lg">
          <X size={20} />
        </button>

        {/* Logo row (Spacious) */}
        <div className={`h-[80px] flex items-center shrink-0 border-b border-[var(--border)] ${collapsed ? 'justify-center px-0' : 'px-[24px] gap-[16px]'}`}>
          <div className="w-[40px] h-[40px] rounded-[12px] bg-[var(--accent)] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(139,92,246,0.3)]">
            <Plane size={22} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight">Traveloop</span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-[24px] px-[16px] space-y-[8px] overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `h-[48px] px-[16px] rounded-[var(--r-md)] flex items-center gap-[16px] transition-all
                ${collapsed ? 'justify-center px-0 w-full' : ''}
                ${isActive 
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'}`
              }>
              {({ isActive }) => (
                <>
                  <Icon size={20} className={`shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-[var(--accent)]'}`} strokeWidth={2.5} />
                  {!collapsed && <span className="text-[15px] font-semibold">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Section Divider */}
        <div className="mx-[24px] my-[16px] border-t border-[var(--border)] shrink-0"></div>

        {/* Bottom actions */}
        <div className="px-[16px] pb-[24px] space-y-[8px] shrink-0">
          <button onClick={toggle}
            className={`w-full h-[48px] px-[16px] rounded-[var(--r-md)] flex items-center gap-[16px] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-all ${collapsed ? 'justify-center px-0' : ''}`}>
            {dark ? <Sun size={20} className="shrink-0" /> : <Moon size={20} className="shrink-0" />}
            {!collapsed && <span className="text-[14px] font-semibold">Theme</span>}
          </button>
          
          <button onClick={handleLogout}
            className={`w-full h-[48px] px-[16px] rounded-[var(--r-md)] flex items-center gap-[16px] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--coral)] transition-all ${collapsed ? 'justify-center px-0' : ''}`}>
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span className="text-[14px] font-semibold">Logout</span>}
          </button>

          <button onClick={() => setCollapsed(c => !c)}
            className={`hidden md:flex w-full h-[48px] px-[16px] rounded-[var(--r-md)] items-center gap-[16px] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-all ${collapsed ? 'justify-center px-0' : ''}`}>
            {collapsed ? <ChevronRight size={20} className="shrink-0" /> : <ChevronLeft size={20} className="shrink-0" />}
            {!collapsed && <span className="text-[14px] font-semibold">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
