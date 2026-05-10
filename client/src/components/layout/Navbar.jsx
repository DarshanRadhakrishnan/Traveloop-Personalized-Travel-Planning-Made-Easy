import { useAuth } from '@/context/AuthContext';
import { getGreeting } from '@/lib/utils';
import { Bell, Search } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="flex items-center justify-end px-8 py-4 w-full">

        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl bg-surface border border-border hover:border-primary/50 transition-colors">
            <Search className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2.5 rounded-xl bg-surface border border-border hover:border-primary/50 transition-colors relative">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-surface"></span>
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white font-semibold text-sm ml-2">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
