import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import cities from '@/data/cities.json';
import { ArrowRight, Check, MapPin, Users, Calendar, ArrowLeft } from 'lucide-react';

const vibesList = ['Adventure', 'Relaxation', 'Culture', 'Food', 'Nightlife', 'Nature', 'Shopping', 'Spiritual'];
const peopleOptions = ['Solo', 'Couple', 'Family', 'Group (5+)'];

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    vibes: [],
    people: 'Solo',
    placeInMind: ''
  });

  // Calendar logic
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const generateDays = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date - tzOffset)).toISOString().split('T')[0];
      days.push(localISOTime);
    }
    return days;
  };

  const handleDateClick = (dateStr) => {
    if (!dateStr) return;
    if (!form.startDate || (form.startDate && form.endDate)) {
      setForm({ ...form, startDate: dateStr, endDate: '' });
    } else {
      if (new Date(dateStr) < new Date(form.startDate)) {
        setForm({ ...form, startDate: dateStr, endDate: '' });
      } else {
        setForm({ ...form, endDate: dateStr });
      }
    }
  };

  const isSelected = (dateStr) => dateStr && (dateStr === form.startDate || dateStr === form.endDate);
  const isInRange = (dateStr) => dateStr && form.startDate && form.endDate && dateStr > form.startDate && dateStr < form.endDate;

  const toggleVibe = (v) => setForm(p => ({ ...p, vibes: p.vibes.includes(v) ? p.vibes.filter(x=>x!==v) : [...p.vibes, v] }));

  // Filter cities for suggestions
  const suggestedCities = cities.filter(c => {
    if (form.placeInMind && !c.name.toLowerCase().includes(form.placeInMind.toLowerCase()) && !c.country.toLowerCase().includes(form.placeInMind.toLowerCase())) return false;
    return true;
  }).slice(0, 12);

  const handleSelectCity = async (city) => {
    setLoading(true);
    try {
      // 1. Create Trip
      const tripRes = await api.post('/trips', {
        name: `Trip to ${city.name}`,
        startDate: form.startDate,
        endDate: form.endDate,
        coverPhoto: city.flag,
        description: JSON.stringify({ type: form.people, vibes: form.vibes })
      });
      
      const tripId = tripRes.data.id;

      // 2. Add Stop
      await api.post(`/trips/${tripId}/stops`, {
        cityName: city.name,
        country: city.country,
        lat: city.lat,
        lng: city.lng,
        flag: city.flag,
        arrivalDate: new Date(form.startDate).toISOString(),
        departureDate: new Date(form.endDate).toISOString()
      });

      // 3. Navigate to Builder
      navigate(`/trips/${tripId}/edit`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background flex flex-col p-4 md:p-8 animate-[fade-in_0.4s_ease-out]">
      {step === 1 && (
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 bg-surface p-8 md:p-12 rounded-[2rem] border border-border shadow-sm">
          {/* Left Column: Questionnaire */}
          <div className="space-y-10">
            <div>
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold mb-8">
                <ArrowLeft className="w-5 h-5" /> Back to Dashboard
              </button>
              <h1 className="text-4xl font-bold font-display text-foreground mb-4">Let's plan your journey.</h1>
              <p className="text-muted-foreground font-medium">Tell us what you're looking for, and we'll help you craft the perfect itinerary.</p>
            </div>

            <div>
              <label className="flex items-center gap-2 font-bold text-foreground mb-4 uppercase tracking-wider text-sm"><Users className="w-4 h-4"/> Who's going?</label>
              <div className="flex flex-wrap gap-3">
                {peopleOptions.map(p => (
                  <button key={p} onClick={() => setForm({...form, people: p})}
                    className={`px-5 py-2.5 rounded-full font-semibold transition-all ${form.people === p ? 'bg-foreground text-background shadow-md' : 'bg-muted text-muted-foreground hover:bg-border'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-foreground mb-4 uppercase tracking-wider text-sm block">What's the vibe?</label>
              <div className="flex flex-wrap gap-3">
                {vibesList.map(v => (
                  <button key={v} onClick={() => toggleVibe(v)}
                    className={`px-5 py-2.5 rounded-full font-semibold transition-all border-2 flex items-center gap-2 ${form.vibes.includes(v) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}>
                    {form.vibes.includes(v) && <Check className="w-4 h-4" />} {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 font-bold text-foreground mb-4 uppercase tracking-wider text-sm"><MapPin className="w-4 h-4"/> Any place in mind?</label>
              <input type="text" placeholder="e.g. Paris, Japan, or leave blank" value={form.placeInMind} onChange={e => setForm({...form, placeInMind: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-muted border-2 border-transparent focus:border-primary outline-none font-medium text-foreground transition-all" />
            </div>
            
            <button 
              onClick={() => setStep(2)}
              disabled={!form.startDate || !form.endDate}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-yellow-500 disabled:opacity-50 transition-all shadow-[0_8px_20px_rgba(244,163,0,0.3)] disabled:shadow-none"
            >
              See Suggestions <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Column: Calendar */}
          <div className="bg-muted/30 rounded-3xl p-6 md:p-8 border border-border flex flex-col justify-center">
            <label className="flex items-center gap-2 font-bold text-foreground mb-6 uppercase tracking-wider text-sm"><Calendar className="w-4 h-4"/> When are you traveling?</label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[currentMonth, new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)].map((m, idx) => (
                <div key={idx}>
                  <h3 className="font-bold text-center mb-4 text-foreground">{m.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['S','M','T','W','T','F','S'].map((d,i) => <span key={i} className="text-xs text-muted-foreground font-bold">{d}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {generateDays(m.getFullYear(), m.getMonth()).map((dateStr, i) => (
                      <button key={i} onClick={() => handleDateClick(dateStr)} disabled={!dateStr}
                        className={`h-10 w-full flex items-center justify-center text-sm font-semibold transition-all relative ${
                          !dateStr ? 'invisible' :
                          isSelected(dateStr) ? 'bg-primary text-primary-foreground rounded-full z-10 scale-110 shadow-md' :
                          isInRange(dateStr) ? 'bg-primary/20 text-primary' :
                          'hover:bg-border text-foreground rounded-full'
                        } ${dateStr === form.startDate ? 'rounded-r-none' : ''} ${dateStr === form.endDate ? 'rounded-l-none' : ''}`}>
                        {dateStr ? parseInt(dateStr.split('-')[2]) : ''}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {!form.startDate || !form.endDate ? (
              <p className="text-center text-muted-foreground font-medium mt-8">Please select a start and end date.</p>
            ) : (
              <p className="text-center text-primary font-bold mt-8">Dates Selected!</p>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-7xl mx-auto w-full animate-[fade-in_0.4s_ease-out]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold mb-4">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <h1 className="text-4xl font-bold font-display text-foreground">Suggested Destinations</h1>
              <p className="text-muted-foreground font-medium mt-2">Based on your {form.vibes.length > 0 ? form.vibes.join(', ') : 'selected'} vibe. Pick a place to start building your itinerary.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {suggestedCities.map(city => (
              <button key={city.name} onClick={() => handleSelectCity(city)} disabled={loading}
                className="group relative h-72 rounded-[2rem] overflow-hidden text-left shadow-sm border border-border hover:shadow-xl transition-all duration-300">
                <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold font-display text-white mb-1 flex items-center gap-2">{city.name}</h3>
                  <p className="text-white/80 font-medium text-sm flex items-center justify-between">
                    <span>{city.country}</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">{city.flag}</span>
                  </p>
                </div>
                {loading && <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}
              </button>
            ))}
          </div>
          {suggestedCities.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold font-display text-foreground mb-2">No destinations found.</h3>
              <p className="text-muted-foreground font-medium">Try removing your search term or selecting different options.</p>
              <button onClick={() => setStep(1)} className="mt-6 px-6 py-3 bg-foreground text-background rounded-xl font-bold">Go Back</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
