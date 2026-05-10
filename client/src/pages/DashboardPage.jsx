import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Plus, Map } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 bg-background animate-[fade-in_0.4s_ease-out]">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold font-display text-foreground mb-4 tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
          What would you like to do today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Option 1: Plan My Trip */}
        <button 
          onClick={() => navigate('/trips/new')}
          className="group flex flex-col items-center justify-center text-center p-12 bg-surface border-2 border-border rounded-3xl hover:border-primary hover:shadow-[0_20px_40px_rgba(244,163,0,0.15)] transition-all duration-300"
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Plus className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold font-display text-foreground mb-3">Plan My Trip</h2>
          <p className="text-muted-foreground font-medium">Start a new journey, set your vibe, and build your perfect itinerary.</p>
        </button>

        {/* Option 2: My Trips */}
        <button 
          onClick={() => navigate('/trips')}
          className="group flex flex-col items-center justify-center text-center p-12 bg-secondary border-2 border-secondary rounded-3xl hover:shadow-[0_20px_40px_rgba(11,19,43,0.3)] transition-all duration-300 relative overflow-hidden"
        >
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
            <Map className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold font-display text-white mb-3 relative z-10">My Trips</h2>
          <p className="text-white/80 font-medium relative z-10">Manage your upcoming travels and relive your past adventures.</p>
        </button>
      </div>
    </div>
  );
}
