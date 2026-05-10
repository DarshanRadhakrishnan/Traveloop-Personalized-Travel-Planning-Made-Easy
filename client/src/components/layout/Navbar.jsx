import { useAuth } from '@/context/AuthContext';
import { Menu, Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const getPageTitle = (pathname) => {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/trips/new')) return 'Plan a Trip';
  if (pathname.startsWith('/trips')) return 'My Trips';
  if (pathname.startsWith('/search')) return 'Explore Cities';
  if (pathname.startsWith('/activities')) return 'Activities';
  if (pathname.startsWith('/profile')) return 'Profile';
  if (pathname.startsWith('/admin')) return 'Admin Panel';
  return '';
};

export default function Navbar({ setMobileOpen }) {
  const { user } = useAuth();
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-[80px] shrink-0 bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center justify-between px-[24px] md:px-[56px] sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-[20px]">
        <button 
          onClick={() => setMobileOpen(true)}
          className="md:hidden w-[44px] h-[44px] rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-all"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-[20px] font-[700] text-[var(--text-primary)]">{title}</h1>
      </div>

      <div className="flex items-center gap-[16px]">
        <button className="w-[44px] h-[44px] rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent)] transition-all shadow-sm">
          <Search size={20} />
        </button>

        <button className="relative w-[44px] h-[44px] rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent)] transition-all shadow-sm">
          <Bell size={20} />
          {/* Notification dot */}
          <span className="absolute top-[10px] right-[10px] w-[10px] h-[10px] rounded-full bg-[var(--coral)] border-[2px] border-[var(--bg-surface)]"></span>
        </button>

        <div className="w-[44px] h-[44px] rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)] flex items-center justify-center text-[15px] font-[700] cursor-pointer hover:bg-[var(--accent)] hover:text-[#FFFFFF] transition-all ml-[8px]">
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
}
