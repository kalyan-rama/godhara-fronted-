import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, Check, X, ShieldAlert } from 'lucide-react';
import Logo from '../../components/layout/Logo';

interface RegisterProps {
  setView: (v: string) => void;
}

export default function Register({ setView }: RegisterProps) {
  const { register, googleLogin } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [errorVal, setErrorVal] = useState('');
  const [successVal, setSuccessVal] = useState('');
  const [loading, setLoading] = useState(false);

  // Email validation & blur lookup
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailMessage, setEmailMessage] = useState({ text: '', isAvailable: true });

  const handleEmailBlur = async () => {
    if (!email) return;
    
    // basic email regex check
    const formatOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!formatOk) {
      setEmailMessage({ text: '⚠️ Incorrect email address syntax format', isAvailable: false });
      return;
    }

    setEmailChecking(true);
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.available) {
        setEmailMessage({ text: '✅ Email is pristine & available for registration', isAvailable: true });
      } else {
        setEmailMessage({ text: '❌ This email address is already in use', isAvailable: false });
      }
    } catch (err) {
      // quiet fallback
    } finally {
      setEmailChecking(false);
    }
  };

  // Password Strength Calculations
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const calculateStrengthScore = () => {
    let score = 0;
    if (hasMinLength) score += 25;
    if (hasUppercase) score += 25;
    if (hasNumber) score += 25;
    if (hasSymbol) score += 25;
    return score;
  };

  const strengthScore = calculateStrengthScore();
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorVal('');
    setSuccessVal('');
    setLoading(true);

    if (!name || !email || !password || !phone) {
      setErrorVal('Please fill out name, email, password, and phone number fields.');
      setLoading(false);
      return;
    }

    if (!passwordsMatch) {
      setErrorVal('Mismatch error: Chosen password & confirm password values are not identical.');
      setLoading(false);
      return;
    }

    if (strengthScore < 100) {
      setErrorVal('Securing policy: Please ensure password fulfills all security rules first.');
      setLoading(false);
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        confirmPassword,
        phone,
        address: {
          street,
          city,
          state: 'Telangana',
          pincode
        }
      });
      setSuccessVal('Vedic account registered successfully! We have dispatched a 24-hours confirmation link. Kindly confirm your mailbox to activate.');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhone('');
      setStreet('');
      setCity('');
      setPincode('');
    } catch (err: any) {
      setErrorVal(err.message || 'Registration failure. Check network settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorVal('');
    setSuccessVal('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/google', { credentials: 'include' });
      const data = await res.json();
      
      if (!res.ok || !data.url) {
        throw new Error(data.message || 'Unable to retrieve Google connection link');
      }

      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popupWindow = window.open(
        data.url,
        'gdh_google_auth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
      );

      if (!popupWindow) {
        throw new Error('Pop-up window was blocked to secure security bounds. Please allow popup windows for this server domain.');
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          const { accessToken, refreshToken, user: authUser } = event.data;
          
          googleLogin(accessToken, refreshToken, authUser);
          setSuccessVal(`🙏 Welcome, ${authUser.name}! Successfully signed in via Google.`);
          
          setTimeout(() => {
            setView('home');
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }, 1200);

          window.removeEventListener('message', handleMessage);
          setLoading(false);
        } else if (event.data?.type === 'OAUTH_AUTH_FAILURE') {
          setErrorVal(event.data.message || 'Google authentication was declined or cancelled.');
          window.removeEventListener('message', handleMessage);
          setLoading(false);
        }
      };

      window.addEventListener('message', handleMessage);

      const pollTimer = setInterval(() => {
        if (popupWindow.closed) {
          clearInterval(pollTimer);
          setLoading((prev) => {
            if (prev) {
              window.removeEventListener('message', handleMessage);
              return false;
            }
            return false;
          });
        }
      }, 1000);

    } catch (err: any) {
      setErrorVal(err.message || 'Failed to start Google connection.');
      setLoading(false);
    }
  };

  const handleLoginNav = () => {
    setView('login');
  };

  return (
    <div className="bg-[#F5EFE6] text-[#2C1810] font-sans min-h-screen py-12 flex items-center justify-center select-none">
      <div className="max-w-md w-full mx-4 bg-white border border-[#D4B896]/60 p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col items-center">
        
        <Logo size={64} className="mb-3" />
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#6B2D0E] mb-1">Create Seva Account</h2>
        <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-6">Join Godhara Traditional Loops</p>

        {errorVal && (
          <div className="w-full bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-lg border border-red-100 mb-5 leading-snug">
            {errorVal}
          </div>
        )}

        {successVal && (
          <div className="w-full bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded-lg border border-emerald-100 mb-5 leading-snug">
            {successVal}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 font-sans">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-stone-500">Your Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Laxman Rao"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-stone-500">Contact Email *</label>
            <input
              type="email"
              required
              placeholder="e.g. laxman@gmail.com"
              value={email}
              onBlur={handleEmailBlur}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailMessage({ text: '', isAvailable: true });
              }}
              className="bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
            />
            {emailChecking && <span className="text-[10px] text-amber-600 animate-pulse font-medium">Checking email availability...</span>}
            {emailMessage.text && (
              <span className={`text-[10px] font-semibold leading-normal ${emailMessage.isAvailable ? 'text-emerald-700' : 'text-red-700'}`}>
                {emailMessage.text}
              </span>
            )}
          </div>

          {/* PASSWORD CONTAINER with Strength Indicator */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-stone-500">Access Password *</label>
            <input
              type="password"
              required
              placeholder="Min 8 characters, capital, digit & symbol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
            />
            
            {/* Real-time checklist strength visualization */}
            {password.length > 0 && (
              <div className="mt-1 bg-stone-50 border border-stone-100 rounded-lg p-2.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-stone-500">
                  <span>PASSWORD HARDNESS STATE:</span>
                  <span className={strengthScore === 100 ? 'text-emerald-700' : 'text-amber-700'}>
                    {strengthScore}% {strengthScore === 100 ? 'EXCELLENT' : 'WEAK'}
                  </span>
                </div>
                {/* Visual score bar */}
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      strengthScore < 50 ? 'bg-red-500' : strengthScore < 100 ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${strengthScore}%` }}
                  />
                </div>
                {/* Guidelines checklist */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1 text-[9px] font-medium text-stone-500">
                  <span className="flex items-center gap-1">
                    {hasMinLength ? <Check size={10} className="text-emerald-600 font-bold" /> : <X size={10} className="text-red-500" />}
                    At least 8 letters
                  </span>
                  <span className="flex items-center gap-1">
                    {hasUppercase ? <Check size={10} className="text-emerald-600 font-bold" /> : <X size={10} className="text-red-500" />}
                    Uppercase letter
                  </span>
                  <span className="flex items-center gap-1">
                    {hasNumber ? <Check size={10} className="text-emerald-600 font-bold" /> : <X size={10} className="text-red-500" />}
                    Digit number (0-9)
                  </span>
                  <span className="flex items-center gap-1">
                    {hasSymbol ? <Check size={10} className="text-emerald-600 font-bold" /> : <X size={10} className="text-red-500" />}
                    Symbol punctuation
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-stone-500">Confirm Chosen Password *</label>
            <input
              type="password"
              required
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
            />
            {confirmPassword.length > 0 && (
              <span className={`text-[10px] font-semibold ${passwordsMatch ? 'text-emerald-700' : 'text-red-700'}`}>
                {passwordsMatch ? '✅ Passwords match correctly' : '❌ Password values do not match yet'}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-stone-500">Contact Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="e.g. +91 9999999999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
            />
          </div>

          <p className="text-[10px] text-stone-400 font-bold uppercase border-b border-stone-100 pb-1 mt-2">Optional Delivery Default</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-[10px] font-bold uppercase text-stone-500">Street / Landmark</label>
              <input
                type="text"
                placeholder="Temple compound"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-stone-500">City / Village</label>
              <input
                type="text"
                placeholder="Hyderabad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-stone-500">PIN Code</label>
              <input
                type="text"
                placeholder="500001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
              />
            </div>
          </div>

           <button
            type="submit"
            disabled={loading || strengthScore < 100 || !passwordsMatch}
            className={`w-full text-white font-bold py-3 rounded-full shadow hover:shadow-md transition-all mt-4 select-none cursor-pointer text-xs ${
              loading || strengthScore < 100 || !passwordsMatch 
                ? 'bg-stone-300 cursor-not-allowed opacity-75' 
                : 'bg-[#6B2D0E] hover:bg-[#E8820C]'
            }`}
          >
            {loading ? 'Creating Sacred Seva Account...' : 'Register Vedic Account'}
          </button>

          <div className="relative my-2 w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D4B896]/30"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-3 text-stone-400 font-bold">Or Connect Via</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-[#D4B896]/60 hover:bg-[#F5EFE6] text-[#2C1810] font-bold py-2.5 px-4 rounded-full transition-all text-xs cursor-pointer"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-xs text-stone-400 mt-6 font-sans">
          Already have a traditional login?{' '}
          <button
            onClick={handleLoginNav}
            className="text-[#6B2D0E] hover:text-[#E8820C] font-bold underline cursor-pointer"
          >
            Sign In Here
          </button>
        </p>

      </div>
    </div>
  );
}
