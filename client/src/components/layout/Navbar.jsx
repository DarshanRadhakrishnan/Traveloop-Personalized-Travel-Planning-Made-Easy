import { useAuth } from '@/context/AuthContext';
import { Menu, Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const getPageTitle = (pathname) => {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/trips/new')) return 'Plan a Trip';
  if (pathname.startsWith('/trips')) return 'My Trips';
  if (pathname.startsWith('/search')) return 'Explore Cities';
  if (pathname.startsWith('/activities')) return 'Activities';
  if (pathname.startsWith('/community')) return 'Community';
  if (pathname.startsWith('/profile')) return 'Profile';
  if (pathname.startsWith('/admin')) return 'Admin Panel';
  return '';
};

export default function Navbar({ setMobileOpen }) {
  const { user } = useAuth();
  const location = useLocation();
  const title = getPageTitle(location.pathname);
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-[72px] shrink-0 bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
      <div className="flex items-center gap-5">
        <button onClick={() => setMobileOpen(true)} className="md:hidden w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-all">
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all">
          <Search size={18} />
        </button>
        <button className="relative w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[var(--coral)] border-2 border-[var(--bg-surface)]"></span>
        </button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white flex items-center justify-center text-sm font-bold cursor-pointer hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all ml-1">
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
}
