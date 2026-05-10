import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Plane, Eye, EyeOff, Phone, Lock, User, Heart, Users, Mountain, Building, Utensils, TreePine, Crown, Camera } from 'lucide-react';

// Reusable Input Component
const Input = ({ label, icon: Icon, rightIcon, error, ...props }) => (
  <div className="flex flex-col gap-[7px]">
    <label className="text-[12px] font-semibold text-[#64748B] tracking-[0.04em] uppercase font-sans">{label}</label>
    <div className="relative">
      <input 
        {...props}
        className={`w-full h-[44px] px-[14px] rounded-[12px] border-[1.5px] border-[#EDE9E4] bg-[#FAFAF9] text-[#0F172A] text-[14px] font-sans placeholder:text-[#C4BFBA] focus:outline-none focus:border-[#F59E0B] focus:bg-[#FFFDF9] transition-colors ${rightIcon ? 'pr-[40px]' : ''}`}
      />
      {rightIcon && <div className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#C4BFBA]">{rightIcon}</div>}
    </div>
  </div>
);

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Signup State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  
  // Extra signup state (UI only for now)
  const [country, setCountry] = useState('');
  const [dob, setDob] = useState('');
  const [travelerType, setTravelerType] = useState('');
  const [interests, setInterests] = useState([]);
  const [budget, setBudget] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please fill in all fields');
    
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(`${firstName} ${lastName}`, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!firstName || !lastName || !email || !password || !confirmPassword) return setError('Please fill all fields');
      if (password !== confirmPassword) return setError('Passwords do not match');
      if (password.length < 8) return setError('Password must be at least 8 characters');
    }
    if (step === 2 && !travelerType) return setError('Please select a traveler type');
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const toggleInterest = (i) => {
    if (interests.includes(i)) setInterests(interests.filter(x => x !== i));
    else setInterests([...interests, i]);
  };

  // Password strength calculator
  const getPwStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0, 1, 2, or 3
  };
  const pwStrength = getPwStrength();



  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-[#FFFFFF] border-[0.5px] border-[#F0E8DC] rounded-[24px] px-[48px] py-[48px]">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-[32px]">
          <div className="w-[56px] h-[56px] rounded-full bg-[#F59E0B] flex items-center justify-center mb-4">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-[26px] font-bold font-[Playfair_Display] text-[#0F172A] mb-1">Traveloop</h1>
          <p className="text-[13px] text-[#94A3B8] font-sans">Your journey begins here</p>
        </div>

        {/* Tab Switcher (Only visible on Login or Step 1 Signup) */}
        {(isLogin || (!isLogin && step === 1)) && (
          <div className="flex bg-[#F5F0EA] rounded-[12px] p-[4px] mb-[32px]">
            <button 
              type="button"
              onClick={() => { setIsLogin(true); setError(''); setStep(1); }}
              className={`flex-1 py-2 text-[14px] font-medium font-sans transition-all ${isLogin ? 'bg-white border-[0.5px] border-[#EDE9E4] rounded-[9px] text-[#0F172A] shadow-sm' : 'text-[#94A3B8]'}`}
            >
              Sign in
            </button>
            <button 
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-[14px] font-medium font-sans transition-all ${!isLogin ? 'bg-white border-[0.5px] border-[#EDE9E4] rounded-[9px] text-[#0F172A] shadow-sm' : 'text-[#94A3B8]'}`}
            >
              Create account
            </button>
          </div>
        )}

        {/* Signup Progress Bar */}
        {!isLogin && (
          <div className="flex items-center justify-between mb-[28px]">
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <div key={s} className={`w-[28px] h-[4px] rounded-[2px] transition-colors ${step >= s ? 'bg-[#F59E0B]' : 'bg-[#EDE9E4]'}`} />
              ))}
            </div>
            <span className="text-[11px] font-medium text-[#94A3B8] font-sans">Step {step} of 3</span>
          </div>
        )}

        {error && (
          <div className="mb-[20px] text-[12px] text-[#E24B4A] text-center font-medium">{error}</div>
        )}

        {/* === SIGN IN FLOW === */}
        {isLogin && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-[20px]">
            <Input label="EMAIL ADDRESS" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            
            <div className="flex flex-col gap-[7px]">
              <label className="text-[12px] font-semibold text-[#64748B] tracking-[0.04em] uppercase font-sans">PASSWORD</label>
              <div className="relative">
                <input 
                  type={showPw ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full h-[44px] px-[14px] pr-[40px] rounded-[12px] border-[1.5px] border-[#EDE9E4] bg-[#FAFAF9] text-[#0F172A] text-[14px] font-sans placeholder:text-[#C4BFBA] focus:outline-none focus:border-[#F59E0B] focus:bg-[#FFFDF9] transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#C4BFBA]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-[6px]">
                <button type="button" className="text-[12px] font-semibold text-[#F59E0B]">Forgot password?</button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full h-[48px] bg-[#F59E0B] hover:bg-[#E8920A] text-white text-[15px] font-semibold rounded-[14px] font-sans transition-colors mt-[12px]">
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>

            <p className="text-[11px] text-[#C4BFBA] text-center font-sans mt-[8px]">Demo: demo@traveloop.com / demo123</p>

            <div className="text-center mt-[12px]">
              <p className="text-[13px] text-[#94A3B8] font-sans">
                Don't have an account? <button type="button" onClick={() => setIsLogin(false)} className="text-[#F59E0B] font-semibold">Sign up</button>
              </p>
            </div>
          </form>
        )}

        {/* === SIGN UP FLOW === */}
        {!isLogin && (
          <form onSubmit={step === 3 ? handleSignupSubmit : (e) => { e.preventDefault(); nextStep(); }} className="flex flex-col gap-[20px]">
            
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-[14px]">
                  <Input label="FIRST NAME" placeholder="Alex" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  <Input label="LAST NAME" placeholder="Wanderer" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
                <Input label="EMAIL ADDRESS" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                <Input label="PHONE NUMBER" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} rightIcon={<Phone className="w-4 h-4" />} />
                
                <div className="flex flex-col gap-[7px]">
                  <label className="text-[12px] font-semibold text-[#64748B] tracking-[0.04em] uppercase font-sans">PASSWORD</label>
                  <div className="relative">
                    <input 
                      type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full h-[44px] px-[14px] pr-[40px] rounded-[12px] border-[1.5px] border-[#EDE9E4] bg-[#FAFAF9] text-[#0F172A] text-[14px] font-sans placeholder:text-[#C4BFBA] focus:outline-none focus:border-[#F59E0B] focus:bg-[#FFFDF9] transition-colors"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#C4BFBA]">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password Strength */}
                  {password && (
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3].map(lvl => (
                        <div key={lvl} className={`h-1 flex-1 rounded-full ${pwStrength >= lvl ? (pwStrength === 1 ? 'bg-red-400' : pwStrength === 2 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-[#EDE9E4]'}`} />
                      ))}
                    </div>
                  )}
                </div>

                <Input label="CONFIRM PASSWORD" type={showConfirmPw ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} rightIcon={<button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}><Lock className="w-4 h-4" /></button>} />
                
                <button type="submit" className="w-full h-[48px] bg-[#F59E0B] hover:bg-[#E8920A] text-white text-[15px] font-semibold rounded-[14px] font-sans transition-colors mt-[12px]">Continue →</button>
              </>
            )}

            {/* Step 2: Travel Profile */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-[14px]">
                  <div className="flex flex-col gap-[7px]">
                    <label className="text-[12px] font-semibold text-[#64748B] tracking-[0.04em] uppercase font-sans">COUNTRY</label>
                    <select value={country} onChange={e => setCountry(e.target.value)} className="w-full h-[44px] px-[14px] rounded-[12px] border-[1.5px] border-[#EDE9E4] bg-[#FAFAF9] text-[#0F172A] text-[14px] font-sans focus:outline-none focus:border-[#F59E0B] focus:bg-[#FFFDF9] appearance-none cursor-pointer">
                      <option value="" disabled>Select</option>
                      <option value="us">United States</option>
                      <option value="uk">United Kingdom</option>
                      <option value="in">India</option>
                      <option value="au">Australia</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Input label="DATE OF BIRTH" type="date" value={dob} onChange={e => setDob(e.target.value)} />
                </div>

                <div className="flex flex-col gap-[12px] mt-2">
                  <label className="text-[12px] font-semibold text-[#64748B] tracking-[0.04em] uppercase font-sans">I TRAVEL AS</label>
                  <div className="grid grid-cols-2 gap-[14px]">
                    {[
                      { id: 'solo', label: 'Solo', icon: User },
                      { id: 'couple', label: 'Couple', icon: Heart },
                      { id: 'family', label: 'Family', icon: Users },
                      { id: 'group', label: 'Group', icon: Users }
                    ].map(type => (
                      <button key={type.id} type="button" onClick={() => setTravelerType(type.id)}
                        className={`flex items-center gap-2 px-[8px] py-[9px] rounded-[10px] border-[1.5px] transition-colors ${travelerType === type.id ? 'border-[#F59E0B] bg-[#FFFBEF] text-[#92400E]' : 'border-[#EDE9E4] bg-[#FAFAF9] text-[#0F172A]'}`}>
                        <type.icon className="w-4 h-4 text-[#F59E0B]" />
                        <span className="text-[14px] font-medium font-sans">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-[14px] mt-[12px]">
                  <button type="button" onClick={prevStep} className="flex-1 h-[48px] border-[1.5px] border-[#F59E0B] text-[#F59E0B] bg-transparent hover:bg-[#FFFBEF] text-[15px] font-semibold rounded-[14px] font-sans transition-colors">Back</button>
                  <button type="submit" className="flex-1 h-[48px] bg-[#F59E0B] hover:bg-[#E8920A] text-white text-[15px] font-semibold rounded-[14px] font-sans transition-colors">Continue →</button>
                </div>
              </>
            )}

            {/* Step 3: Travel Interests */}
            {step === 3 && (
              <>
                <div className="flex flex-col gap-[12px]">
                  <label className="text-[12px] font-semibold text-[#64748B] tracking-[0.04em] uppercase font-sans">TRAVEL INTERESTS</label>
                  <div className="grid grid-cols-3 gap-[10px]">
                    {[
                      { id: 'adventure', label: 'Adventure', icon: Mountain },
                      { id: 'culture', label: 'Culture', icon: Building },
                      { id: 'food', label: 'Food', icon: Utensils },
                      { id: 'nature', label: 'Nature', icon: TreePine },
                      { id: 'luxury', label: 'Luxury', icon: Crown },
                      { id: 'photo', label: 'Photo', icon: Camera }
                    ].map(int => (
                      <button key={int.id} type="button" onClick={() => toggleInterest(int.id)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-[10px] rounded-[10px] border-[1.5px] transition-colors ${interests.includes(int.id) ? 'border-[#F59E0B] bg-[#FFFBEF] text-[#92400E]' : 'border-[#EDE9E4] bg-[#FAFAF9] text-[#0F172A]'}`}>
                        <int.icon className={`w-5 h-5 ${interests.includes(int.id) ? 'text-[#F59E0B]' : 'text-[#94A3B8]'}`} />
                        <span className="text-[12px] font-medium font-sans">{int.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-[7px] mt-2">
                  <label className="text-[12px] font-semibold text-[#64748B] tracking-[0.04em] uppercase font-sans">TYPICAL TRIP BUDGET</label>
                  <select value={budget} onChange={e => setBudget(e.target.value)} className="w-full h-[44px] px-[14px] rounded-[12px] border-[1.5px] border-[#EDE9E4] bg-[#FAFAF9] text-[#0F172A] text-[14px] font-sans focus:outline-none focus:border-[#F59E0B] focus:bg-[#FFFDF9] appearance-none cursor-pointer">
                    <option value="" disabled>Select typical budget</option>
                    <option value="budget">Budget — under $500</option>
                    <option value="mid">Mid-range — $500 to $2,000</option>
                    <option value="premium">Premium — $2,000 to $5,000</option>
                    <option value="luxury">Luxury — $5,000+</option>
                  </select>
                </div>

                <div className="flex gap-[14px] mt-[12px]">
                  <button type="button" onClick={prevStep} disabled={loading} className="flex-1 h-[48px] border-[1.5px] border-[#F59E0B] text-[#F59E0B] bg-transparent hover:bg-[#FFFBEF] text-[15px] font-semibold rounded-[14px] font-sans transition-colors disabled:opacity-50">Back</button>
                  <button type="submit" disabled={loading} className="flex-[2] h-[48px] bg-[#F59E0B] hover:bg-[#E8920A] text-white text-[15px] font-semibold rounded-[14px] font-sans transition-colors disabled:opacity-70">
                    {loading ? 'Creating...' : 'Start exploring →'}
                  </button>
                </div>

                <div className="text-center mt-[20px]">
                  <p className="text-[13px] text-[#94A3B8] font-sans">
                    Already have an account? <button type="button" onClick={() => { setIsLogin(true); setStep(1); }} className="text-[#F59E0B] font-semibold">Sign in</button>
                  </p>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
