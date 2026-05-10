import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatDateShort, daysBetween, getActivityIcon } from '@/lib/utils';
import { Calendar, MapPin, DollarSign, Clock, Copy, Share2, ExternalLink, Link as LinkIcon, MessageCircle } from 'lucide-react';

export default function PublicTripPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/trips/${id}/public`).then(res => setTrip(res.data)).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [id]);

  const cloneTrip = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await api.post(`/trips/${id}/clone`);
      navigate(`/trips/${res.data.id}/edit`);
    } catch (err) { console.error(err); }
  };

  const shareUrl = window.location.href;
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-8 space-y-4 max-w-4xl mx-auto">{[1,2,3].map(i => <div key={i} className="h-32 skeleton rounded-2xl"></div>)}</div>;
  if (!trip) return null;

  const totalCost = (trip.stops || []).reduce((s, stop) => s + (stop.activities || []).reduce((a, act) => a + (act.cost || 0), 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-72">
        {trip.coverPhoto && <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-4xl mx-auto">
          <p className="text-white/70 text-sm mb-2">Shared by {trip.user?.name || 'Traveler'}</p>
          <h1 className="text-4xl font-bold font-[Playfair_Display] text-white mb-3">{trip.name}</h1>
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDateShort(trip.startDate)} — {formatDateShort(trip.endDate)}</span>
            <span>{(trip.stops || []).length} cities</span>
            <span>${totalCost} total</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* Actions */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <button onClick={cloneTrip}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md">
            <Copy className="w-4 h-4" /> Copy This Trip
          </button>
          <button onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-foreground hover:bg-muted transition-colors">
            <LinkIcon className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <a href={`https://twitter.com/intent/tweet?text=Check out this trip: ${trip.name}&url=${shareUrl}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-foreground hover:bg-muted transition-colors">
            <ExternalLink className="w-4 h-4" /> Share
          </a>
          <a href={`https://wa.me/?text=Check out this trip: ${trip.name} ${shareUrl}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-foreground hover:bg-muted transition-colors">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>

        {/* Itinerary */}
        {trip.description && <p className="text-muted-foreground mb-6">{trip.description}</p>}

        <div className="space-y-6">
          {(trip.stops || []).map((stop, idx) => (
            <div key={stop.id} className="animate-[slide-up_0.4s_ease-out]" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">{stop.flag || '📍'}</div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{stop.cityName}, {stop.country}</h3>
                  <p className="text-sm text-muted-foreground">{formatDateShort(stop.arrivalDate)} — {formatDateShort(stop.departureDate)}</p>
                </div>
              </div>
              <div className="ml-5 pl-8 border-l-2 border-border space-y-2 pb-2">
                {(stop.activities || []).map(act => (
                  <div key={act.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                    <span className="text-lg">{getActivityIcon(act.type)}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{act.name}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        {act.startTime && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{act.startTime}</span>}
                        {act.cost > 0 && <span className="flex items-center gap-0.5"><DollarSign className="w-3 h-3" />${act.cost}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
