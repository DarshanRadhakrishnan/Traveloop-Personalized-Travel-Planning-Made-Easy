import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Plane, Eye, EyeOff, ArrowRight, MapPin } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Hero Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-amber-400/30 blur-3xl"></div>
          <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-amber-300/10 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold font-[Playfair_Display]">Traveloop</span>
          </div>
          <h1 className="text-5xl font-bold font-[Playfair_Display] leading-tight mb-6">
            Your next<br />
            <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">adventure</span><br />
            starts here
          </h1>
          <p className="text-lg text-slate-300 max-w-md mb-12">
            Plan multi-city trips, track budgets, build itineraries, and share your journeys — all in one beautiful platform.
          </p>

          {/* Floating city cards */}
          <div className="flex gap-4">
            {[
              { city: 'Paris', flag: '🇫🇷', color: 'from-blue-500 to-indigo-600' },
              { city: 'Tokyo', flag: '🇯🇵', color: 'from-rose-500 to-pink-600' },
              { city: 'Bali', flag: '🇮🇩', color: 'from-emerald-500 to-teal-600' },
            ].map((c) => (
              <div key={c.city} className={`px-4 py-3 rounded-2xl bg-gradient-to-br ${c.color} bg-opacity-20 backdrop-blur-sm border border-white/10 animate-[slide-up_0.5s_ease-out]`}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">{c.flag} {c.city}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-background">
        <div className="w-full max-w-md animate-[fade-in_0.4s_ease-out]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-[Playfair_Display] text-foreground">Traveloop</span>
          </div>

          <h2 className="text-3xl font-bold font-[Playfair_Display] text-foreground mb-2">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isLogin ? 'Enter your credentials to continue your journey' : 'Start planning your dream trips today'}
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-[scale-in_0.2s_ease-out]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Alex Wanderer" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="hello@traveloop.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-12"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 disabled:opacity-60">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-primary hover:text-primary/80 font-semibold transition-colors">
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo:</strong> demo@traveloop.com / demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
