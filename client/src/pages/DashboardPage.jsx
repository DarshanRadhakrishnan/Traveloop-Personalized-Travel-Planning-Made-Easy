import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Plus, Map } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center p-8 md:p-16 animate-[fade-in_0.4s_ease-out]">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-4 tracking-tight leading-tight">
          Welcome back, <span className="bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Traveler'}</span>.
        </h1>
        <p className="text-lg text-[var(--text-secondary)] font-medium max-w-lg mx-auto">
          What would you like to do today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        <button
          onClick={() => navigate('/trips/new')}
          className="group flex flex-col items-center justify-center text-center p-12 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-3xl hover:border-[var(--accent)] hover:shadow-[0_0_40px_rgba(124,58,237,0.15)] transition-all duration-300"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#A78BFA]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Plus className="w-9 h-9 text-[var(--accent)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Plan My Trip</h2>
          <p className="text-[var(--text-secondary)] text-sm">Start a new journey and build your perfect itinerary.</p>
        </button>

        <button
          onClick={() => navigate('/trips')}
          className="group flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] rounded-3xl hover:shadow-[0_0_40px_rgba(124,58,237,0.3)] transition-all duration-300"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Map className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">My Trips</h2>
          <p className="text-white/70 text-sm">Manage upcoming travels and relive past adventures.</p>
        </button>
      </div>
    </div>
  );
}
