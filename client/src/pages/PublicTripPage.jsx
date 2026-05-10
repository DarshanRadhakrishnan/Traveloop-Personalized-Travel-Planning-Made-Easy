import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { formatDateShort, daysBetween, getActivityIcon } from '@/lib/utils';
import { Calendar, MapPin, DollarSign, Clock, Copy, Share2, ExternalLink, Link as LinkIcon, MessageCircle, StickyNote } from 'lucide-react';

export default function PublicTripPage() {
  const { id, shareId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    const endpoint = shareId ? `/trips/shared/${shareId}` : `/trips/${id}/public`;
    api.get(endpoint).then(res => setTrip(res.data)).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [id, shareId]);

  const cloneTrip = async () => {
    if (!user) { navigate('/login'); return; }
    setCloning(true);
    try {
      const res = await api.post(`/trips/${trip.id}/clone`);
      navigate(`/trips/${res.data.id}/edit`);
    } catch (err) {
      console.error(err);
      setCloning(false);
    }
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
          <div className="flex items-center gap-2 mb-2">
            {trip.user?.profilePhoto ? (
              <img src={trip.user.profilePhoto} className="w-6 h-6 rounded-full object-cover border border-white/30" alt="" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">{trip.user?.name?.charAt(0) || '?'}</div>
            )}
            <p className="text-white/70 text-sm">Shared by {trip.user?.name || 'Traveler'}</p>
          </div>
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
          <button onClick={cloneTrip} disabled={cloning}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md disabled:opacity-60">
            {cloning ? <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin"></div> : <Copy className="w-4 h-4" />}
            Copy This Trip
          </button>
          <button onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-foreground hover:bg-muted transition-colors">
            <LinkIcon className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <a href={`https://twitter.com/intent/tweet?text=Check out this trip: ${trip.name}&url=${shareUrl}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-foreground hover:bg-muted transition-colors">
            <ExternalLink className="w-4 h-4" /> Tweet
          </a>
          <a href={`https://wa.me/?text=Check out this trip: ${trip.name} ${shareUrl}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-foreground hover:bg-muted transition-colors">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>

        {/* Description */}
        {trip.description && <p className="text-muted-foreground mb-6">{trip.description}</p>}

        {/* Itinerary */}
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

        {/* Notes */}
        {trip.notes && trip.notes.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold font-[Playfair_Display] text-foreground mb-4 flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-primary" /> Trip Notes
            </h2>
            <div className="space-y-3">
              {trip.notes.map(note => (
                <div key={note.id} className="p-4 rounded-2xl bg-surface border border-border">
                  {note.title && <p className="font-medium text-foreground mb-1">{note.title}</p>}
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
